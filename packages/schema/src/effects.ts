import { z } from 'zod';

/**
 * 효과 등급표 — `data/balance/effects.json` (소유: design, 03-contracts 4.2)
 *
 * 콘텐츠는 이벤트에 숫자 대신 등급(`small`·`low` 등)을 쓰고,
 * 디자인은 이 표만 바꿔 전체 밸런스를 조정한다.
 */
export const Tier = z.enum(['small', 'medium', 'large']);
export type Tier = z.infer<typeof Tier>;

export const RiskTier = z.enum(['low', 'medium', 'high']);
export type RiskTier = z.infer<typeof RiskTier>;

export const WeightTier = z.enum(['common', 'uncommon', 'rare']);
export type WeightTier = z.infer<typeof WeightTier>;

const amount = z.number().finite();

export const EffectsTable = z
  .object({
    energy: z.record(Tier, amount),
    feather: z.record(Tier, amount),
    deathRisk: z.record(RiskTier, amount),
    broodRisk: z.record(RiskTier, amount),
    statGain: z.record(Tier, amount),
    eventWeight: z.record(WeightTier, amount),
  })
  .strict();
export type EffectsTable = z.infer<typeof EffectsTable>;
