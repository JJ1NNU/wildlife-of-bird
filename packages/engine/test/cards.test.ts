import type { Cards } from '@wb/schema';
import { describe, expect, it } from 'vitest';
import { drawHand, handSize } from '../src/cards.ts';
import { seedFromString } from '../src/index.ts';
import { testData } from './fixture.ts';

const cards = testData.cards;
const at = { slots: 6, expYears: 0, node: 'forest-edge', season: 'winter' } as const;

describe('나오는 장수 (12-card-turn 2.2 예시)', () => {
  it('평시 6칸 · 경험 0년 → 7장', () => expect(handSize(cards, 6, 0)).toBe(7));
  it('경험 3년 이상 → 10장', () => expect(handSize(cards, 6, 5)).toBe(10));
  it('번식기 3칸 · 경험 1년 → 5장', () => expect(handSize(cards, 3, 1)).toBe(5));
});

describe('패 뽑기 (2.2)', () => {
  it('같은 시드 = 같은 패, 장수 합 = 나오는 장수', () => {
    const a = drawHand(cards, at, seedFromString('hand'));
    const b = drawHand(cards, at, seedFromString('hand'));
    expect(a).toEqual(b);
    expect(Object.values(a.hand).reduce((s, n) => s + (n ?? 0), 0)).toBe(7);
  });
  it('계절 배율이 가중치에 곱해진다', () => {
    const skewed: Cards = {
      ...cards,
      pool: { ...cards.pool, 'train-display': { weight: 1, seasonMult: { winter: 1e6 } } },
    };
    expect(drawHand(skewed, at, seedFromString('hand')).hand).toEqual({ 'train-display': 7 });
  });
});
