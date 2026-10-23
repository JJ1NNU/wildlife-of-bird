import type { CardId, GameData, GameEvent, StatName } from '@wb/schema';
import { cardCost, cardOf, drawHand, type Hand } from './cards.ts';
import { drawStepEvent } from './events.ts';
import { seasonOf } from './formulas.ts';
import { endLife } from './inherit.ts';
import { nextFloat, seedFromString } from './rng.ts';
import { judgeStep, slotCount, speciesBalance, stepChoices } from './step.ts';
import type { Choice, LogEntry, RunState } from './types.ts';

/**
 * 행동 루틴 — 칸 하나 = `act` 하나 (00-core-loop 3.5, 03-contracts 3장 '행동 루틴').
 * 칸을 채우는 `act`는 적어 두기만 하고(판정·난수 없음), 마지막 칸을 채우는 `act`가 칸마다 판정 1→2→3을 굴린다.
 * 칸마다 판정 뒤 단계 이벤트를 추첨하고(루틴당 1개), 당첨되면 루틴이 멈춘다 — 선택지를 고르면 남은 칸을 다시 채운다(`replan`).
 */

/** 이 루틴의 칸 수 — 이벤트로 멈췄으면 멈출 때 고정한 값 (01-formulas 9.6) */
export function routineSlots(state: RunState, data: GameData): number {
  return state.paused?.slots ?? slotCount(state, data);
}

/** 지금 채워야 하는 칸 수 — 다시 채우기면 남은 칸 수 */
export function emptySlots(state: RunState, data: GameData): number {
  return routineSlots(state, data) - (state.paused?.done ?? 0);
}

/**
 * 이 단계의 패 (12-card-turn 2.2·11장). 이벤트로 멈췄으면 멈출 때 남은 패.
 * 루틴을 짜기 시작한 상태(칸 수·경험·장소·계절)로 뽑고, 난수는 본 난수열이 아니라 런 시드 + 단계에서 따로 만든다 —
 * 관문·판정의 난수 순서가 그대로이고, 같은 시드 = 같은 패
 */
export function stepHand(state: RunState, data: GameData): Hand {
  if (state.paused) return state.paused.hand;
  const { speciesId, seed } = state.config;
  const { year, period, step } = state.at;
  const at = {
    slots: slotCount(state, data),
    expYears: state.player.expYears,
    node: state.node,
    season: seasonOf(speciesBalance(data, speciesId), period),
  };
  const rng = seedFromString(`${speciesId}:${seed}:hand:${year}.${period}.${step}`);
  return drawHand(data.cards, at, rng).hand;
}

/** 늘 있는 카드 — 옮기기와 함께 패에 없어도 고를 수 있다 (2.3). 패에 있으면 패의 것을 먼저 쓴다 */
const ALWAYS: ReadonlySet<CardId> = new Set(['forage', 'rest']);

/** 패에서 고른 칸들을 뺀 남은 패 */
function spend(hand: Hand, ids: string[]): Hand {
  const left = { ...hand };
  for (const id of ids) {
    const card = cardOf(id);
    if (card && left[card]) left[card] -= 1;
  }
  return left;
}

/** 지금 남은 패 — 채운 칸을 뺀다 (`view.routine.hand`) */
export function handLeft(state: RunState, data: GameData): Hand {
  return spend(stepHand(state, data), state.routine ?? []);
}

/** 패에 남지 않은 카드의 칸 선택을 막는다 (12-card-turn 11장 v1: 선택지 id 그대로, 패 밖은 `disabled`) */
export function limitToHand(choices: Choice[], hand: Hand): Choice[] {
  return choices.map((c) => {
    const card = cardOf(c.id);
    if (c.disabled || !card || ALWAYS.has(card) || (hand[card] ?? 0) > 0) return c;
    return { ...c, disabled: { reason: '패에 없음' } };
  });
}

/** 한 칸이 단계 예산에서 쓰는 카드 비용 (12-card-turn 3장·3.1). 쉬기·옮기기는 0 */
function budgetCost(choiceId: string, data: GameData): number {
  if (cardOf(choiceId) === 'rest') return 0;
  return cardCost(choiceId, data) ?? 0;
}

/** 칸들이 쓴 단계 예산 */
function spentOf(ids: string[], data: GameData): number {
  return ids.reduce((sum, id) => sum + budgetCost(id, data), 0);
}

