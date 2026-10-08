import type { GameData, SeasonPolicyEffect } from '@wb/schema';
import { describe, expect, it } from 'vitest';
import type { RunState } from '../src/index.ts';
import { getChoices, getView, newRun } from '../src/index.ts';
import { nestLossChance } from '../src/nest.ts';
import { judgeStep } from '../src/step.ts';
import { actStep, seasonData } from './fixture.ts';

const start = newRun({ speciesId: 'parus-minor', seed: 'season', mode: 'free' }, seasonData);
const at = (period: number, step = 1): RunState => ({
  ...start,
  at: { year: 1, period, step },
  player: { ...start.player, energy: 60 },
});
const policy = (s: RunState, season: 'winter' | 'spring' | 'summer', id: string): RunState => ({
  ...s,
  seasonPolicy: { season, id },
});

describe('계절 방침 관문 (11-season-policy 1장, 00-core-loop 4.6)', () => {
  // 봄 첫 단계(`period` 5) — 짝 후보 관문보다 먼저 열린다
  const opened = actStep(at(5), 'action.rest', seasonData).state;

  it('계절 첫 시기의 첫 단계 흐름 끝에 열리고 그 계절의 방침만 준다', () => {
    expect(opened.gate?.kind).toBe('seasonPolicy');
    expect(opened.at).toEqual({ year: 1, period: 5, step: 1 });
    expect(getChoices(opened, seasonData).map((c) => c.id)).toEqual([
      'seasonPolicy.balanced',
      'seasonPolicy.nestFocus',
      'seasonPolicy.selfCare',
    ]);
    const gate = getView(opened, seasonData).gate;
    expect(gate?.kind === 'seasonPolicy' && gate.cards[2]?.effects.nestLossMult).toBe(1.1);
  });

  it('고르면 걸리고, 같은 단계의 나머지 관문(짝 후보)으로 이어진다', () => {
    const r = actStep(opened, 'seasonPolicy.selfCare', seasonData).state;
    expect(r.seasonPolicy).toEqual({ season: 'spring', id: 'selfCare' });
    expect(r.gate?.kind === 'mateCandidate' || r.at.period === 5).toBe(true);
    expect(r.gate?.kind).not.toBe('seasonPolicy');
  });

  it('계절 중간 시기에는 열리지 않고, 계절이 바뀌면 지난 방침을 거둔다', () => {
    const mid = actStep(policy(at(14, 2), 'summer', 'explore'), 'action.rest', seasonData).state;
    expect(mid.gate).toBeUndefined();
    expect(mid.seasonPolicy?.id).toBe('explore');
    const autumn = actStep(policy(at(16), 'summer', 'explore'), 'action.rest', seasonData);
    expect(autumn.state.at.period).toBe(17);
    expect(autumn.state.seasonPolicy).toBeUndefined();
  });
});

describe('계절 방침 효과 (11-season-policy 3장)', () => {
  /** 효과 키 하나만 가진 방침 `x`를 겨울에 건 데이터·상태 — 키마다 따로 확인한다 */
  const only = (fx: SeasonPolicyEffect): GameData => ({
    ...seasonData,
    seasonPolicy: { policies: { x: fx }, species: {} },
  });
  // 에너지 상한에 닿지 않게
  const winter: RunState = { ...at(2), player: { ...at(2).player, energy: 20 } };
  const withX = policy(winter, 'winter', 'x');

  it('위험 × playerRiskMult', () => {
    const base = judgeStep(winter, 'action.forage', seasonData, 1).risk;
    expect(judgeStep(withX, 'action.forage', only({ playerRiskMult: 0.85 }), 1).risk).toBeCloseTo(
      base * 0.85,
      12,
    );
  });

  it('소비 + playerCostPerStep', () => {
    const base = judgeStep(winter, 'action.forage', seasonData, 1).energy;
    const out = judgeStep(withX, 'action.forage', only({ playerCostPerStep: -1.5 }), 1).energy;
    expect(out - base).toBeCloseTo(1.5, 9);
  });

  it('섭취 × intakeMult', () => {
    const e = (m: number) => judgeStep(withX, 'action.forage', only({ intakeMult: m }), 1).energy;
    expect(e(0.85) - e(1)).toBeCloseTo(0.15 * (e(0) - e(1)), 9);
  });

  it('털갈이 깃털 회복 × moltRecoverMult — 여름 moltFocus (예시 60 → 70)', () => {
    const molt: RunState = { ...at(13), player: { ...at(13).player, feather: 60 } };
    const out = judgeStep(policy(molt, 'summer', 'moltFocus'), 'action.forage', seasonData, 1);
    expect(out.feather).toBeCloseTo(70, 9);
  });

  it('스탯 상승 × statGainMult — 여름 explore 1.2', () => {
    const s = at(14);
    const gain = (r: RunState) =>
      (judgeStep(r, 'action.train.flight', seasonData, 1).stats.flight ?? 0) -
      (s.player.stats.flight ?? 0);
    expect(gain(policy(s, 'summer', 'explore'))).toBeCloseTo(gain(s) * 1.2, 9);
  });

  it('둥지 손실 × nestLossMult — 봄 selfCare 1.1', () => {
    const s = at(9);
    const base = nestLossChance(s, seasonData, 'deep');
    expect(nestLossChance(policy(s, 'spring', 'selfCare'), seasonData, 'deep')).toBeCloseTo(
      base * 1.1,
      12,
    );
  });
});
