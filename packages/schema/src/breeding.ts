import { z } from 'zod';
import { RiskTier, Tier } from './effects.ts';
import { Phase, SpeciesId, StatName } from './species.ts';

/**
 * 번식 계수 — `data/balance/breeding.json` (소유: design)
 * 필드의 의미: `docs/design/specs/04-breeding.md` (키 이름으로 참조).
 * `formulas.json`처럼 키 하나하나 엄격히 검사한다. 키를 더하면 같은 PR에서 이 스키마를 고친다.
 */

const nonneg = z.number().finite().nonnegative();
const positive = z.number().finite().positive();
const probability = z.number().min(0).max(1);
/** 짝 r에 더하는 값 (2.6). 수락한 지시는 음수, 도움은 양수 */
const rDelta = z.number().min(-1).max(1);
const Sex = z.enum(['female', 'male']);

/** 지시를 받는 짝의 성별에 대한 역할 (3.2). `impossible`이면 불가 + 이유 */
const Role = z.enum(['native', 'shared', 'unusual', 'impossible']);

const Mate = z
  .object({
    candidates: z.number().int().positive(),
    candidatePotentialSd: nonneg,
    candidateCurrentRatio: probability,
    candidateAgeMin: z.number().int().positive(),
    candidateAgeMax: z.number().int().positive(),
    signalSd: nonneg,
    boldShare: probability,
    hintAccuracy: probability,
    revealAfterOrders: z.number().int().positive(),
    attractDisplayWeight: probability,
    reachMargin: nonneg,
    bondStart: nonneg,
    bondReunion: nonneg,
    bondPerAccepted: nonneg,
    bondMax: positive,
    rBase: probability,
  })
  .strict()
  .refine((m) => m.candidateAgeMin <= m.candidateAgeMax, {
    error: 'candidateAgeMin은 candidateAgeMax보다 클 수 없다',
    path: ['candidateAgeMin'],
  });

/** 짝 지시 하나 (3.2). 수락 시 효과 키는 쓰는 지시만 */
const Order = z
  .object({
    phases: z.array(Phase).min(1),
    role: z.partialRecord(Sex, Role),
    /** 성 갈등 등급 → `formulas.mate.costConflict` */
    cost: Tier.optional(),
    /** 성격 요인을 쓰는 지시인지 (3.3) */
    risky: z.boolean().optional(),
    mateR: rDelta.optional(),
    playerEnergyPerStep: nonneg.optional(),
    nestLossMult: nonneg.optional(),
    chickDeathMult: nonneg.optional(),
  })
  .strict()
  .refine(
    (o) =>
      Object.values(o.role).every((r) => r === 'impossible') ||
      (o.cost !== undefined && o.risky !== undefined && o.mateR !== undefined),
    { error: '할 수 있는 성별이 있는 지시는 cost · risky · mateR가 필요하다', path: ['cost'] },
  );

/** 도움 하나 (3.4) — 수락 판정 없음 */
const Help = z
  .object({ phases: z.array(Phase).min(1), sex: Sex, playerCostPerStep: nonneg, mateR: rDelta })
  .strict();

const Hole = z
  .object({
    nestLossMult: nonneg,
    contested: z.boolean(),
    /** 이 서식지 태그가 있는 장소에서만 나온다 */
    habitatAny: z.array(z.string().min(1)).min(1).optional(),
  })
  .strict();

/** 육아 방침 선택 하나의 효과 (6.1). 효과 없는 선택은 `{}` */
const ParentingOption = z
  .object({
    chickDeathMult: nonneg,
    topChickSilverSpoon: probability,
    fulfilmentMult: nonneg,
    playerRiskMult: nonneg,
    nestLossMult: nonneg,
    playerCostPerStep: nonneg,
    postFledgeChickDeathMult: nonneg,
    silverSpoon: z.number().min(-1).max(1),
    feedCostMult: nonneg,
    learnBonus: z.partialRecord(StatName, nonneg),
  })
  .partial()
  .strict();

/** 항목 하나의 선택들. **첫 선택이 기본값**(효과 없음) — JSON 키 순서를 그대로 쓴다 */
const ParentingItem = z
  .record(z.string().regex(/^[a-z][A-Za-z]*$/), ParentingOption)
  .refine((o) => Object.keys(o).length >= 2, { error: '선택이 2개 이상이어야 한다' })
  .refine((o) => Object.keys(Object.values(o)[0] ?? {}).length === 0, {
    error: '첫 선택은 기본값이라 효과가 없어야 한다({})',
  });

const SpeciesBreeding = z
  .object({
    mateYearSurvival: probability,
    divorce: z.object({ afterSuccess: probability, afterFailure: probability }).strict(),
    clutchOptions: z
      .array(z.number().int().positive())
      .min(1)
      .refine((c) => c.every((n, i) => i === 0 || (c[i - 1] ?? n) < n), {
        error: '작은 수부터 겹치지 않게',
      }),
    hatchRate: probability,
    layingCostPerEgg: nonneg,
  })
  .strict();

export const Breeding = z
  .object({
    mate: Mate,
    orders: z.record(z.string().regex(/^[a-z][A-Za-z]*$/), Order),
    help: z.record(z.string().regex(/^[a-z][A-Za-z]*$/), Help),
    nestSite: z
      .object({
        holes: z.record(z.string().regex(/^[a-z][A-Za-z]*$/), Hole),
        contestStat: StatName,
        /** 장소의 봄 경쟁 등급 → 판정 난이도 (`effects.checkDifficulty`). `none`은 판정 없이 성공 */
        contestDifficulty: z.record(z.enum(['low', 'medium', 'high']), RiskTier),
      })
      .strict(),
    /** 육아 방침 7항목 중 급이 강도(`low`·`mid`·`high`)는 `formulas.json`에 있다 */
    parenting: z
      .object({
        allocation: ParentingItem,
        foodQuality: ParentingItem,
        nestCare: ParentingItem,
        fledgeTiming: ParentingItem,
        postFledgeCare: ParentingItem,
        learning: ParentingItem,
      })
      .strict(),
    /** 종마다 다른 번식 계수. 종 id → 계수 */
    species: z.record(SpeciesId, SpeciesBreeding),
  })
  .strict();
export type Breeding = z.infer<typeof Breeding>;
