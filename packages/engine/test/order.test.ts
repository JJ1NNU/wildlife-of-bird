import { describe, expect, it } from 'vitest';
import type { Mate, RunState } from '../src/index.ts';
import { act, contestChance, getChoices, getView, newRun } from '../src/index.ts';
import { actStep, testData } from './fixture.ts';

const start = newRun({ speciesId: 'parus-minor', seed: 'order', mode: 'free' }, testData);
const male: Mate = {
  sex: 'male',
  age: 1,
  expYears: 1,
  potential: {},
  stats: {},
  personality: 'bold',
  personalityKnown: false,
  bond: 20,
};
/** `pairing` 마지막 단계(`period 6` 단계 2), 짝 수컷, 봄 먹이 medium 장소 */
const lastPairing: RunState = {
  ...start,
  at: { year: 1, period: 6, step: 2 },
  node: 'old-broadleaf-forest',
  mate: male,
  player: { ...start.player, energy: 60, stats: { ...start.player.stats, display: 50 } },
};

describe('짝 지시 관문 (04-breeding 3장)', () => {
  it('짝이 있는 둥지 국면의 첫 단계, 첫 칸보다 먼저 열리고 고르면 같은 단계의 칸으로 간다', () => {
    const opened = actStep(lastPairing, 'action.rest', testData).state;
    expect(opened.at).toEqual({ year: 1, period: 7, step: 1 });
    expect(getChoices(opened, testData).map((c) => c.id)).toEqual([
      'mateOrder.none',
      'mateOrder.patrol',
    ]);
    expect(getView(opened, testData).routine).toBeUndefined();
    const closed = act(opened, 'mateOrder.none', testData).state;
    expect(closed.at).toEqual(opened.at);
    expect(closed.gate).toBeUndefined();
    expect(getView(closed, testData).routine?.filled).toEqual([]);
  });

  it('수컷 플레이어에게만 도움이 나오고, 포란하는 암컷 짝에게는 둥지 지키기가 없다', () => {
    const incubationStart: RunState = {
      ...lastPairing,
      at: { year: 1, period: 8, step: 3 },
      nest: { site: 'deep', node: 'old-broadleaf-forest', eggs: 8 },
      mate: { ...male, sex: 'female' },
      player: { ...lastPairing.player, sex: 'male' },
    };
    const opened = actStep(incubationStart, 'action.rest', testData).state;
    expect(getChoices(opened, testData).map((c) => c.id)).toEqual([
      'mateOrder.none',
      'help.feedMate',
    ]);
  });

  it('수락률 예시 1 — 암컷 → courtshipFeed, r 0.6, 유대 20, 도움 0, 사회 60 → 0.6767', () => {
    const layingStart: RunState = {
      ...lastPairing,
      at: { year: 1, period: 8, step: 1 },
      node: 'forest-edge',
      nest: { site: 'deep', node: 'forest-edge' },
      player: { ...lastPairing.player, stats: { ...lastPairing.player.stats, social: 60 } },
      gate: { kind: 'mateOrder', options: ['mateOrder.none', 'mateOrder.courtshipFeed'] },
    };
    const p = act(layingStart, 'mateOrder.courtshipFeed', testData).log[0]?.deltas?.acceptance;
    expect(p).toBeCloseTo(0.6767, 4);
  });

  it('patrol 수락이면 경쟁 확률 1, 거절 f 0.8이면 p + 0.8 × (1 − p) (4장 예시)', () => {
    const at7 = { ...lastPairing, at: { year: 1, period: 7, step: 1 } };
    const order = (accepted: boolean, effect: number): RunState => ({
      ...at7,
      order: { id: 'mateOrder.patrol', phase: 'nestSite', accepted, effect, mateR: 0 },
    });
    expect(contestChance(testData, at7)).toBeCloseTo(0.3);
    expect(contestChance(testData, order(true, 1))).toBe(1);
    expect(contestChance(testData, order(false, 0.8))).toBeCloseTo(0.86);
  });

  it('courtshipFeed 수락이면 laying 단계마다 소비가 4 준다 (6.3)', () => {
    const laying: RunState = {
      ...lastPairing,
      at: { year: 1, period: 8, step: 2 },
      nest: { site: 'deep', node: 'old-broadleaf-forest', eggs: 8 },
    };
    const fed: RunState = {
      ...laying,
      order: {
        id: 'mateOrder.courtshipFeed',
        phase: 'laying',
        accepted: true,
        effect: 1,
        mateR: -0.1,
      },
    };
    const energy = (s: RunState) => actStep(s, 'action.rest', testData).state.player.energy;
    expect(energy(fed) - energy(laying)).toBeCloseTo(4);
  });
});
