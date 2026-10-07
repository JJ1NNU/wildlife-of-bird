import type { GameEvent } from '@wb/schema';
import { describe, expect, it } from 'vitest';
import type { EventContext } from '../src/events.ts';
import { applyEffects, checkChance, eventCandidates, pickEvent, whenHolds } from '../src/events.ts';
import { foodModFactor, riskModFactor } from '../src/formulas.ts';
import { newRun } from '../src/index.ts';
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

describe('효과 (03-events 6.1 예시)', () => {
  const run = newRun({ speciesId: 'parus-minor', seed: 'effects', mode: 'free' }, testData);
  const at = (energy: number) => ({ ...run, player: { ...run.player, energy } });

  it('에너지 20, energy medium loss → 8', () => {
    const out = applyEffects(at(20), [{ type: 'energy', tier: 'medium', sign: 'loss' }], testData);
    expect(out.state.player.energy).toBe(8);
    expect(out.death).toBeUndefined();
  });
  it('에너지 10, energy large loss → 아사, 뒤 효과는 버린다', () => {
    const out = applyEffects(
      at(10),
      [
        { type: 'energy', tier: 'large', sign: 'loss' },
        { type: 'riskMod', tier: 'high' },
      ],
      testData,
    );
    expect(out.death).toBe('starvation');
    expect(out.state.periodMods).toBeUndefined();
  });
  it('foodMod medium loss 두 번 → 섭취 × 0.49, riskMod high → 위험 × 2.0', () => {
    const loss = { type: 'foodMod', tier: 'medium', sign: 'loss' } as const;
    const { state } = applyEffects(run, [loss, loss, { type: 'riskMod', tier: 'high' }], testData);
    expect(foodModFactor(testData.effects.foodMod, state.periodMods?.food ?? [])).toBeCloseTo(0.49);
    expect(riskModFactor(testData.effects.riskMod, state.periodMods?.risk ?? [])).toBe(2);
  });
  it('deathRisk — 맞으면 원인 predation:<predator>', () => {
    const sure = {
      ...testData,
      effects: { ...testData.effects, deathRisk: { low: 1, medium: 1, high: 1 } },
    };
    const out = applyEffects(
      run,
      [{ type: 'deathRisk', tier: 'high', cause: 'predation', predator: 'snake' }],
      sure,
    );
    expect(out.death).toBe('predation:snake');
  });
  it('injury — 남은 부상 단계와 새 값 중 큰 쪽', () => {
    const hurt = applyEffects(run, [{ type: 'injury', tier: 'medium' }], testData).state;
    expect(hurt.injury).toBe(3);
    expect(applyEffects(hurt, [{ type: 'injury', tier: 'small' }], testData).state.injury).toBe(3);
    expect(applyEffects(hurt, [{ type: 'injury', tier: 'large' }], testData).state.injury).toBe(4);
  });
  const brood = (chicks: number) => ({
    ...run,
    nest: { site: 'deep', node: 'village-farmland', eggs: chicks, chicks },
  });
  it('새끼 7, chickLoss medium → 3마리 사망, 4마리 남음', () => {
    const out = applyEffects(brood(7), [{ type: 'chickLoss', tier: 'medium' }], testData);
    expect(out.state.nest?.chicks).toBe(4);
  });
  it('fledgeEarly + chickLoss small — 새끼 7 → 둥지에 조기 이소 표시, 2마리 사망', () => {
    const out = applyEffects(
      brood(7),
      [{ type: 'fledgeEarly' }, { type: 'chickLoss', tier: 'small' }],
      testData,
    );
    expect(out.state.nest).toMatchObject({ fledgedEarly: true, chicks: 5 });
  });
  it('새끼 1, chickLoss small → 전멸 → B-5(둥지를 거둔다)', () => {
    const out = applyEffects(brood(1), [{ type: 'chickLoss', tier: 'small' }], testData);
    expect(out.state.nest).toBeUndefined();
    expect(out.log).toMatchObject([{ type: 'brood', cause: 'chickLoss' }]);
  });
  it('broodRisk — 맞으면 알·새끼 전멸 → B-5', () => {
    const sure = {
      ...testData,
      effects: { ...testData.effects, broodRisk: { low: 1, medium: 1, high: 1 } },
    };
    const out = applyEffects(brood(5), [{ type: 'broodRisk', tier: 'low' }], sure);
    expect(out.state.nest).toBeUndefined();
    expect(out.log).toMatchObject([{ type: 'brood', cause: 'broodRisk' }]);
  });
});
