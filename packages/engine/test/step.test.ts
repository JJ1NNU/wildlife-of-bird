import type { GameData } from '@wb/schema';
import { describe, expect, it } from 'vitest';
import type { RunState } from '../src/index.ts';
import { act, getChoices, newRun, preview } from '../src/index.ts';
import { testData } from './fixture.ts';

const start = newRun({ speciesId: 'parus-minor', seed: 'step', mode: 'free' }, testData);

/** 00-core-loop 3.1 예시의 장소: 먹이 medium · 경쟁 low · 위험 medium */
const edge = testData.nodes.get('forest-edge');
if (!edge) throw new Error('data/nodes/forest-edge.json 이 없다');
const tiers = { food: 'medium', risk: 'medium', competition: 'low' } as const;
const data: GameData = {
  ...testData,
  nodes: new Map(testData.nodes).set('forest-edge', {
    ...edge,
    seasons: { winter: tiers, spring: tiers, summer: tiers, autumn: tiers },
  }),
};

/** 3.1 예시의 입력: `period 2` 겨울, 에너지 40 / 지방 상한 67, 깃털 60, 채식·경계 70, 경험 1년, 나이 1, 연속 체류 2 */
const example: RunState = {
  ...start,
  at: { year: 1, period: 2, step: 1 },
  node: 'forest-edge',
  stay: 1,
  player: {
    ...start.player,
    energy: 40,
    feather: 60,
    age: 1,
    expYears: 1,
    stats: { ...start.player.stats, stamina: 34, foraging: 70, vigilance: 70 },
  },
};

describe('한 단계의 판정 (00-core-loop 3.1)', () => {
  it('채식: 에너지 → 스탯 → 위험 순서로 예시 값이 나온다', () => {
    const p = preview(example, 'action.forage', data);
    expect(p.energyDelta[0]).toBeCloseTo(38.496 - 40, 6);
    expect(p.deathRisk).toBeCloseTo(0.004155, 6);
    expect(p.statGains?.vigilance).toBeUndefined();

    const { state, log } = act(example, 'action.forage', data);
    expect(state.player.energy).toBeCloseTo(38.496, 6);
    expect(state.player.feather).toBeCloseTo(58.5, 6);
    expect(log[0]?.type).toBe('decision');
  });

  it('살피기: 같은 단계에 오른 경계가 그 단계의 위험을 낮춘다', () => {
    const before = { ...example, player: { ...example.player, potential: { vigilance: 100 } } };
    const p = preview(before, 'action.explore', data);
    const gained = p.statGains?.vigilance ?? 0;
    expect(gained).toBeGreaterThan(0);
    const unchanged = 0.007 * 1.3 * (1 - 0.004 * 70) * 0.97 * 0.85;
    expect(p.deathRisk).toBeLessThan(unchanged);
  });

  it('B-1 에너지 0: 즉시 아사, 난수를 당기지 않는다', () => {
    const hungry = { ...example, player: { ...example.player, energy: 1 } };
    const { state, log } = act(hungry, 'action.train.flight', data);
    expect(state.gameOver).toBe(true);
    expect(state.player.energy).toBe(0);
    expect(state.rng).toBe(hungry.rng);
    expect(log.at(-1)?.cause).toBe('starvation');
  });
});

describe('선택지 (03-contracts 3장 선택지 ID)', () => {
  it('행동 4 + 적성 스탯마다 훈련 + 연결된 장소마다 옮기기', () => {
    const ids = getChoices(start, testData).map((c) => c.id);
    expect(ids).toContain('action.forage');
    expect(ids).toContain('action.train.flight');
    expect(ids).not.toContain('action.train');
    const moves = ids.filter((id) => id.startsWith('move.'));
    expect(moves).toHaveLength(edge.links.length);
  });

  it('옮기면 새 장소에 체류 0으로 선다', () => {
    const { state } = act(start, 'move.pine-forest', testData);
    expect(state.node).toBe('pine-forest');
    expect(state.stay).toBe(0);
  });
});