/** 이 단계에 이미 넣은 칸 — 이벤트로 멈췄으면 실행한 칸 + 다시 채운 칸 */
function stepIds(state: RunState): string[] {
  const p = state.paused;
  return [...(p ? p.plan.slice(0, p.done) : []), ...(state.routine ?? [])];
}

/** 단계 예산 막대 (`view.routine.budget`, S-10): 이 단계에 넣은 칸의 행동 비용 합 / `cards.stepBudget × n` */
export function stepBudget(state: RunState, data: GameData): { spent: number; limit: number } {
  return {
    spent: spentOf(stepIds(state), data),
    limit: data.cards.stepBudget * routineSlots(state, data),
  };
}

/**
 * 에너지 한도 (12-card-turn 3장 v0.1.5): 넣으면 행동 비용 합이 `cards.stepBudget × n`을 넘는 카드와,
 * 넣은 뒤 예상 에너지가 바닥(굶주림 판정)인 카드는 고를 수 없다.
 * 쉬기·옮기기는 한도에서 뺀다 — 먹이 고갈 장소에서 모든 선택이 막혀 판이 멈추지 않게.
 * `state`는 앞 칸들을 적용한 예상 상태(`projected`), `n`은 이 단계 칸 수, `spent`는 이 단계에 이미 쓴 예산
 */
export function limitToEnergy(
  choices: Choice[],
  state: RunState,
  data: GameData,
  n: number,
  spent: number,
): Choice[] {
  const budget = data.cards.stepBudget * n;
  return choices.map((c) => {
    const card = cardOf(c.id);
    if (c.disabled || !card || card === 'rest') return c;
    if (spent + budgetCost(c.id, data) <= budget && !judgeStep(state, c.id, data, n).starved)
      return c;
    return { ...c, disabled: { reason: '에너지 부족' } };
  });
}

/** 루틴 칸의 선택지 — 패 밖·에너지 한도를 막는다. `state`는 예상 상태, `hand`는 남은 패 */
export function slotChoices(
  state: RunState,
  data: GameData,
  n: number,
  hand: Hand,
  spent: number,
): Choice[] {
  return limitToEnergy(limitToHand(stepChoices(state, data), hand), state, data, n, spent);
}

/** 루틴의 다음 빈 칸 선택지 (`getChoices`) — 앞 칸에 옮기기를 넣었으면 그 장소 기준 */
export function nextSlotChoices(state: RunState, data: GameData): Choice[] {
  return slotChoices(
    projected(state, data),
    data,
    routineSlots(state, data),
    handLeft(state, data),
    spentOf(stepIds(state), data),
  );
}

/** 칸 하나의 판정 결과를 상태에 적용한다 (위험은 굴리지 않는다) */
function applySlot(state: RunState, choiceId: string, data: GameData, n: number): RunState {
  const out = judgeStep(state, choiceId, data, n);
  return {
    ...state,
    node: out.node,
    stay: out.stay,
    player: { ...state.player, energy: out.energy, feather: out.feather, stats: out.stats },
  };
}

/** 채운 칸들을 위험·난수 없이 적용한 예상 상태 — 다음 칸의 선택지·`preview` 기준 */
export function projected(state: RunState, data: GameData): RunState {
  const { routine = [], ...rest } = state;
  const n = routineSlots(state, data);
  return routine.reduce<RunState>((s, id) => applySlot(s, id, data, n), rest);
}

/** 고를 수 있는 칸 선택인가 */
function choosable(
  state: RunState,
  choiceId: string,
  data: GameData,
  n: number,
  hand: Hand,
  spent: number,
): boolean {
  return slotChoices(state, data, n, hand, spent).some((c) => c.id === choiceId && !c.disabled);
}

/**
 * 남은 빈 칸의 제안값: 바로 전 단계 루틴을 앞에서부터, 칸 수가 다르면 자르거나 마지막 칸 반복.
 * 이벤트 뒤 다시 채우기면 원래 계획의 남은 칸. 그 칸에서 못 고르는 선택이면 비운다(null) (03-contracts 3장).
 */
export function suggestions(state: RunState, data: GameData): (string | null)[] {
  const p = state.paused;
  const last = p ? p.plan.slice(p.done) : (state.lastRoutine ?? []);
  const out: (string | null)[] = [];
  let s = projected(state, data);
  const n = routineSlots(state, data);
  let hand = handLeft(state, data);
  let spent = spentOf(stepIds(state), data);
  for (let i = state.routine?.length ?? 0; i < emptySlots(state, data); i++) {
    const id = last[i] ?? last.at(-1);
    if (id && choosable(s, id, data, n, hand, spent)) {
      out.push(id);
      s = applySlot(s, id, data, n);
      hand = spend(hand, [id]);
      spent += budgetCost(id, data);
    } else out.push(null);
  }
  return out;
}

