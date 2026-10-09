import { describe, expect, it } from 'vitest';
import { acceptanceBand, formatEnergyDelta, formatRisk } from '../src/display.ts';
import {
  actionCost,
  agedStats,
  agingRiskMult,
  chickDeath,
  childPotential,
  deathRisk,
  expenditure,
  fatCap,
  feedingFulfilment,
  firstWinterRiskMult,
  forageEfficiency,
  growthMult,
  intake,
  mateAcceptance,
  nestLoss,
  nextEnergy,
  nextFeather,
  refusalEffect,
  startStat,
  statGain,
  statGrade,
} from '../src/formulas.ts';
import { f, testData, tit } from './fixture.ts';

/** `docs/design/specs/01-formulas.md` v0 예시 표 (qa/test-strategy T2). 계수는 data/balance/ */

describe('1. 스탯', () => {
  it('1.1 등급', () => {
    expect(statGrade(f, 69.9)).toBe('B');
    expect(statGrade(f, 70)).toBe('A');
    expect(statGrade(f, 0)).toBe('G');
  });

  it('1.3 상승 — 잠재력에 가까울수록 덜 오른다', () => {
    const base = f.actions.train.gain.chosen ?? 0;
    const train = { stat: 'flight', base, potential: 50, growthMult: 1 } as const;
    expect(statGain(f, tit, { ...train, current: 30 })).toBeCloseTo(1.7, 6);
    expect(statGain(f, tit, { ...train, current: 48 })).toBeCloseTo(0.17, 6);
    expect(statGain(f, tit, { ...train, current: 50 })).toBe(0);
  });
});

describe('2. 에너지', () => {
  it('2.1 지방 상한 · 2.2 채식 효율', () => {
    expect(fatCap(f, 34)).toBe(67);
    expect(forageEfficiency(f, 70, 1)).toBeCloseTo(1.18, 9);
  });

  it('2.3 섭취 — 고갈과 이동', () => {
    const base = {
      food: 'medium',
      competition: 'low',
      foodModFactor: 1,
      efficiency: 1.18,
      action: 'forage',
    } as const;
    expect(intake(f, { ...base, stay: 2 })).toBeCloseTo(10.089, 9);
    // 연속 체류 4 이상이면 고갈 0.8에서 멈춘다
    expect(intake(f, { ...base, stay: 6 }) / intake(f, { ...base, stay: 0 })).toBeCloseTo(0.8, 9);
    expect(intake(f, { ...base, stay: 20 })).toBeCloseTo(intake(f, { ...base, stay: 6 }), 9);
    expect(intake(f, { ...base, action: 'move', stay: 0 })).toBe(0);
  });

  it('2.4 소비', () => {
    const base = {
      flight: 46,
      incubating: false,
      feeding: false,
      feedIntensity: 'mid',
      chicks: 0,
    } as const;
    expect(expenditure(f, tit, { ...base, period: 2, phase: 'winter', action: 'forage' })).toBe(9);
    expect(actionCost(f, 'move', 46)).toBeCloseTo(2.048, 9);
    const feeding = {
      ...base,
      period: 10,
      phase: 'nestling',
      action: 'forage',
      feeding: true,
      feedIntensity: 'high',
      chicks: 8,
    } as const;
    expect(expenditure(f, tit, feeding)).toBeCloseTo(15.4, 9);
    // 둥지 없는 새는 급이 국면에도 급이 비용을 내지 않는다(#162)
    const noNest = { ...feeding, feeding: false, chicks: 0 };
    expect(expenditure(f, tit, noNest)).toBe(
      expenditure(f, tit, { ...noNest, phase: 'incubation' }),
    );
  });

  it('2.5 갱신과 아사', () => {
    expect(nextEnergy(67, 40, 10.089, 9).energy).toBeCloseTo(41.089, 9);
    expect(nextEnergy(67, 65, 12, 8)).toEqual({ energy: 67, starved: false });
    expect(nextEnergy(67, 5, 3, 9)).toEqual({ energy: 0, starved: true });
  });

  it('2.6 깃털', () => {
    expect(nextFeather(f, 60, 'winter', 'forage')).toBe(58.5);
    expect(nextFeather(f, 60, 'molt', 'rest')).toBe(73);
    expect(nextFeather(f, 96, 'molt', 'forage')).toBe(100);
  });
});

describe('3. 위험', () => {
  const calm = {
    nodeRisk: 'medium',
    phase: 'winter',
    season: 'winter',
    action: 'forage',
    riskModFactor: 1,
    vigilance: 70,
    flight: 40,
    expYears: 1,
    r: 0.575,
    feather: 60,
    age: 1,
    silverSpoon: 0,
    injured: false,
  } as const;
  const worst = {
    nodeRisk: 'veryHigh',
    phase: 'nestling',
    season: 'spring',
    action: 'explore',
    riskModFactor: 1,
    vigilance: 10,
    flight: 15,
    expYears: 0,
    r: 0.1,
    feather: 10,
    age: 6,
    silverSpoon: 0,
    injured: true,
  } as const;

  it('3.1 단계 사망 위험', () => {
    expect(deathRisk(f, tit, calm)).toBeCloseTo(0.002541, 6);
    expect(deathRisk(f, tit, { ...calm, r: 0.2, feather: 40, age: 4 })).toBeCloseTo(0.006288, 6);
    expect(deathRisk(f, tit, { ...calm, flight: 65 })).toBeCloseTo(0.0022867, 6);
    expect(deathRisk(f, tit, worst)).toBeCloseTo(0.138692, 6);
    const highMod = 1 + testData.effects.riskMod.high;
    expect(deathRisk(f, tit, { ...worst, riskModFactor: highMod })).toBe(f.risk.cap);
    const quiet = {
      ...calm,
      nodeRisk: 'veryLow',
      phase: 'autumnFlock',
      season: 'autumn',
      action: 'rest',
      vigilance: 100,
      expYears: 5,
      r: 0.6,
      feather: 90,
    } as const;
    expect(deathRisk(f, tit, quiet)).toBe(f.risk.floor);
  });

  it('3.2 둥지 손실 · 3.3 새끼 사망', () => {
    const parents = { vigilance: 70, mateVigilance: 58, riskModFactor: 1 };
    expect(nestLoss(f, tit, parents)).toBeCloseTo(0.12928, 9);
    expect(chickDeath(f, 'high')).toBeCloseTo(0.014, 9);
  });
});

