import type { GameData, Phase } from '@wb/schema';
import { speciesBalance } from './step.ts';
import type { CalendarAt, Choice, LogEntry, RunState, SecondBroodCard } from './types.ts';

/**
 * 2차 번식 여부 관문 `secondBrood` (04-breeding 7장) · 재번식(00-core-loop 4.4) · 분할 해제(4.5).
 * 지금은 번식이 실패한 단계(B-5)에서만 연다.
 * 잠정(#139): 1차 성공 뒤 '계승 화면에서 잔류를 고른 직후'와 조건 4(계승 #1)는 계승 조각에서.
 * 잠정(#21): 짝 없이 `nestSite`에 들어갈 때의 분할 해제는 그 조각에서.
 */

/** 둥지 국면 (00-core-loop 4.2) */
const NEST_PHASES: readonly Phase[] = [
  'nestSite',
  'laying',
  'incubation',
  'nestling',
  'postFledge',
];

/** 관문이 열리나 — 4.4의 조건 1~3 */
export function secondBroodDue(state: RunState, data: GameData): boolean {
  const sb = speciesBalance(data, state.config.speciesId).secondBrood;
  return (
    sb !== undefined &&
    (state.yearNests ?? 0) < 2 &&
    state.mate !== undefined &&
    state.at.period + 1 <= sb.layByPeriod
  );
}

export function secondBroodChoices(): Choice[] {
  return [
    { id: 'secondBrood.yes', kind: 'secondBrood', label: '한 번 더 번식한다' },
    { id: 'secondBrood.no', kind: 'secondBrood', label: '올해 번식을 마친다' },
  ];
}

/** '한다'를 고르는 순간 잃는 에너지 */
function energyCost(state: RunState, data: GameData): number {
  const sb = speciesBalance(data, state.config.speciesId).secondBrood;
  return sb ? (data.effects.energy[sb.energyCost] ?? 0) : 0;
}

/** 화면 카드 */
export function secondBroodCards(state: RunState, data: GameData): SecondBroodCard[] {
  return [
    { choiceId: 'secondBrood.yes', energyCost: energyCost(state, data) },
    { choiceId: 'secondBrood.no', energyCost: 0 },
  ];
}

/**
 * 분할 해제 (4.5): 지금 시기의 남은 단계는 수 그대로 `molt`로,
 * 다음 시기부터 둥지 국면이 든 시기는 `molt` 1단계로. `from`(1부터) 앞의 시기는 건드리지 않는다.
 */
function release(calendar: Phase[][], at: CalendarAt, from = at.period + 1): Phase[][] {
  return calendar.map((steps, i) => {
    const period = i + 1;
    if (period === at.period) return steps.map((p, j) => (j + 1 > at.step ? 'molt' : p));
    if (period >= from && steps.some((p) => NEST_PHASES.includes(p))) return ['molt'];
    return steps;
  });
}

/** 번식이 실패했고 관문이 열리지 않을 때 — 그 해의 번식은 끝 */
export function endBreeding(state: RunState): RunState {
  return { ...state, calendar: release(state.calendar, state.at) };
}

/**
 * 관문을 닫는다. '한다'면 에너지 손실 · 다음 시기부터 `rebrood`로 덮어쓰기(짝은 그대로).
 * 재번식 뒤의 둥지 국면 시기는 미리 분할 해제한다 — 그 해 둥지가 2개라 더 열리지 않는다.
 */
export function chooseSecondBrood(
  state: RunState,
  choiceId: string,
  data: GameData,
): { state: RunState; log: LogEntry[] } {
  if (choiceId !== 'secondBrood.yes') {
    return {
      state: endBreeding(state),
      log: [{ at: state.at, type: 'brood', text: '올해 번식을 마쳤다' }],
    };
  }
  const rebrood = data.calendar.get(state.config.speciesId)?.rebrood ?? [];
  const start = state.at.period + 1;
  const calendar = release(state.calendar, state.at, start + rebrood.length);
  rebrood.forEach((p, i) => {
    if (start + i <= calendar.length) calendar[start + i - 1] = [...p.steps];
  });
  const energy = Math.max(0, state.player.energy - energyCost(state, data));
  return {
    state: { ...state, calendar, player: { ...state.player, energy } },
    log: [{ at: state.at, type: 'brood', text: '한 번 더 번식하기로 했다' }],
  };
}
