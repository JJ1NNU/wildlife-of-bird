import type { CalendarAt } from './types.ts';

/** 1년 = 24시기 (반 달 단위). gdd 4.2장 [초안] */
export const PERIODS_PER_YEAR = 24;

/**
 * 한 시기를 몇 단계로 쪼개는지. 평시는 1단계, 번식기·이동기는 더 촘촘하게 쪼갠다
 * (gdd 4.2장). M0에서는 모든 시기를 1단계로 둔다 — 시기별 단계 수는 디자인의
 * 단계표(`data/calendar/`)가 정한다. 잠정(#5)
 */
export function stepsInPeriod(_period: number): number {
  return 1;
}

/** 한 단계 진행한 달력 위치. */
export function advance(at: CalendarAt): CalendarAt {
  if (at.step < stepsInPeriod(at.period)) {
    return { ...at, step: at.step + 1 };
  }
  if (at.period < PERIODS_PER_YEAR) {
    return { year: at.year, period: at.period + 1, step: 1 };
  }
  return { year: at.year + 1, period: 1, step: 1 };
}