describe('4. 노화', () => {
  it('위험 보정과 period 1의 스탯 하락', () => {
    expect(agingRiskMult(f, tit, 2)).toBe(1);
    expect(agingRiskMult(f, tit, 3)).toBe(1.25);
    expect(agingRiskMult(f, tit, 5)).toBe(1.75);
    expect(agedStats(f, tit, 3, { flight: 50, stamina: 40, foraging: 70 })).toEqual({
      flight: 47,
      stamina: 37,
      foraging: 70,
    });
  });
});

describe('5. 유전', () => {
  it('종 평균으로의 회귀 · 변이 · 자르기', () => {
    const parents = { stat: 'foraging', mother: 82, father: 74 } as const;
    expect(childPotential(f, tit, { ...parents, z: 0 })).toBeCloseTo(72.4, 9);
    expect(childPotential(f, tit, { ...parents, z: 0.5 })).toBeCloseTo(76.4, 9);
    const best = {
      stat: 'foraging',
      mother: 100,
      father: 100,
      z: 30 / f.heredity.mutationSd,
    } as const;
    expect(childPotential(f, tit, best)).toBe(100);
  });
});

describe('6. 은수저', () => {
  const parents = (player: 'mid' | 'high') => [
    { feed: f.silverSpoon.feedByIntensity[player], efficiency: 1.18 },
    { feed: f.silverSpoon.feedByIntensity.mid, efficiency: 1.0 },
  ];

  it('6.1 충족도 — 새끼가 많을수록 1마리 몫이 준다', () => {
    const mid = (chicks: number) =>
      feedingFulfilment(f, { parents: parents('mid'), food: 'medium', chicks });
    expect(mid(10)).toBeCloseTo(0.7267, 4);
    expect(mid(8)).toBeCloseTo(0.9083, 4);
    expect(mid(5)).toBe(1);
    const rich = feedingFulfilment(f, { parents: parents('high'), food: 'high', chicks: 8 });
    expect(rich).toBe(1);
  });

  it('6.2 시작 스탯 · 성장 배율 · 6.3 첫 겨울', () => {
    expect(startStat(f, 76.4, 0.545)).toBeCloseTo(27.77, 2);
    expect(growthMult(f, 0.545)).toBeCloseTo(1.018, 9);
    expect(firstWinterRiskMult(f, tit, 0.545)).toBeCloseTo(1.473, 9);
    expect(firstWinterRiskMult(f, tit, 1)).toBeCloseTo(1.2, 9);
  });
});

describe('7. 화면 표시', () => {
  it('7.1 확률', () => {
    expect(formatRisk(f, 0.0004).text).toBe('0.1% 미만');
    expect(formatRisk(f, 0.003324)).toEqual({ text: '0.3%', band: 'low' });
    expect(formatRisk(f, 0.008228)).toEqual({ text: '0.8%', band: 'mid' });
    expect(formatRisk(f, 0.1234).text).toBe('12%');
  });

  it('7.2 에너지 변화', () => {
    expect(formatEnergyDelta(-1.504)).toBe('-2');
    expect(formatEnergyDelta(8.496)).toBe('+8');
    expect(formatEnergyDelta(-0.4)).toBe('0');
  });
});

describe('8. 짝 지시 수락률', () => {
  it('수락률과 띠 · 상한 · 거절 효과', () => {
    const good = mateAcceptance(f, {
      role: 'native',
      personality: 'neutral',
      mateR: 0.6,
      bond: 30,
      recentHelps: 1,
      cost: 'medium',
      social: 70,
    });
    expect(good).toBeCloseTo(0.7766, 4);
    expect(acceptanceBand(f, good)).toBe('high');

    const bad = mateAcceptance(f, {
      role: 'unusual',
      personality: 'mismatch',
      mateR: 0.2,
      bond: 0,
      recentHelps: 0,
      cost: 'large',
      social: 46,
    });
    expect(bad).toBeCloseTo(0.1283, 4);
    expect(acceptanceBand(f, bad)).toBe('low');

    // 04-breeding 3장 예시 — patrol(수컷 → unusual 암컷) · guardNest(상한)
    const order = { role: 'unusual', personality: 'mismatch', mateR: 0.6, bond: 20 } as const;
    const patrol = { ...order, recentHelps: 0, cost: 'medium', social: 60 } as const;
    expect(mateAcceptance(f, patrol)).toBeCloseTo(0.2229, 4);
    const guard = { role: 'native', personality: 'match', mateR: 0.42, bond: 40 } as const;
    const guardNest = { ...guard, recentHelps: 2, cost: 'small', social: 60 } as const;
    expect(mateAcceptance(f, guardNest)).toBe(f.mate.acceptMax);

    const max = mateAcceptance(f, {
      role: 'native',
      personality: 'match',
      mateR: 1,
      bond: 100,
      recentHelps: 2,
      cost: 'small',
      social: 100,
    });
    expect(max).toBe(f.mate.acceptMax);
    expect(refusalEffect(f, 10, 0.5)).toBeCloseTo(8, 9);
  });
});
