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
    /** 카드 비용 — 단계 예산과 실제 소비 (3.1). 없으면 `actions.<행동>.cost` */
    cost: z.number().finite().nonnegative().optional(),
    /** 어린 새(나이 0)도 뽑는 카드 (2.6). 없으면 성조만 */
    juvenile: z.literal(true).optional(),
    /** 성조 보너스 (2.6) — 어린 새에게는 없다 */
    adult: z
      .object({
        /** 그 칸의 `actions.<행동>.intakeMult`를 바꾼다 */
        intakeMult: z.number().finite().nonnegative().optional(),
        /** 그 칸의 `actions.<행동>.riskMult`를 바꾼다 */
        riskMult: z.number().finite().nonnegative().optional(),
        /** 행동의 기본 성장(`actions.<행동>.gain`)에 더한다 */
        gain: z.partialRecord(StatName, positive).optional(),
        /** 쓴 다음 단계 패 장수 + (같은 단계에 여러 장 써도 최댓값 하나) */
        nextHand: z.number().int().positive().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
export type PoolCard = z.infer<typeof PoolCard>;

export const Cards = z
  .object({
    /** 나오는 장수 = 칸 수 + handBase + min(handExpCap, floor(경험 연수)) (2.2) */
    handBase: z.number().int().nonnegative(),
    handExpCap: z.number().int().nonnegative(),
    /** 3장 단계 예산: 칸당 평균 행동 비용 상한 — 비용 합이 이 값 × 칸 수를 넘는 카드는 막힘 */
    stepBudget: z.number().positive(),
    pool: z.partialRecord(CardId, PoolCard),
  })
  .strict();
export type Cards = z.infer<typeof Cards>;
