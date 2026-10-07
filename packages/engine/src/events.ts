import type {
  Effect,
  EffectsTable,
  EventWhen,
  Formulas,
  GameData,
  GameEvent,
  Phase,
} from '@wb/schema';
import { phaseAt } from './calendar.ts';
import { fatCap, statGain } from './formulas.ts';
import { nextChance } from './rng.ts';
import { growthNow, mapNode, speciesBalance } from './step.ts';
import type { LogEntry, RunState } from './types.ts';

/**
 * 이벤트 해석기 — 조건(`when`) · 후보 · 가중치 추첨 · 판정형 선택지의 성공 확률 · 효과 (03-events 3~6장).
 * 잠정(#21): 루틴에 연결(칸마다 추첨 · 이벤트 관문 · `replan`)과 효과 `injury`·`fledgeEarly`는 다음 조각.
 */

/** `when`을 판단하는 데 쓰는 지금 상태 (03-events 4장) */
export interface EventContext {
  phase: Phase;
  /** 지금 단계가 그 국면이 이어지는 마지막 단계인가 */
  phaseLastStep: boolean;
  habitats: readonly string[];
  period: number;
  sex: 'female' | 'male';
  age: number;
  hasMate: boolean;
  hasBrood: boolean;
  /** 에너지 / 지방 상한 */
  energyRatio: number;
  /** 이 단계에 고른 행동 id */
  actions: readonly string[];
}

/** 다음 단계의 국면 — 해를 넘기면 단계표의 첫 단계 */
function nextPhase(calendar: Phase[][], at: RunState['at']): Phase | undefined {
  const steps = calendar[at.period - 1] ?? [];
  if (at.step < steps.length) return steps[at.step];
  return calendar[at.period % calendar.length]?.[0];
}

/** 선택 id → 행동 id (`action.forage` → `forage`, `action.train.flight` → `train`, `move.<장소>` → `move`) */
function actionOf(choiceId: string): string {
  const [head, action] = choiceId.split('.');
  return head === 'move' ? 'move' : (action ?? choiceId);
}

/** 상태 → `when` 판단 재료. `choiceIds` = 이 단계 루틴의 칸 */
export function eventContext(
  state: RunState,
  data: GameData,
  choiceIds: readonly string[],
): EventContext {
  const phase = phaseAt(state.calendar, state.at);
  const nest = state.nest;
  const brood = nest ? (nest.chicks ?? nest.eggs ?? 0) : 0;
  return {
    phase,
    phaseLastStep: nextPhase(state.calendar, state.at) !== phase,
    habitats: mapNode(data, state.node).habitats,
    period: state.at.period,
    sex: state.player.sex,
    age: state.player.age,
    hasMate: state.mate !== undefined,
    hasBrood: brood > 0,
    energyRatio: state.player.energy / fatCap(data.formulas, state.player.stats.stamina ?? 0),
    actions: choiceIds.map(actionOf),
  };
}

/** 적힌 조건이 모두 참인가 (03-events 4장). 비어 있으면 늘 참 */
export function whenHolds(when: EventWhen, c: EventContext): boolean {
  const { periodFrom: from, periodTo: to } = when;
  const inPeriod =
    from === undefined || to === undefined
      ? true
      : from <= to
        ? from <= c.period && c.period <= to
        : c.period >= from || c.period <= to;
  return (
    inPeriod &&
    (when.phaseAny === undefined || when.phaseAny.includes(c.phase)) &&
    (when.phaseLastStep === undefined || when.phaseLastStep === c.phaseLastStep) &&
    (when.habitatAny === undefined || when.habitatAny.some((h) => c.habitats.includes(h))) &&
    (when.sex === undefined || when.sex === c.sex) &&
    (when.ageMin === undefined || c.age >= when.ageMin) &&
    (when.ageMax === undefined || c.age <= when.ageMax) &&
    (when.hasMate === undefined || when.hasMate === c.hasMate) &&
    (when.hasBrood === undefined || when.hasBrood === c.hasBrood) &&
    (when.energyBelow === undefined || c.energyRatio < when.energyBelow) &&
    (when.actionAny === undefined || when.actionAny.some((a) => c.actions.includes(a)))
  );
}

/**
 * 후보 — 그 추첨 종류이고, 조작 개체의 종이 있고, 조건이 참이고, 쿨다운이 끝난 이벤트 (03-events 3.1 2).
 * `cooldown` = 이벤트 id → 다시 나올 수 있을 때까지 남은 단계 수 (없거나 0이면 통과)
 */
export function eventCandidates(
  events: readonly GameEvent[],
  draw: GameEvent['draw'],
  speciesId: string,
  c: EventContext,
  cooldown: Readonly<Record<string, number>> = {},
): GameEvent[] {
  return events.filter(
    (e) =>
      e.draw === draw &&
      e.species.includes(speciesId) &&
      whenHolds(e.when, c) &&
      (cooldown[e.id] ?? 0) <= 0,
  );
}

/** 가중치 `effects.eventWeight[weight]` 비례로 `u`(0~1)가 고른 이벤트 (03-events 3.1 4). 후보가 없으면 없음 */
export function pickEvent(
  candidates: readonly GameEvent[],
  weights: EffectsTable['eventWeight'],
  u: number,
): GameEvent | undefined {
  const w = candidates.map((e) => weights[e.weight] ?? 0);
  let x = u * w.reduce((a, b) => a + b, 0);
  for (const [i, e] of candidates.entries()) {
    x -= w[i] ?? 0;
    if (x < 0) return e;
  }
  return undefined;
}

