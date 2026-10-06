import { describe, expect, it } from 'vitest';
import type { RunState } from '../src/index.ts';
import { act, getChoices, getView, mateAccepts, newRun, preview } from '../src/index.ts';
import { testData } from './fixture.ts';

describe('상호 선택 (04-breeding 2.4 예시)', () => {
  it('매력 54, 품질 52 · 58 · 66 → 예 · 예 · 아니오', () => {
    expect(mateAccepts(testData, 50, 60, [52, 58, 66])).toEqual([true, true, false]);
  });

  it('매력 24 → 품질이 가장 낮은 카드만 예', () => {
    expect(mateAccepts(testData, 20, 30, [52, 58, 66])).toEqual([true, false, false]);
  });
});

describe('짝 후보 관문 (04-breeding 2.2, 00-core-loop 4.6)', () => {
  const start = newRun({ speciesId: 'parus-minor', seed: 'mate', mode: 'free' }, testData);
  /** `pairing` 첫 단계(`period 5`), 에너지 넉넉히, 과시·사회 높게 — 후보 여럿을 받아들이게 */
  const pairing: RunState = {
    ...start,
    at: { year: 1, period: 5, step: 1 },
    player: {
      ...start.player,
      energy: 60,
      stats: { ...start.player.stats, display: 90, social: 90 },
    },
  };
  // 포식으로 끝나지 않는 행동을 고른다 — 결정론이라 이 시드에서 늘 같다
  const opened = act(pairing, 'action.rest', testData).state;

  it('흐름의 마지막에 열리고, 그 단계에 머물며, 관문 선택지만 준다', () => {
    expect(opened.gameOver).toBe(false);
    expect(opened.at).toEqual(pairing.at);
    const choices = getChoices(opened, testData);
    expect(choices).toHaveLength(testData.breeding.mate.candidates);
    expect(choices.every((c) => c.kind === 'mateCandidate')).toBe(true);
    const cards = getView(opened, testData).gate?.cards ?? [];
    expect(cards.map((c) => c.choiceId)).toEqual(choices.map((c) => c.id));
    expect(preview(opened, choices[0]?.id ?? '', testData).deathRisk).toBe(0);
  });

  it('고르면 짝이 생기고 다음 단계로 간다. 같은 단계의 둘째 단계에서는 열리지 않는다', () => {
    const id = getChoices(opened, testData).find((c) => !c.disabled)?.id ?? '';
    const paired = act(opened, id, testData).state;
    expect(paired.gate).toBeUndefined();
    expect(paired.mate?.sex).toBe('male');
    expect(paired.mate?.bond).toBe(testData.breeding.mate.bondStart);
    expect(paired.at).toEqual({ year: 1, period: 5, step: 2 });
    expect(act(paired, 'action.rest', testData).state.gate).toBeUndefined();
  });

  it('받아들이는 카드가 1장뿐이면 자동 진행한다', () => {
    const lonely: RunState = {
      ...pairing,
      player: { ...pairing.player, stats: { ...pairing.player.stats, display: 0, social: 0 } },
    };
    const next = act(lonely, 'action.rest', testData).state;
    expect(next.gate).toBeUndefined();
    expect(next.mate).toBeDefined();
    expect(next.at.step).toBe(2);
  });
});
