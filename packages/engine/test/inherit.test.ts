import { describe, expect, it } from 'vitest';
import type { RunState } from '../src/index.ts';
import { getChoices, getView, newRun } from '../src/index.ts';
import { actStep, f, testData } from './fixture.ts';

// 새끼 사망 0 — 독립하는 새끼 수를 고정한다
const data = {
  ...testData,
  formulas: { ...f, brood: { ...f.brood, chickDeathPerStep: 0 } },
} as typeof testData;

const start = newRun({ speciesId: 'parus-minor', seed: 'inherit', mode: 'free' }, data);
const mate = { ...start.player, sex: 'male' as const, bond: 60, personality: 'bold' };
// 05-inheritance 3장 예시의 새끼(잠재력)와 은수저 0.545 — 기본 방침이면 가감 없음
const potential = {
  flight: 46,
  foraging: 76.4,
  vigilance: 72.4,
  stamina: 34,
  display: 58,
  social: 70,
};
const lastPostFledge: RunState = {
  ...start,
  at: { year: 1, period: 12, step: 2 },
  player: { ...start.player, energy: 60 },
  mate: mate as unknown as NonNullable<RunState['mate']>,
  yearNests: 1,
  nest: {
    site: 'deep',
    node: start.node,
    eggs: 2,
    chicks: 2,
    young: [
      { sex: 'female', potential },
      { sex: 'male', potential },
    ],
    spoon: { sum: 0.545 * 10, steps: 10 },
  },
};
const opened = actStep(lastPostFledge, 'action.rest', data);
// 카드·고르기는 명세 예시 그대로(은수저 0.545)인 관문 상태로
const gated: RunState = { ...lastPostFledge, totalBreeding: 1, gate: { kind: 'inheritance' } };

describe('독립 → 계승 관문 (00-core-loop 6.1 · 05-inheritance 5장)', () => {
  it('총 번식 수 +1이 먼저 확정되고 관문이 열린다 — 같은 단계에 머문다', () => {
    expect(opened.state.totalBreeding).toBe(start.totalBreeding + 1);
    expect(opened.state.at).toMatchObject({ period: 12, step: 2 });
    expect(opened.log.some((l) => l.type === 'breeding')).toBe(true);
    expect(getChoices(opened.state, data).map((c) => c.id)).toEqual([
      'inherit.stay',
      'inherit.chick.1',
      'inherit.chick.2',
    ]);
  });

  it('카드: 지금 개체(나이·노화·유대·1년 생존) · 새끼마다(성별·범위·은수저·첫 겨울·1년 생존)', () => {
    const gate = getView(gated, data).gate;
    if (gate?.kind !== 'inheritance') throw new Error('계승 관문이 아니다');
    expect(gate.totalBreeding).toBe(1);
    expect(gate.stay).toMatchObject({ choiceId: 'inherit.stay', age: start.player.age, bond: 60 });
    expect(gate.stay.yearSurvival).toBeGreaterThan(0);
    expect(gate.cards).toHaveLength(2);
    const [first, second] = gate.cards;
    expect(first?.sex).toBe('female');
    expect(first?.potentialRange.foraging).toEqual(['A', 'S']);
    // 첫째는 기본 방침이라 가감 없음 → 0.545
    expect(first?.silverSpoon).toBeCloseTo(0.545, 6);
    expect(second?.silverSpoon).toBeCloseTo(0.545, 6);
    expect(first?.firstWinter).toBeGreaterThan(1);
    expect(first?.yearSurvival).toBeGreaterThan(0);
  });

  it('잔류 → 같은 단계에서 2차 번식 여부 관문 (6.2), 둥지는 거둔다', () => {
    const stayed = actStep(gated, 'inherit.stay', data).state;
    expect(stayed.gate?.kind).toBe('secondBrood');
    expect(stayed.at).toMatchObject({ period: 12, step: 2 });
    expect(stayed.nest).toBeUndefined();
    expect(stayed.player).toEqual(gated.player);
  });

  it('잔류 → 2차 번식 → 둘째 둥지 독립 → 계승 관문, 잔류하면 더 열리지 않고 털갈이로 (04-breeding 7장)', () => {
    const pick: Record<string, string> = {
      mateOrder: 'mateOrder.none',
      nestSite: 'nestSite.deep',
      clutchSize: 'clutchSize.6',
    };
    let s = actStep(actStep(gated, 'inherit.stay', data).state, 'secondBrood.yes', data).state;
    expect(s.at).toMatchObject({ period: 13, step: 1 });
    while (s.gate?.kind !== 'inheritance' && s.at.period <= 14) {
      const kind = s.gate?.kind;
      const id = kind ? (pick[kind] ?? getChoices(s, data)[0]?.id) : 'action.rest';
      s = actStep(s, id ?? 'action.rest', data).state;
    }
    expect(s.gate?.kind).toBe('inheritance');
    expect(s.at).toMatchObject({ period: 14, step: 3 });
    expect(s).toMatchObject({ yearNests: 2, totalBreeding: 2 });
    const stayed = actStep(s, 'inherit.stay', data).state;
    expect(stayed.gate).toBeUndefined();
    expect(getView(stayed, data).phase).toBe('molt');
  });

  it('계승 → 새끼가 조작 개체가 된다 (7장 예시: 에너지 33.71, 깃털 80, 나이 0, 다음은 period 13 molt)', () => {
    const next = actStep(gated, 'inherit.chick.1', data).state;
    expect(next.player).toMatchObject({ sex: 'female', age: 0, expYears: 0, feather: 80 });
    expect(next.player.energy).toBeCloseTo(33.71, 2);
    expect(next.player.stats.stamina).toBeCloseTo(12.36, 2);
    expect(next.player.potential).toEqual(potential);
    expect(next.mate).toBeUndefined();
    expect(next.nest).toBeUndefined();
    expect(next.gate).toBeUndefined();
    expect(next.at).toMatchObject({ period: 13, step: 1 });
    expect(getView(next, data).phase).toBe('molt');
    expect(next.totalBreeding).toBe(1);
  });

  it('가계도(8장): 계승 로그에 떠난 개체의 한 줄, 새끼는 다음 세대로 0부터', () => {
    const counted = opened.state;
    expect(counted.life).toMatchObject({ generation: 1, breeding: 1, fledged: 2 });
    const done = actStep(counted, 'inherit.chick.2', data);
    const line = done.log.find((l) => l.type === 'inheritance')?.life;
    expect(line).toMatchObject({
      generation: 1,
      sex: start.player.sex,
      start: { at: start.at, age: start.player.age },
      end: { at: counted.at, age: counted.player.age },
      reason: 'inherit',
      breeding: 1,
      fledged: 2,
    });
    expect(done.state.life).toMatchObject({
      generation: 2,
      sex: 'male',
      start: { at: counted.at, age: 0 },
      breeding: 0,
      fledged: 0,
    });
  });
});
