import type { Cards, GameData } from '@wb/schema';
import { describe, expect, it } from 'vitest';
import { drawHand, handSize } from '../src/cards.ts';
import type { RunState } from '../src/index.ts';
import { act, getChoices, getView, newRun, seedFromString } from '../src/index.ts';
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

describe('패로 칸 고르기 (11장 v1)', () => {
  // 사회 카드만 1장 + handBase로 한 장 더 → 사회 2장
  const data: GameData = {
    ...testData,
    cards: { ...cards, handBase: 1, handExpCap: 0, pool: { social: { weight: 1 } } },
  };
  const start = newRun({ speciesId: 'parus-minor', seed: 'hand', mode: 'free' }, data);
  const routine = (s: RunState) => getView(s, data).routine;

  it('패 밖 카드는 막히고, 늘 있는 카드(옮기기·채식·쉬기)는 열려 있다', () => {
    expect(start.gate).toBeUndefined();
    const choices = getChoices(start, data);
    const disabled = (id: string) => choices.find((c) => c.id === id)?.disabled;
    expect(disabled('action.explore')).toEqual({ reason: '패에 없음' });
    expect(disabled('action.train.flight')).toEqual({ reason: '패에 없음' });
    expect(disabled('action.forage')).toBeUndefined();
    expect(disabled('action.rest')).toBeUndefined();
    expect(choices.filter((c) => c.kind === 'node').every((c) => !c.disabled)).toBe(true);
  });

  it('고른 만큼 패가 준다', () => {
    const slots = routine(start)?.slots ?? 0;
    expect(routine(start)?.hand).toEqual({ social: slots + 1 });
    let s = start;
    for (let i = 0; i < slots - 1; i++) s = act(s, 'action.social', data).state;
    expect(routine(s)?.hand).toEqual({ social: 2 });
  });

  it('에너지 한도: 넣으면 바닥나는 카드는 막히고, 쉬기·옮기기는 열려 있다 (3장)', () => {
    // 섭취 없는 사회 카드를 에너지 바닥에서
    const actions = data.formulas.actions;
    const noIntake: GameData = {
      ...data,
      formulas: {
        ...data.formulas,
        actions: { ...actions, social: { ...actions.social, intakeMult: 0 } },
      },
    };
    const hungry = { ...start, player: { ...start.player, energy: 0.001 } };
    const choices = getChoices(hungry, noIntake);
    const disabled = (id: string) => choices.find((c) => c.id === id)?.disabled;
    expect(disabled('action.social')).toEqual({ reason: '에너지 부족' });
    expect(disabled('action.explore')).toEqual({ reason: '패에 없음' });
    expect(disabled('action.rest')).toBeUndefined();
    expect(choices.filter((c) => c.kind === 'node').every((c) => !c.disabled)).toBe(true);
  });
});
