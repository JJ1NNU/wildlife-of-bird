import type { GameData, Phase } from '@wb/schema';
import { phaseAt } from './calendar.ts';
import { nextChance } from './rng.ts';
import { mapNode } from './step.ts';
import type { Choice, LogEntry, Nest, NestSiteCard, RunState } from './types.ts';

/**
 * 둥지 자리 관문 `nestSite` — 04-breeding 4장. `nestSite` 첫 단계, 흐름의 마지막에 열린다.
 * 둥지는 지금 장소에 짓고, 둥지 국면 동안 옮길 수 없다(1장).
 * 잠정(#21): 짝 지시 `patrol`(경쟁 확률 보정)과 구멍별 둥지 손실 위험%(3.2)는 짝 지시·둥지 손실 조각에서.
 * 짝 없이 `nestSite`에 들어가면 관문을 열지 않는다 — 4.5 분할 해제는 그 조각에서.
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
 * 잠정(#21): 독립(점수·계승)은 그 조각에서 — 지금은 `postFledge`가 끝나면 그냥 거둔다.
 */
export function releaseNest(state: RunState): RunState {
  if (!state.nest || nestLocked(state)) return state;
  const phase = phaseAt(state.calendar, state.at);
  if (phase === 'postFledge' && (state.nest.chicks ?? 0) > 0) return state;
  const { nest: _n, ...rest } = state;
  return rest;
}

/** 지금 장소에서 고를 수 있는 구멍 id (`habitatAny`가 있으면 장소 서식지와 겹쳐야) */
export function nestHoles(data: GameData, nodeId: string): string[] {
  const habitats = mapNode(data, nodeId).habitats;
  return Object.entries(data.breeding.nestSite.holes)
    .filter(([, h]) => !h.habitatAny || h.habitatAny.some((x) => habitats.includes(x)))
    .map(([id]) => id);
}

/** 경쟁 구멍을 차지할 확률 — 봄 경쟁 등급 `none`이면 1, 아니면 이벤트 판정과 같은 식 (4장) */
export function contestChance(data: GameData, state: RunState): number {
  const tier = mapNode(data, state.node).seasons.spring.competition;
  if (tier === 'none') return 1;
  const ns = data.breeding.nestSite;
  const e = data.formulas.events;
  const difficulty = data.effects.checkDifficulty[ns.contestDifficulty[tier]];
  const stat = state.player.stats[ns.contestStat] ?? 0;
  return Math.min(
    e.checkMax,
    Math.max(e.checkMin, e.checkBase + e.checkPerPoint * (stat - difficulty)),
  );
}

export function nestChoices(holes: string[]): Choice[] {
  return holes.map((id) => ({
    id: `nestSite.${id}`,
    kind: 'nestSite',
    label: HOLE_LABEL[id] ?? id,
  }));
}

/** 화면 S-23 카드 — 경쟁 구멍이면 차지할 확률 */
export function nestCards(data: GameData, state: RunState, holes: string[]): NestSiteCard[] {
  return holes.map((id) => ({
    choiceId: `nestSite.${id}`,
    hole: id,
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
  return { state: { ...state, rng, nest }, log };
}
