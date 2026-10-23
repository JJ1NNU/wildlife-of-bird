import type { CardId, Cards, GameData, Season } from '@wb/schema';
import type { RngState } from './rng.ts';
import { nextFloat } from './rng.ts';

/** 패 — 카드 id → 장수 (12-card-turn 2장) */
export type Hand = Partial<Record<CardId, number>>;

/** 선택 id의 카드. 옮기기는 없음 */
export function cardOf(choiceId: string): CardId | undefined {
  const [head, action, stat] = choiceId.split('.');
  if (head !== 'action') return undefined;
  return (action === 'train' ? `train-${stat}` : action) as CardId;
}

/**
 * 카드 비용 (12-card-turn 3.1) = `cards.pool.<카드>.cost`, 없으면 `actions.<행동>.cost`.
 * 단계 예산과 실제 소비(01-formulas 9.4)가 같은 값을 쓴다. 카드가 아닌 선택(옮기기)은 undefined
 */
export function cardCost(choiceId: string, data: GameData): number | undefined {
  const card = cardOf(choiceId);
  if (!card) return undefined;
  const action = choiceId.split('.')[1] as keyof GameData['formulas']['actions'];
  return data.cards.pool[card]?.cost ?? data.formulas.actions[action]?.cost ?? 0;
}

/** 뽑기에 영향을 주는 지금 상황 */
export interface DrawAt {
  /** 이 단계의 칸 수 (00-core-loop 3.5) */
  slots: number;
  /** `period 1`을 지난 횟수 */
  expYears: number;
  node: string;
  season: Season;
}

/** 2.2 나오는 장수 = 칸 수 + handBase + min(handExpCap, floor(경험 연수)) */
export function handSize(cards: Cards, slots: number, expYears: number): number {
  return slots + cards.handBase + Math.min(cards.handExpCap, Math.floor(expYears));
}

/**
 * 2.2 패 뽑기: 카드마다 가중치 = weight × 장소 배율 × 계절 배율, 중복 허용, 장마다 난수 1번.
 * 같은 시드 = 같은 패 (11장). 풀이 비면 난수를 쓰지 않는다.
 */
export function drawHand(cards: Cards, at: DrawAt, rng: RngState): { hand: Hand; rng: RngState } {
  const weighted: [CardId, number][] = [];
  for (const [id, card] of Object.entries(cards.pool) as [CardId, Cards['pool'][CardId]][]) {
    if (!card) continue;
    weighted.push([
      id,
      card.weight * (card.nodeMult?.[at.node] ?? 1) * (card.seasonMult?.[at.season] ?? 1),
    ]);
  }
  const hand: Hand = {};
  if (weighted.length === 0) return { hand, rng };
  const total = weighted.reduce((sum, [, w]) => sum + w, 0);
  let state = rng;
  for (let i = 0; i < handSize(cards, at.slots, at.expYears); i++) {
    const rolled = nextFloat(state);
    state = rolled.state;
    let u = rolled.value * total;
    // 부동소수 끝자리로 끝까지 가면 마지막 카드
    let picked = weighted[weighted.length - 1]?.[0] as CardId;
    for (const [id, w] of weighted) {
      if (u < w) {
        picked = id;
        break;
      }
      u -= w;
    }
    hand[picked] = (hand[picked] ?? 0) + 1;
  }
  return { hand, rng: state };
}
