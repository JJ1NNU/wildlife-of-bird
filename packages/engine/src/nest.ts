import type { GameData, Phase } from '@wb/schema';
import { phaseAt } from './calendar.ts';
import { nestLoss } from './formulas.ts';
import { orderValue } from './order.ts';
import { parentingNestLossMult } from './parenting.ts';
import { nextChance } from './rng.ts';
import { seasonEffect } from './season.ts';
import { mapNode, periodRiskFactor, speciesBalance } from './step.ts';
import type { Choice, LogEntry, Nest, NestSiteCard, RunState } from './types.ts';

/**
 * 둥지 자리 관문 `nestSite` — 04-breeding 4장. `nestSite` 첫 단계, 흐름의 마지막에 열린다.
 * 둥지는 지금 장소에 짓고, 둥지 국면 동안 옮길 수 없다(1장).
 * 짝 없이 `nestSite`에 들어가면 관문을 열지 않고 4.5대로 분할 해제한다(api.ts).
 */

/** 둥지가 있는 동안 옮길 수 없는 국면 (1장 — `postFledge`부터 풀린다) */
const NEST_PHASES: readonly Phase[] = ['nestSite', 'laying', 'incubation', 'nestling'];

/** 잠정(#21): 화면 글은 콘텐츠의 `data/text/`가 생기면 그리로 옮긴다 */
const HOLE_LABEL: Record<string, string> = {
  deep: '깊은 나무구멍',
  shallow: '얕은 구멍',
  nestBox: '인공새집',
};

/** 둥지 때문에 지금 옮길 수 없나 */
export function nestLocked(state: RunState): boolean {
  return state.nest !== undefined && NEST_PHASES.includes(phaseAt(state.calendar, state.at));
}

/**
 * 둥지 국면을 벗어났으면 둥지를 거둔다 — 다음 단계로 간 뒤 부른다.
 * 새끼가 살아 있으면 `postFledge` 동안은 남긴다(급이·새끼 사망이 이어진다, 01-formulas 2.4·3.3). 옮기기는 풀린다.
 * 거둘 때 새끼가 남아 있었는지를 `broodFledged`에 적는다 — 다음 해 이혼 확률(04-breeding 2.1).
 * 새끼가 독립하면(`postFledge` 마지막 단계) 계승 관문이 먼저 둥지를 거둔다(`inherit.ts`).
 */
export function releaseNest(state: RunState): RunState {
  if (!state.nest || nestLocked(state)) return state;
  const phase = phaseAt(state.calendar, state.at);
  if (phase === 'postFledge' && (state.nest.chicks ?? 0) > 0) return state;
  const { nest: _n, ...rest } = state;
  return { ...rest, broodFledged: (state.nest.chicks ?? 0) > 0 };
}

/** 지금 장소에서 고를 수 있는 구멍 id (`habitatAny`가 있으면 장소 서식지와 겹쳐야) */
export function nestHoles(data: GameData, nodeId: string): string[] {
  const habitats = mapNode(data, nodeId).habitats;
  return Object.entries(data.breeding.nestSite.holes)
    .filter(([, h]) => !h.habitatAny || h.habitatAny.some((x) => habitats.includes(x)))
    .map(([id]) => id);
}

/** 경쟁 구멍을 차지할 확률 — 봄 경쟁 등급 `none`이면 1, 아니면 이벤트 판정과 같은 식 (4장). `patrol` 수락이면 1 (3.5) */
export function contestChance(data: GameData, state: RunState): number {
  const tier = mapNode(data, state.node).seasons.spring.competition;
  if (tier === 'none') return 1;
  const ns = data.breeding.nestSite;
  const e = data.formulas.events;
  const difficulty = data.effects.checkDifficulty[ns.contestDifficulty[tier]];
  const stat = state.player.stats[ns.contestStat] ?? 0;
  const p = Math.min(
    e.checkMax,
    Math.max(e.checkMin, e.checkBase + e.checkPerPoint * (stat - difficulty)),
  );
  return orderValue(state, 'mateOrder.patrol', p, 1);
}

export function nestChoices(holes: string[]): Choice[] {
  return holes.map((id) => ({
    id: `nestSite.${id}`,
    kind: 'nestSite',
    label: HOLE_LABEL[id] ?? id,
  }));
}