/**
 * 채운 루틴을 실행한다: 칸마다 판정 1→2→3 → 단계 이벤트 추첨(03-events 3.1). 칸 사망이면 남은 칸은 하지 않는다.
 * 이벤트가 나오면 그 칸에서 멈추고 `event`를 돌려준다 — 한 루틴에 이벤트는 1개, 다시 채운 칸은 추첨하지 않는다.
 * 로그는 `decision` 1건(루틴 합, 결정 셈 — 다시 채우기면 `replan`) → 칸마다 `slot` → 이벤트면 `event`, 사망이면 `death`.
 */
export function runRoutine(
  state: RunState,
  filled: string[],
  data: GameData,
): { state: RunState; log: LogEntry[]; event?: GameEvent } {
  const paused = state.paused;
  const done = paused?.done ?? 0;
  const plan = paused ? [...paused.plan.slice(0, done), ...filled] : filled;
  const slots: LogEntry[] = [];
  const labels: string[] = [];
  let s: RunState = state;
  let death: LogEntry | undefined;
  let event: GameEvent | undefined;
  // 칸 수는 실행 전 상태로 고정한다 (01-formulas 9.6)
  const n = routineSlots(state, data);
  for (const [i, id] of filled.entries()) {
    const label = stepChoices(s, data).find((c) => c.id === id)?.label ?? id;
    labels.push(label);
    const out = judgeStep(s, id, data, n);
    const slot = done + i + 1;
    slots.push({ at: state.at, type: 'slot', slot, text: label, deltas: deltas(s.player, out) });
    s = {
      ...s,
      node: out.node,
      stay: out.stay,
      player: { ...s.player, energy: out.energy, feather: out.feather, stats: out.stats },
    };
    // B-1 아사: 판정 1 직후 확정 사망. 난수를 당기지 않는다
    if (out.starved) {
      death = { at: state.at, type: 'death', text: '굶어 죽었다', cause: 'starvation', slot };
      break;
    }
    const rolled = nextFloat(s.rng);
    s = { ...s, rng: rolled.state };
    if (rolled.value < out.risk) {
      death =
        rolled.value < out.risk - out.agingRisk
          ? { at: state.at, type: 'death', text: '포식자에게 잡혔다', cause: 'predation', slot }
          : { at: state.at, type: 'death', text: '늙어서 죽었다', cause: 'aging', slot };
      break;
    }
    if (paused) continue;
    const drawn = drawStepEvent(s, data, plan, s.eventCooldown, n);
    s = drawn.state;
    if (drawn.event) {
      event = drawn.event;
      const cooldown = { ...s.eventCooldown, [event.id]: data.formulas.events.cooldownSteps };
      s = {
        ...s,
        eventCooldown: cooldown,
        paused: {
          slots: n,
          done: slot,
          plan,
          hand: spend(stepHand(state, data), filled.slice(0, i + 1)),
          nest: state.nest !== undefined,
        },
        gate: { kind: 'event', id: event.id },
      };
      slots.push({ at: state.at, type: 'event', text: event.title, event: event.id, slot });
      break;
    }
  }
  const decision: LogEntry = {
    at: state.at,
    type: paused ? 'replan' : 'decision',
    text: labels.join(', '),
    deltas: deltas(state.player, s.player),
  };
  // 가계도: 죽은 개체의 생애를 닫는다 (05-inheritance 8장)
  const log = [decision, ...slots, ...(death ? [{ ...death, life: endLife(s, 'death') }] : [])];
  return {
    state: { ...s, lastRoutine: plan, gameOver: Boolean(death) },
    log,
    ...(event ? { event } : {}),
  };
}

/** 판정 전후의 변화 (에너지·깃털·스탯) */
function deltas(
  from: RunState['player'],
  to: Pick<RunState['player'], 'energy' | 'feather' | 'stats'>,
): Record<string, number> {
  const d: Record<string, number> = {
    energy: to.energy - from.energy,
    feather: to.feather - from.feather,
  };
  for (const [stat, value] of Object.entries(to.stats)) {
    const gain = value - (from.stats[stat as StatName] ?? 0);
    if (gain !== 0) d[`stat.${stat}`] = gain;
  }
  return d;
}
