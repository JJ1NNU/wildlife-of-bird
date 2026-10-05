import type { GameData, Phase } from '@wb/schema';
import type { CalendarAt } from './types.ts';

/** 1년 = 24시기 (반 달 단위). gdd 4.2장 [초안] */
export const PERIODS_PER_YEAR = 24;

/**
 * 그 해의 실제 단계표 — 시기마다 단계별 국면. `data/calendar/<종>.json`의 사본이다.
 * 단계표는 기본값이고 런 상태가 실제 값이다 — 재번식·분할 해제가 이 사본을 덮어쓴다
 * (00-core-loop 4.1 · 8장). 다음 해 `period 1`에 다시 이것으로 돌아간다.
 */
export function yearCalendar(data: GameData, speciesId: string): Phase[][] {
  const calendar = data.calendar.get(speciesId);
  if (!calendar) {
    throw new Error(`단계표가 없는 종이다: ${speciesId} (data/calendar/${speciesId}.json)`);
  }
  return calendar.periods.map((p) => [...p.steps]);
}

/** 지금 단계의 국면 */
export function phaseAt(calendar: Phase[][], at: CalendarAt): Phase {
  const phase = calendar[at.period - 1]?.[at.step - 1];
  if (!phase) throw new Error(`단계표에 없는 자리다: 시기 ${at.period} 단계 ${at.step}`);
  return phase;
}

/** 한 단계 진행한 달력 위치. 시기의 단계 수는 그 해의 단계표가 정한다 */
export function advance(at: CalendarAt, calendar: Phase[][]): CalendarAt {
  if (at.step < (calendar[at.period - 1]?.length ?? 1)) {
    return { ...at, step: at.step + 1 };
  }
  if (at.period < PERIODS_PER_YEAR) {
    return { year: at.year, period: at.period + 1, step: 1 };
  }
  return { year: at.year + 1, period: 1, step: 1 };
}
