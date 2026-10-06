import type { GameData } from '@wb/schema';
import { describe, expect, it } from 'vitest';
import type { RunState } from '../src/index.ts';
import { act, contestChance, getChoices, getView, nestHoles, newRun } from '../src/index.ts';
import { actStep, testData } from './fixture.ts';

const start = newRun({ speciesId: 'parus-minor', seed: 'nest', mode: 'free' }, testData);
const withDisplay = (node: string, display: number): RunState => ({
  ...start,
  node,
  player: { ...start.player, stats: { ...start.player.stats, display } },
});

describe('둥지 자리 경쟁 확률 (04-breeding 4장 예시)', () => {
  it('봄 경쟁 high, 과시 50 → 0.3', () => {
    expect(contestChance(testData, withDisplay('old-broadleaf-forest', 50))).toBeCloseTo(0.3);
  });
  it('봄 경쟁 low, 과시 50 → 0.9', () => {
    expect(contestChance(testData, withDisplay('village-farmland', 50))).toBeCloseTo(0.9);
  });
});

describe('둥지 자리 관문 (04-breeding 1·4장)', () => {
  it('인공새집은 사람 사는 곳에서만 나온다', () => {
    expect(nestHoles(testData, 'old-broadleaf-forest')).toEqual(['deep', 'shallow']);
    expect(nestHoles(testData, 'village-farmland')).toContain('nestBox');
  });

  const paired = actStep(
    {
      ...start,
      at: { year: 1, period: 5, step: 1 },
      player: {
        ...start.player,
        energy: 60,
        stats: { ...start.player.stats, display: 0, social: 0 },
      },
    },
    'action.rest',
    testData,
  ).state;
  /** `nestSite` 첫 단계(`period 7`), 짝 있음 */
  const nestStart: RunState = {
    ...paired,
    at: { year: 1, period: 7, step: 1 },
    node: 'village-farmland',
    player: { ...paired.player, energy: 60, stats: { ...paired.player.stats, display: 50 } },
  };

  it('짝이 있으면 첫 단계 흐름의 마지막에 열리고, 고르면 둥지 국면 동안 옮길 수 없다', () => {
    expect(paired.mate).toBeDefined();
    const opened = actStep(nestStart, 'action.rest', testData).state;
    expect(opened.gameOver).toBe(false);
    expect(opened.at).toEqual(nestStart.at);
    expect(getChoices(opened, testData).map((c) => c.id)).toEqual([
      'nestSite.deep',
      'nestSite.shallow',
      'nestSite.nestBox',
    ]);
    expect(getView(opened, testData).gate?.cards[0]).toMatchObject({
      contestChance: expect.closeTo(0.9),
    });

    const built = act(opened, 'nestSite.nestBox', testData).state;
    expect(built.nest).toEqual({ site: 'nestBox', node: 'village-farmland' });
    expect(built.at).toEqual({ year: 1, period: 7, step: 2 });
    const moves = getChoices(built, testData).filter((c) => c.kind === 'node');
    expect(moves.every((c) => c.disabled?.reason === '둥지를 떠날 수 없다')).toBe(true);

    // postFledge(`period 11`)로 넘어가면 둥지를 거두고 다시 옮길 수 있다
    const late = actStep(
      { ...built, at: { year: 1, period: 10, step: 3 } },
      'action.rest',
      testData,
    );
    expect(late.state.nest).toBeUndefined();
    expect(getChoices(late.state, testData).some((c) => c.kind === 'node' && !c.disabled)).toBe(
      true,
    );
  });

  it('짝이 없으면 열리지 않는다', () => {
    const { mate: _m, ...single } = nestStart;
    expect(actStep(single, 'action.rest', testData).state.gate).toBeUndefined();
  });
});

