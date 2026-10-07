import { describe, expect, it } from 'vitest';
import { chooseSecondBrood, endBreeding, secondBroodDue } from '../src/brood.ts';
import type { RunState } from '../src/index.ts';
import { getChoices, getView, newRun } from '../src/index.ts';
import { actStep, testData } from './fixture.ts';

const start = newRun({ speciesId: 'parus-minor', seed: 'brood', mode: 'free' }, testData);
const mate = { ...start.player, sex: 'male' as const, bond: 50, personality: 'neutral' };
const failedAt = (period: number, step: number): RunState => ({
  ...start,
  at: { year: 1, period, step },
  mate: mate as unknown as NonNullable<RunState['mate']>,
  yearNests: 1,
});
const steps = (s: RunState) => s.calendar.flat().length;

describe('2차 번식 여부 (00-core-loop 4.4 · 4.5 예시)', () => {
  it('period 9에 알 전멸 → 포기: 그 해 34단계', () => {
    const s = endBreeding(failedAt(9, 1));
    expect(s.calendar[8]).toEqual(['incubation', 'molt', 'molt']);
    expect(steps(s)).toBe(34);
  });

  it('period 9에 알 전멸 → 대체 번식: 10–11 rebrood · 12는 molt 1단계 · 38단계', () => {
    const s = chooseSecondBrood(failedAt(9, 1), 'secondBrood.yes', testData).state;
    expect(s.calendar[9]).toEqual(['nestSite', 'laying', 'incubation']);
    expect(s.calendar[11]).toEqual(['molt']);
    expect(steps(s)).toBe(38);
    expect(s.player.energy).toBe(Math.max(0, start.player.energy - 25));
  });

  it('period 12에 새끼 전멸 → 한다: 13–14 rebrood · 40단계', () => {
    expect(secondBroodDue(failedAt(12, 2), testData)).toBe(true);
    const s = chooseSecondBrood(failedAt(12, 2), 'secondBrood.yes', testData).state;
    expect(steps(s)).toBe(40);
  });

  it('둥지 2개째 · 짝 없음 · layByPeriod 넘김이면 열리지 않는다', () => {
    expect(secondBroodDue({ ...failedAt(10, 1), yearNests: 2 }, testData)).toBe(false);
    const { mate: _m, ...single } = failedAt(10, 1);
    expect(secondBroodDue(single, testData)).toBe(false);
    expect(secondBroodDue(failedAt(13, 1), testData)).toBe(false);
  });
});

describe('알이 하나도 안 깨면 관문이 열린다 (act 흐름)', () => {
  const tit = testData.breeding.species['parus-minor'];
  const data = {
    ...testData,
    breeding: {
      ...testData.breeding,
      species: { ...testData.breeding.species, 'parus-minor': { ...tit, hatchRate: 0 } },
    },
  } as typeof testData;
  const lastIncubation: RunState = {
    ...failedAt(9, 3),
    player: { ...start.player, energy: 60 },
    nest: { site: 'deep', node: start.node, eggs: 6 },
  };
  const failed = actStep(lastIncubation, 'action.rest', data).state;

  it('부화 0 → secondBrood 관문, 카드에 에너지 비용', () => {
    expect(getChoices(failed, data).map((c) => c.id)).toEqual([
      'secondBrood.yes',
      'secondBrood.no',
    ]);
    expect(getView(failed, data).gate).toEqual({
      kind: 'secondBrood',
      cards: [
        { choiceId: 'secondBrood.yes', energyCost: 25 },
        { choiceId: 'secondBrood.no', energyCost: 0 },
      ],
    });
  });

  it("'한다' → 다음 시기 nestSite에서 이어 간다", () => {
    const next = actStep(failed, 'secondBrood.yes', data).state;
    expect(next.at).toMatchObject({ period: 10, step: 1 });
    expect(getView(next, data).phase).toBe('nestSite');
  });
});

describe('짝 없이 nestSite에 들어오면 분할 해제 (00-core-loop 4.6)', () => {
  const single: RunState = {
    ...start,
    at: { year: 1, period: 7, step: 1 },
    player: { ...start.player, energy: 60 },
  };
  const r = actStep(single, 'action.rest', testData);

  it('관문 없이 다음 단계 molt · 둥지 국면 시기는 molt 1단계', () => {
    expect(r.state.gate).toBeUndefined();
    expect(r.state.calendar[6]).toEqual(['nestSite', 'molt', 'molt']);
    expect(r.state.calendar.slice(7, 12)).toEqual([
      ['molt'],
      ['molt'],
      ['molt'],
      ['molt'],
      ['molt'],
    ]);
    expect(getView(r.state, testData).phase).toBe('molt');
    expect(r.log.some((e) => e.type === 'brood')).toBe(true);
  });
});