/** 판정형 선택지의 성공 확률 (03-events 5.2). `stat` = 조작 개체의 현재값 */
export function checkChance(f: Formulas, stat: number, difficulty: number): number {
  const e = f.events;
  return Math.min(
    e.checkMax,
    Math.max(e.checkMin, e.checkBase + e.checkPerPoint * (stat - difficulty)),
  );
}

/**
 * 효과를 배열 순서대로 적용한다 (03-events 6.1). 중간에 조작 개체가 죽으면 남은 효과는 버리고 `death`에 원인.
 * 에너지 0 이하는 아사(`starvation`), `deathRisk`는 `u < 값`이면 `cause`(`predation`이면 `predation:<predator>`).
 * `riskMod`·`foodMod`는 `periodMods`에 쌓는다 — 시기가 바뀌면 지워진다.
 * `broodRisk`가 맞거나 `chickLoss`로 새끼가 다 죽으면 B-5: 둥지를 거두고 로그 `brood`(`cause` = 효과 이름).
 * `chickLoss`는 늦게 깬 새끼부터 죽는다 — 잠정(#21, 명세에 누가 죽는지 없음).
 */
export function applyEffects(
  state: RunState,
  effects: readonly Effect[],
  data: GameData,
): { state: RunState; death?: string; log: LogEntry[] } {
  const f = data.formulas;
  const t = data.effects;
  const log: LogEntry[] = [];
  let s = state;
  for (const e of effects) {
    const p = s.player;
    const mods = s.periodMods ?? { risk: [], food: [] };
    switch (e.type) {
      case 'energy': {
        const d = e.sign === 'gain' ? t.energy[e.tier] : -t.energy[e.tier];
        const energy = Math.min(fatCap(f, p.stats.stamina ?? 0), p.energy + d);
        if (energy <= 0)
          return { state: { ...s, player: { ...p, energy: 0 } }, death: 'starvation', log };
        s = { ...s, player: { ...p, energy } };
        break;
      }
      case 'feather': {
        const d = e.sign === 'gain' ? t.feather[e.tier] : -t.feather[e.tier];
        const feather = Math.min(f.feather.max, Math.max(0, p.feather + d));
        s = { ...s, player: { ...p, feather } };
        break;
      }
      case 'statGain': {
        const potential = p.potential[e.stat] ?? 0;
        const current = p.stats[e.stat] ?? 0;
        const gain = statGain(f, speciesBalance(data, p.speciesId), {
          stat: e.stat,
          base: t.statGain[e.tier],
          potential,
          current,
          growthMult: growthNow(f, p),
        });
        const stats = { ...p.stats, [e.stat]: Math.min(potential, current + gain) };
        s = { ...s, player: { ...p, stats } };
        break;
      }
      case 'bond': {
        if (!s.mate) break;
        const d = e.sign === 'gain' ? t.bond[e.tier] : -t.bond[e.tier];
        s = { ...s, mate: { ...s.mate, bond: Math.min(100, Math.max(0, s.mate.bond + d)) } };
        break;
      }
      case 'deathRisk': {
        const rolled = nextChance(s.rng, t.deathRisk[e.tier]);
        s = { ...s, rng: rolled.state };
        if (rolled.value)
          return { state: s, death: e.predator ? `${e.cause}:${e.predator}` : e.cause, log };
        break;
      }
      case 'riskMod':
        s = { ...s, periodMods: { ...mods, risk: [...mods.risk, e.tier] } };
        break;
      case 'foodMod':
        s = { ...s, periodMods: { ...mods, food: [...mods.food, { tier: e.tier, sign: e.sign }] } };
        break;
      case 'broodRisk': {
        if (!s.nest) break;
        const rolled = nextChance(s.rng, t.broodRisk[e.tier]);
        s = { ...s, rng: rolled.state };
        if (rolled.value) s = broodFails(s, '둥지를 잃었다', 'broodRisk', log);
        break;
      }
      case 'chickLoss': {
        const nest = s.nest;
        const chicks = nest?.chicks ?? 0;
        if (!nest || chicks === 0) break;
        const dead = Math.min(chicks, Math.ceil(chicks * t.chickLoss[e.tier]));
        if (dead === chicks) {
          s = broodFails(s, '새끼를 모두 잃었다', 'chickLoss', log);
          break;
        }
        const young = nest.young?.slice(0, chicks - dead);
        s = { ...s, nest: { ...nest, chicks: chicks - dead, ...(young ? { young } : {}) } };
        log.push({ at: s.at, type: 'nest', text: `새끼 ${dead}마리를 잃었다` });
        break;
      }
      default:
        throw new Error(`잠정(#21): 아직 해석하지 않는 효과다: ${e.type}`);
    }
  }
  return { state: s, log };
}

/** B-5 — 둥지를 거두고 로그를 남긴다 */
function broodFails(state: RunState, text: string, cause: string, log: LogEntry[]): RunState {
  const { nest: _n, ...rest } = state;
  log.push({ at: state.at, type: 'brood', text, cause });
  return rest;
}