describe('산란수 관문 (04-breeding 5장)', () => {
  /** `laying` 첫 단계(`period 8`), 둥지 있음 */
  const layingStart: RunState = {
    ...start,
    at: { year: 1, period: 8, step: 1 },
    node: 'village-farmland',
    nest: { site: 'nestBox', node: 'village-farmland' },
    player: { ...start.player, energy: 60 },
  };

  it('첫 단계 흐름의 마지막에 열리고, 고른 뒤 laying 단계마다 암컷이 알 수 × 0.4를 더 쓴다', () => {
    const opened = actStep(layingStart, 'action.rest', testData).state;
    expect(opened.at).toEqual(layingStart.at);
    expect(getChoices(opened, testData).map((c) => c.id)).toEqual([
      'clutchSize.6',
      'clutchSize.8',
      'clutchSize.10',
    ]);
    const card = getView(opened, testData).gate?.cards[0];
    expect(card).toMatchObject({ eggs: 6, layingCost: expect.closeTo(2.4) });

    const laid = act(opened, 'clutchSize.8', testData).state;
    expect(laid.nest?.eggs).toBe(8);
    expect(laid.at).toEqual({ year: 1, period: 8, step: 2 });
    const without = { ...laid, nest: { site: 'nestBox', node: 'village-farmland' } };
    const spent = (s: RunState) =>
      s.player.energy - actStep(s, 'action.rest', testData).state.player.energy;
    expect(spent(laid) - spent(without)).toBeCloseTo(3.2);
    const male = (s: RunState): RunState => ({ ...s, player: { ...s.player, sex: 'male' } });
    expect(spent(male(laid))).toBeCloseTo(spent(male(without)));
  });

  it('둥지가 없으면 열리지 않는다', () => {
    const { nest: _n, ...noNest } = layingStart;
    expect(actStep(noNest, 'action.rest', testData).state.gate).toBeUndefined();
  });
});

describe('부화 (04-breeding 5장)', () => {
  /** `incubation` 마지막 단계(`period 9` 단계 3), 알 8개 */
  const lastIncubation: RunState = {
    ...start,
    at: { year: 1, period: 9, step: 3 },
    node: 'village-farmland',
    nest: { site: 'nestBox', node: 'village-farmland', eggs: 8 },
    player: { ...start.player, energy: 60 },
  };
  const withHatchRate = (hatchRate: number): GameData => {
    const s = testData.breeding.species['parus-minor'];
    if (!s) throw new Error('fixture에 박새 번식 데이터가 없다');
    return {
      ...testData,
      breeding: {
        ...testData.breeding,
        species: { ...testData.breeding.species, 'parus-minor': { ...s, hatchRate } },
      },
    };
  };

  it('incubation 마지막 단계에서만 알마다 굴려 새끼 수를 정한다', () => {
    const early = { ...lastIncubation, at: { year: 1, period: 9, step: 2 } };
    expect(actStep(early, 'action.rest', testData).state.nest?.chicks).toBeUndefined();
    expect(actStep(lastIncubation, 'action.rest', withHatchRate(1)).state.nest?.chicks).toBe(8);
  });

  it('하나도 안 깨면 번식 실패(B-5) — 둥지를 거둔다', () => {
    const r = actStep(lastIncubation, 'action.rest', withHatchRate(0));
    expect(r.state.nest).toBeUndefined();
    expect(r.log.some((l) => l.cause === 'hatchFailure')).toBe(true);
  });
});

describe('새끼 급이·개별 사망 (01-formulas 2.4·3.3)', () => {
  /** `nestling` 첫 단계(`period 10` 단계 1), 새끼 6 */
  const nestling: RunState = {
    ...start,
    at: { year: 1, period: 10, step: 1 },
    node: 'village-farmland',
    nest: { site: 'nestBox', node: 'village-farmland', eggs: 8, chicks: 6 },
    player: { ...start.player, energy: 60 },
  };
  const withChickDeath = (chickDeathPerStep: number): GameData => ({
    ...testData,
    formulas: { ...testData.formulas, brood: { ...testData.formulas.brood, chickDeathPerStep } },
  });

  it('새끼가 있으면 급이 비용(mid + 새끼당)을 낸다', () => {
    const data = withChickDeath(0);
    const spent = (s: RunState) =>
      s.player.energy - actStep(s, 'action.rest', data).state.player.energy;
    const { nest: _n, ...noNest } = nestling;
    const e = testData.formulas.energy;
    expect(spent(nestling) - spent(noNest)).toBeCloseTo(
      e.feedCostByIntensity.mid + e.feedCostPerChick * 6,
    );
  });

  it('새끼가 모두 죽으면 번식 실패(B-5) — 둥지를 거둔다', () => {
    const r = actStep(nestling, 'action.rest', withChickDeath(1));
    expect(r.state.nest).toBeUndefined();
    expect(r.log.some((l) => l.cause === 'chickDeath')).toBe(true);
  });

  it('postFledge 동안 새끼와 함께 남고, 옮길 수 있다', () => {
    const fledged = { ...nestling, at: { year: 1, period: 11, step: 1 } };
    const r = actStep(fledged, 'action.rest', withChickDeath(0));
    expect(r.state.nest?.chicks).toBe(6);
    expect(getChoices(r.state, testData).some((c) => c.kind === 'node' && !c.disabled)).toBe(true);
  });
});
