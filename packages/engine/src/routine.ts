import type { GameData, StatName } from '@wb/schema';
import { endLife } from './inherit.ts';
import { nextChance } from './rng.ts';
import { judgeStep, slotCount, stepChoices } from './step.ts';
import type { LogEntry, RunState } from './types.ts';

/**
 * 행동 루틴 — 칸 하나 = `act` 하나 (00-core-loop 3.5, 03-contracts 3장 '행동 루틴').
 * 칸을 채우는 `act`는 적어 두기만 하고(판정·난수 없음), 마지막 칸을 채우는 `act`가 칸마다 판정 1→2→3을 굴린다.
 * 잠정(#186): 이벤트가 아직 없어 다시 채우기(`replan`)는 생기지 않는다.
 */

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
  const n = slotCount(state, data);
  return routine.reduce<RunState>((s, id) => applySlot(s, id, data, n), rest);
}

/** 고를 수 있는 칸 선택인가 */
function choosable(state: RunState, choiceId: string, data: GameData): boolean {
  return stepChoices(state, data).some((c) => c.id === choiceId && !c.disabled);
}

/**
 * 남은 빈 칸의 제안값: 바로 전 단계 루틴을 앞에서부터, 칸 수가 다르면 자르거나 마지막 칸 반복.
 * 그 칸에서 못 고르는 선택이면 비운다(null) (03-contracts 3장).
 */
export function suggestions(state: RunState, data: GameData): (string | null)[] {
  const last = state.lastRoutine ?? [];
  const out: (string | null)[] = [];
  let s = projected(state, data);
  const n = slotCount(state, data);
  for (let i = state.routine?.length ?? 0; i < n; i++) {
    const id = last[i] ?? last.at(-1);
    if (id && choosable(s, id, data)) {
      out.push(id);
      s = applySlot(s, id, data, n);
    } else out.push(null);
  }
  return out;
}

/**
 * 채운 루틴을 실행한다: 칸마다 판정 1→2→3, 칸 사망이면 남은 칸은 하지 않는다.
 * 로그는 `decision` 1건(루틴 합, 결정 셈) → 칸마다 `slot` → 사망이면 `death`.
 */
export function runRoutine(
  state: RunState,
  filled: string[],
  data: GameData,
): { state: RunState; log: LogEntry[] } {
  const slots: LogEntry[] = [];
  const labels: string[] = [];
  let s: RunState = state;
  let death: LogEntry | undefined;
  // 칸 수는 실행 전 상태로 고정한다 (01-formulas 9.6)
  const n = slotCount(state, data);
  for (const [i, id] of filled.entries()) {
    const label = stepChoices(s, data).find((c) => c.id === id)?.label ?? id;
    labels.push(label);
    const out = judgeStep(s, id, data, n);
    const slot = i + 1;
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
  }
  const decision: LogEntry = {
    at: state.at,
    type: 'decision',
    text: labels.join(' · '),
    deltas: deltas(state.player, s.player),
  };
  // 가계도: 죽은 개체의 생애를 닫는다 (05-inheritance 8장)
  const log = [decision, ...slots, ...(death ? [{ ...death, life: endLife(s, 'death') }] : [])];
  return { state: { ...s, lastRoutine: filled, gameOver: Boolean(death) }, log };
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
