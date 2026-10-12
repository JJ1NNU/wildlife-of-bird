import { z } from 'zod';
import { NodeId } from './nodes.ts';
import { Season, StatName } from './species.ts';

/**
 * 카드 턴 — `data/balance/cards.json` (소유: design)
 * 필드의 의미: `docs/design/specs/12-card-turn.md` 2장·8장. v1이 읽는 키만 둔다(11장).
 */

const positive = z.number().finite().positive();

/** 카드 id — 행동 카드 `forage`·`rest`·`social`·`explore`, 훈련 카드 `train-<스탯>` (12-card-turn 2.1) */
export const CardId = z.union([
  z.enum(['forage', 'rest', 'social', 'explore']),
  z.templateLiteral(['train-', StatName]),
]);
export type CardId = z.infer<typeof CardId>;

const PoolCard = z
  .object({
    /** 뽑기 가중치 (2.2) */
    weight: positive,
    /** 장소 id → 가중치 배율. 없는 장소는 1 */
    nodeMult: z.partialRecord(NodeId, positive).optional(),
    /** 계절 → 가중치 배율. 없는 계절은 1 */
    seasonMult: z.partialRecord(Season, positive).optional(),
  })
  .strict();
export type PoolCard = z.infer<typeof PoolCard>;

export const Cards = z
  .object({
    /** 나오는 장수 = 칸 수 + handBase + min(handExpCap, floor(경험 연수)) (2.2) */
    handBase: z.number().int().nonnegative(),
    handExpCap: z.number().int().nonnegative(),
    /** 3장 한도 선: 에너지를 줄이는 카드는 넣은 뒤 에너지가 지방 상한 × 이 몫 미만이면 막힘 */
    energyFloor: z.number().min(0).max(1),
    pool: z.partialRecord(CardId, PoolCard),
  })
  .strict();
export type Cards = z.infer<typeof Cards>;
