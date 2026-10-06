import { describe, expect, it } from 'vitest';
import type { RunState } from '../src/index.ts';
import { act, contestChance, getChoices, getView, nestHoles, newRun } from '../src/index.ts';
import { testData } from './fixture.ts';

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

  const paired = act(
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
    const opened = act(nestStart, 'action.rest', testData).state;
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
    const late = act({ ...built, at: { year: 1, period: 10, step: 3 } }, 'action.rest', testData);
    expect(late.state.nest).toBeUndefined();
    expect(getChoices(late.state, testData).some((c) => c.kind === 'node' && !c.disabled)).toBe(
      true,
    );
  });

  it('짝이 없으면 열리지 않는다', () => {
    const { mate: _m, ...single } = nestStart;
    expect(act(single, 'action.rest', testData).state.gate).toBeUndefined();
  });
});
