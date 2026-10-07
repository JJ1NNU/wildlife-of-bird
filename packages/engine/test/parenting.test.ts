import type { GameData } from '@wb/schema';
import { describe, expect, it } from 'vitest';
import { chickDeath } from '../src/formulas.ts';
import type { RunState } from '../src/index.ts';
import { act, getChoices, getView, newRun } from '../src/index.ts';
import { chickDeathMult } from '../src/parenting.ts';
import { actStep, testData, tit } from './fixture.ts';

const start = newRun({ speciesId: 'parus-minor', seed: 'parenting', mode: 'free' }, testData);
/** `incubation` 마지막 단계(`period 9` 단계 3), 짝 없음 — 다음 단계가 `nestling` 첫 단계 */
const lastIncubation: RunState = {
  ...start,
  at: { year: 1, period: 9, step: 3 },
  node: 'village-farmland',
  nest: { site: 'deep', node: 'village-farmland', eggs: 7 },
  player: { ...start.player, energy: 60 },
};
const titBreeding = testData.breeding.species['parus-minor'];
if (!titBreeding) throw new Error('breeding.json에 박새가 없다');
const sure: GameData = {
  ...testData,
  balance: new Map([...testData.balance, ['parus-minor', { ...tit, nestLossPerStep: 0 }]]),
  formulas: {
    ...testData.formulas,
    brood: { ...testData.formulas.brood, chickDeathPerStep: 0 },
  },
  breeding: {
    ...testData.breeding,
    species: {
      ...testData.breeding.species,
      'parus-minor': { ...titBreeding, hatchRate: 1 },
    },
  },
};
const A = 'parentingPolicy?intensity=high&nestCare=clean';
const B = 'parentingPolicy?allocation=compete&fledgeTiming=early&postFledgeCare=short';

describe('육아 방침 관문 (04-breeding 6장)', () => {
  const opened = actStep(lastIncubation, 'action.rest', sure).state;

  it('새끼가 깨면 nestling 첫 단계에 열리고, 고르면 같은 단계의 칸으로 간다', () => {
    expect(opened.at).toEqual({ year: 1, period: 10, step: 1 });
    expect(getChoices(opened, sure).map((c) => c.id)).toEqual(['parentingPolicy']);
    const view = getView(opened, sure);
    expect(view.gate?.kind === 'parentingPolicy' && view.gate.cards.map((i) => i.current)).toEqual([
      'mid',
      'even',
      'quantity',
      'feedFocus',
      'full',
      'long',
      'safe',
    ]);
    const closed = act(opened, A, sure).state;
    expect(closed.at).toEqual(opened.at);
    expect(closed.gate).toBeUndefined();
    expect(closed.parenting).toMatchObject({ intensity: 'high', nestCare: 'clean' });
  });

  it('예시 A·B의 새끼 사망 — 0.0119 · 0.014 / 0.025 · 0.04063', () => {
    const f = testData.formulas;
    const p = (choice: string, at: RunState['at']) => {
      const s = { ...act(opened, choice, sure).state, at };
      return chickDeath(f, (s.parenting?.intensity ?? 'mid') as 'mid') * chickDeathMult(s, sure);
    };
    const postFledge = { year: 1, period: 11, step: 1 };
    expect(p(A, opened.at)).toBeCloseTo(0.0119, 5);
    expect(p(A, postFledge)).toBeCloseTo(0.014, 5);
    expect(p(B, opened.at)).toBeCloseTo(0.025, 5);
    expect(p(B, postFledge)).toBeCloseTo(0.040625, 5);
  });

  it('예시 A·B의 내 번식 비용 — 9.6 / nestling 6.1 · postFledge 4.1', () => {
    const spent = (s: RunState) =>
      s.player.energy - actStep(s, 'action.rest', sure).state.player.energy;
    const brood = (choice: string, at: RunState['at']) => {
      const s = { ...act(opened, choice, sure).state, at };
      const { nest: _n, parenting: _p, ...none } = s;
      return spent(s) - spent(none);
    };
    expect(brood(A, opened.at)).toBeCloseTo(9.6);
    expect(brood(B, opened.at)).toBeCloseTo(6.1);
    expect(brood(B, { year: 1, period: 11, step: 1 })).toBeCloseTo(4.1);
  });

  it('postFledge 첫 단계에 다시 열리고, 둥지 관리·이소 시점은 못 바꾼다', () => {
    let s = act(opened, A, sure).state;
    while (s.at.period === 10) s = actStep(s, 'action.rest', sure).state;
    expect(s.gate?.kind).toBe('parentingPolicy');
    expect(() => act(s, 'parentingPolicy?nestCare=feedFocus', sure)).toThrow();
    const adjusted = act(s, 'parentingPolicy?intensity=low', sure).state;
    expect(adjusted.parenting).toMatchObject({ intensity: 'low', nestCare: 'clean' });
  });
});
