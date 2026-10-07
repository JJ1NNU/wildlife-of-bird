import type { GameData, GameEvent, StatName } from '@wb/schema';
import { drawStepEvent } from './events.ts';
import { endLife } from './inherit.ts';
import { nextChance } from './rng.ts';
import { judgeStep, slotCount, stepChoices } from './step.ts';
import type { LogEntry, RunState } from './types.ts';

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
function choosable(state: RunState, choiceId: string, data: GameData): boolean {
  return stepChoices(state, data).some((c) => c.id === choiceId && !c.disabled);
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
  for (let i = state.routine?.length ?? 0; i < emptySlots(state, data); i++) {
    const id = last[i] ?? last.at(-1);
    if (id && choosable(s, id, data)) {
      out.push(id);
      s = applySlot(s, id, data, n);
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
    const rolled = nextChance(s.rng, out.risk);
    s = { ...s, rng: rolled.state };
    if (rolled.value) {
      death = { at: state.at, type: 'death', text: '포식자에게 잡혔다', cause: 'predation', slot };
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
        paused: { slots: n, done: slot, plan, nest: state.nest !== undefined },
        gate: { kind: 'event', id: event.id },
      };
      slots.push({ at: state.at, type: 'event', text: event.title, event: event.id, slot });
      break;
    }
  }
  const decision: LogEntry = {
    at: state.at,
    type: paused ? 'replan' : 'decision',
    text: labels.join(' · '),
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
