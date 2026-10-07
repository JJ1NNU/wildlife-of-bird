import type { GameEvent } from '@wb/schema';
import { describe, expect, it } from 'vitest';
import type { EventContext } from '../src/events.ts';
import { checkChance, eventCandidates, pickEvent, whenHolds } from '../src/events.ts';
import { f, testData } from './fixture.ts';

const ctx: EventContext = {
  phase: 'winter',
  phaseLastStep: false,
  habitats: ['forest'],
  period: 2,
  sex: 'female',
  age: 0,
  hasMate: false,
  hasBrood: false,
  energyRatio: 0.5,
  actions: ['forage'],
};

describe('조건 when (03-events 4장 예시)', () => {
  it('winter · ageMax 0 — 나이 0 참, 나이 1 거짓', () => {
    const when = { phaseAny: ['winter' as const], ageMax: 0 };
    expect(whenHolds(when, ctx)).toBe(true);
    expect(whenHolds(when, { ...ctx, age: 1 })).toBe(false);
  });
  it('period 23~4는 해를 넘긴다 — 2 참, 10 거짓', () => {
    const when = { periodFrom: 23, periodTo: 4 };
    expect(whenHolds(when, ctx)).toBe(true);
    expect(whenHolds(when, { ...ctx, period: 10 })).toBe(false);
  });
  it('hasBrood · energyBelow 0.3 — 새끼 있음, 에너지 15/67 → 참', () => {
    expect(
      whenHolds(
        { hasBrood: true, energyBelow: 0.3 },
        { ...ctx, hasBrood: true, energyRatio: 15 / 67 },
      ),
    ).toBe(true);
  });
});

describe('추첨 (03-events 3.1 예시)', () => {
  const ev = (id: string, weight: GameEvent['weight']): GameEvent => ({
    ...(testData.events[0] as GameEvent),
    id,
    weight,
    when: {},
  });
  const [a, b, c] = [ev('ev.t.a', 'common'), ev('ev.t.b', 'uncommon'), ev('ev.t.c', 'rare')];

  it('가중치 10 : 4 : 1 → A가 뽑힐 확률 10/15', () => {
    expect(pickEvent([a, b, c], testData.effects.eventWeight, 10 / 15 - 1e-9)?.id).toBe('ev.t.a');
    expect(pickEvent([a, b, c], testData.effects.eventWeight, 10 / 15)?.id).toBe('ev.t.b');
  });
  it('쿨다운이 남은 이벤트는 후보가 아니다 → 이벤트 없음', () => {
    const cands = eventCandidates([a], 'step', 'parus-minor', ctx, { 'ev.t.a': 7 });
    expect(cands).toEqual([]);
    expect(pickEvent(cands, testData.effects.eventWeight, 0.1)).toBeUndefined();
  });
});

describe('판정형 성공 확률 (03-events 5.2 예시)', () => {
  const d = testData.effects.checkDifficulty;
  it.each([
    [70, d.medium, 0.9],
    [46, d.medium, 0.54],
    [30, d.high, 0.1],
    [95, d.low, 0.95],
  ])('스탯 %d, 난이도 %d → %d', (stat, difficulty, p) => {
    expect(checkChance(f, stat, difficulty ?? 0)).toBeCloseTo(p);
  });
});
