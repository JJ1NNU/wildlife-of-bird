import type { GameData } from '@wb/schema';
import { describe, expect, it } from 'vitest';
import type { RunState } from '../src/index.ts';
import { act, getChoices, getView, newRun, preview } from '../src/index.ts';
import { actStep, testData } from './fixture.ts';

/** 그 단계의 칸 수 = 6 ÷ 그 시기의 단계 수 */
const slotsOf = (s: RunState) => 6 / (s.calendar[s.at.period - 1]?.length ?? 1);

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
    stats: { ...start.player.stats, stamina: 34, foraging: 70, vigilance: 70, flight: 40 },
  },
};

describe('런 시작 개체 (05-inheritance 2장)', () => {
  it('잠재력은 종 평균, 현재값은 × 0.85, 에너지·깃털·경험은 시작값', () => {
    const p = start.player;
    expect(p.potential.foraging).toBe(70);
    expect(p.stats.flight).toBeCloseTo(39.1, 9);
    expect(p.stats.foraging).toBeCloseTo(59.5, 9);
    expect(p.stats.stamina).toBeCloseTo(28.9, 9);
    expect(p.energy).toBeCloseTo(45.115, 9);
    expect(p.feather).toBe(80);
    expect(p.expYears).toBe(1);
  });
});

describe('칸 하나의 판정 (00-core-loop 3.1, 01-formulas 9.4)', () => {
  it('채식 칸: 단계 값 ÷ 6, 위험은 1 − (1 − p)^(1/6) — 3.1 예시를 칸으로 나눈 값', () => {
    // 연속 체류 12칸 ÷ 6 = 2단계, 칸 뒤 에너지가 3.1 예시의 41.089가 되게 맞춘 입력
    const slotGain = (41.089 - 40 + 1) / 6;
    const slot = { ...example, stay: 11, player: { ...example.player, energy: 41.089 - slotGain } };
    const p = preview(slot, 'action.forage', data);
    expect(p.energyDelta[0]).toBeCloseTo(slotGain, 6);
    expect(p.deathRisk).toBeCloseTo(1 - (1 - 0.004155) ** (1 / 6), 6);
  });

  it('칸 채우기는 판정·난수 없이 적어 두고, 마지막 칸이 루틴을 실행한다', () => {
    const filled = act(example, 'action.forage', data);
    expect(filled.log).toEqual([]);
    expect(filled.state.rng).toBe(example.rng);
    expect(filled.state.player).toEqual(example.player);
    expect(getView(filled.state, data).routine).toMatchObject({
      slots: 6,
      filled: ['action.forage'],
    });

    const { state, log } = actStep(example, 'action.forage', data);
    expect(log.map((l) => l.type)).toEqual(['decision', ...Array(6).fill('slot')]);
    expect(log[6]?.slot).toBe(6);
    expect(state.at.period).toBe(3);
    expect(state.stay).toBe(7);
    expect(getView(state, data).routine?.suggested).toEqual(Array(6).fill('action.forage'));
  });

  it('살피기: 같은 단계에 오른 경계가 그 단계의 위험을 낮춘다', () => {
    const before = { ...example, player: { ...example.player, potential: { vigilance: 100 } } };
    const p = preview(before, 'action.explore', data);
    const gained = p.statGains?.vigilance ?? 0;
    expect(gained).toBeGreaterThan(0);
    const unchanged = 0.007 * 1.3 * (1 - 0.004 * 70) * 0.97 * 0.85;
    expect(p.deathRisk).toBeLessThan(unchanged);
  });

  it('계승한 새끼: 나이 ≤ growthUntilAge 동안 스탯 상승 × 은수저 성장 배율 (01-formulas 1.3·6.2)', () => {
    const gainAt = (player: Partial<RunState['player']>) =>
      preview(
        { ...example, player: { ...example.player, potential: { vigilance: 100 }, ...player } },
        'action.explore',
        data,
      ).statGains?.vigilance ?? 0;
    const plain = gainAt({});
    // 은수저 지수 1 → 0.8 + 0.4 × 1 = 1.2
    expect(gainAt({ silverSpoon: 1, age: 1 })).toBeCloseTo(plain * 1.2, 9);
    expect(gainAt({ silverSpoon: 1, age: 2 })).toBeCloseTo(plain, 9);
  });

  it('B-1 에너지 0: 즉시 아사, 난수를 당기지 않는다', () => {
    const hungry = { ...example, player: { ...example.player, energy: 1 } };
    const { state, log } = actStep(hungry, 'action.train.flight', data);
    expect(state.gameOver).toBe(true);
    expect(state.player.energy).toBe(0);
    expect(state.rng).toBe(hungry.rng);
    expect(log[0]?.type).toBe('decision');
    expect(log.at(-1)).toMatchObject({ cause: 'starvation', slot: 1 });
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

  it('옮긴 다음 칸부터 새 장소 기준이고, 체류는 칸마다 센다', () => {
    let s = act(start, 'move.pine-forest', testData).state;
    expect(getChoices(s, testData).map((c) => c.id)).toContain('move.forest-edge');
    while (s.routine?.length) s = act(s, 'action.rest', testData).state;
    expect(s.node).toBe('pine-forest');
    expect(s.stay).toBe(slotsOf(start) - 1);
  });
});
