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

/**
 * 등급 → 숫자. 각 효과의 의미는 `docs/design/specs/03-events.md` 6장 (#54 결정).
 * 표의 모든 등급이 있어야 한다.
 */
export const EffectsTable = z
  .object({
    energy: z.record(Tier, amount),
    feather: z.record(Tier, amount),
    deathRisk: z.record(RiskTier, amount),
    broodRisk: z.record(RiskTier, amount),
    /** 새끼 일부 사망 비율 */
    chickLoss: z.record(Tier, amount),
    statGain: z.record(Tier, amount),
    /** 짝 유대 변화 */
    bond: z.record(Tier, amount),
    /** 부상 단계 수 */
    injury: z.record(Tier, z.number().int().positive()),
    /** 그 시기 동안 위험 보정 × (1 + 값) */
    riskMod: z.record(RiskTier, amount),
    /** 그 시기 동안 섭취 보정 × (1 ± 값) */
    foodMod: z.record(Tier, amount),
    eventWeight: z.record(WeightTier, amount),
    /** 판정형 선택지의 난이도(비교할 스탯 값) */
    checkDifficulty: z.record(RiskTier, amount),
  })
  .strict();
export type EffectsTable = z.infer<typeof EffectsTable>;