/** 화면 S-23 카드 — 구멍마다 둥지 손실 위험(4장), 경쟁 구멍이면 차지할 확률 */
export function nestCards(data: GameData, state: RunState, holes: string[]): NestSiteCard[] {
  return holes.map((id) => ({
    choiceId: `nestSite.${id}`,
    hole: id,
    nestLoss: nestLossChance(state, data, id),
    ...(data.breeding.nestSite.holes[id]?.contested
      ? { contestChance: contestChance(data, state) }
      : {}),
  }));
}

/** 구멍을 고른다. 경쟁에 지면 `shallow` — 시간 손해 없음 (BR-5) */
export function buildNest(
  state: RunState,
  choiceId: string,
  data: GameData,
): { state: RunState; log: LogEntry[] } {
  const chosen = choiceId.slice('nestSite.'.length);
  const hole = data.breeding.nestSite.holes[chosen];
  if (!hole) throw new Error(`없는 둥지 자리다: ${choiceId}`);
  let rng = state.rng;
  let site = chosen;
  const log: LogEntry[] = [];
  const chance = hole.contested ? contestChance(data, state) : 1;
  if (chance < 1) {
    const won = nextChance(rng, chance);
    rng = won.state;
    if (!won.value) {
      site = 'shallow';
      log.push({
        at: state.at,
        type: 'nest',
        text: '구멍을 빼앗겨 얕은 구멍에 지었다',
        cause: 'contest',
      });
    }
  }
  if (site === chosen)
    log.push({ at: state.at, type: 'nest', text: `${HOLE_LABEL[site] ?? site}에 둥지를 지었다` });
  const nest: Nest = { site, node: state.node };
  return { state: { ...state, rng, nest, yearNests: (state.yearNests ?? 0) + 1 }, log };
}

/**
 * 둥지 손실 확률 1단계분 (04-breeding 6.3): 3.2 × 구멍 · `guardNest` · 육아 방침 · 계절 방침 배율. 난수 없음.
 * 위험 보정은 지금 시기의 `riskMod` — S-23 카드(`nestSite` 국면)에서는 지시·방침 배율이 아직 1이다.
 */
export function nestLossChance(state: RunState, data: GameData, site: string): number {
  const guard = data.breeding.orders.guardNest?.nestLossMult ?? 1;
  return (
    nestLoss(data.formulas, speciesBalance(data, state.config.speciesId), {
      vigilance: state.player.stats.vigilance ?? 0,
      ...(state.mate ? { mateVigilance: state.mate.stats.vigilance ?? 0 } : {}),
      riskModFactor: periodRiskFactor(state, data),
    }) *
    (data.breeding.nestSite.holes[site]?.nestLossMult ?? 1) *
    orderValue(state, 'mateOrder.guardNest', 1, guard) *
    parentingNestLossMult(state, data) *
    (seasonEffect(state, data).nestLossMult ?? 1)
  );
}

/**
 * 둥지 손실 — 알이나 새끼가 둥지에 있는 단계(`laying` `incubation` `nestling`)마다 1번(01-formulas 3.2).
 * 확률이 칸의 행동과 무관해 단계당 1번 굴린다(새끼 사망과 같은 까닭, 9.4). 알은 산란수 관문 뒤에 생기므로
 * `laying` 첫 단계에는 굴리지 않는다. 구멍 · 짝 지시 `guardNest` · 육아 방침(`clean`·`early`)의 배율을 건다(04-breeding 6.3).
 * 위험 보정은 그 시기의 `riskMod`(03-events 6.1). 손실이면 B-5: 둥지를 거둔다.
 */
export function nestSurvives(
  state: RunState,
  data: GameData,
): { state: RunState; log: LogEntry[] } {
  const nest = state.nest;
  const phase = phaseAt(state.calendar, state.at);
  if (!nest || nest.eggs === undefined || !NEST_PHASES.includes(phase) || phase === 'nestSite') {
    return { state, log: [] };
  }
  const r = nextChance(state.rng, nestLossChance(state, data, nest.site));
  if (!r.value) return { state: { ...state, rng: r.state }, log: [] };
  const { nest: _n, ...rest } = state;
  return {
    state: { ...rest, rng: r.state },
    log: [{ at: state.at, type: 'brood', text: '둥지를 잃었다', cause: 'nestLoss' }],
  };
}
