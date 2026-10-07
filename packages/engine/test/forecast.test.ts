import { describe, expect, it } from 'vitest';
import type { ForecastSubject } from '../src/forecast.ts';
import { yearSurvival } from '../src/forecast.ts';
import { f, testData } from './fixture.ts';

// 05-inheritance 6장 예시: 박새, period 12 마지막 단계의 관문, 장소 forest-edge.
// 명세 예시는 비행 보정(01-formulas 3.1, #216) 이전에 계산됐다 — 비행을 기준값으로 두면 보정 1
const steps = testData.calendar.get('parus-minor')?.periods[11]?.steps.length ?? 0;
const at = { year: 1, period: 12, step: steps };
const forecast = (s: Omit<ForecastSubject, 'flight'>) =>
  yearSurvival(testData, 'parus-minor', 'forest-edge', at, { ...s, flight: f.risk.flightRef });

describe('1년 생존 예상 (05-inheritance 6장)', () => {
  it('잔류 — 노화가 period 1에서 한 해 늘어난다', () => {
    expect(forecast({ age: 3, expYears: 3, vigilance: 62, silverSpoon: 0 })).toBeCloseTo(0.7688, 4);
    expect(forecast({ age: 1, expYears: 1, vigilance: 59.5, silverSpoon: 0 })).toBeCloseTo(
      0.8184,
      4,
    );
  });

  it('새끼 — 첫 겨울 보정은 그 새끼의 은수저로', () => {
    expect(forecast({ age: 0, expYears: 0, vigilance: 26.32, silverSpoon: 0.545 })).toBeCloseTo(
      0.7804,
      4,
    );
    expect(forecast({ age: 0, expYears: 0, vigilance: 36.2, silverSpoon: 1 })).toBeCloseTo(
      0.7912,
      4,
    );
  });
});
