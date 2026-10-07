import { z } from 'zod';
import { Tier } from './effects.ts';
import { CompetitionTier, FoodTier, NodeRiskTier } from './nodes.ts';
import { Grade, StatName } from './species.ts';

/**
 * 종 공통 공식 계수 — `data/balance/formulas.json` (소유: design)
 * 필드의 의미: `docs/design/specs/01-formulas.md` (#54 결정).
 *
 * **키 하나하나 엄격히** 검사한다. 오타 난 키가 조용히 기본값으로 빠지면 밸런스 버그를
 * 찾기 어렵기 때문이다. 키를 더하거나 바꾸면 이 스키마를 같은 PR에서 고친다(`review:engine`).
 */

const num = z.number().finite();
const nonneg = z.number().finite().nonnegative();
const probability = z.number().min(0).max(1);
const int = z.number().int().nonnegative();

/** 육아 강도 (`04-breeding`) */
const Intensity = z.enum(['low', 'mid', 'high']);

const table = <const K extends readonly [string, ...string[]]>(keys: K, value: z.ZodType<number>) =>
  z.record(z.enum(keys), value);

/** 행동 하나의 계수 */
const Action = z
  .object({
    intakeMult: nonneg,
    cost: nonneg,
    riskMult: nonneg,
    /** 오르는 스탯. `chosen` = 훈련에서 플레이어가 고른 스탯 */
    gain: z.partialRecord(z.enum([...StatName.options, 'chosen']), num),
    featherRecover: nonneg.optional(),
  })
  .strict();

export const Formulas = z
  .object({
    stats: z
      .object({
        min: num,
        max: num,
        /** 표시 등급과 시작 값. 낮은 등급부터 오름차순 */
        grades: z
          .array(
            z
              .object({ grade: z.enum(['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S']), from: num })
              .strict(),
          )
          .min(1)
          .refine((g) => g.every((x, i) => i === 0 || (g[i - 1]?.from ?? 0) < x.from), {
            error: 'grades는 from이 커지는 순서여야 한다',
          }),
        aptitudeMean: z.partialRecord(Grade, num),
        aptitudeGrowth: z.partialRecord(Grade, nonneg),
        gainTaperWithin: nonneg,
      })
      .strict(),
    actions: z
      .object({
        forage: Action,
        rest: Action,
        train: Action,
        social: Action,
        explore: Action,
        move: Action,
      })
      .strict(),
    nodeTiers: z
      .object({
        food: z.record(FoodTier, nonneg),
        risk: z.record(NodeRiskTier, probability),
        competition: z.record(CompetitionTier, probability),
      })
      .strict(),
    energy: z
      .object({
        capBase: nonneg,
        capPerStamina: nonneg,
        forageEffBase: nonneg,
        forageEffPerStat: nonneg,
        forageEffPerExpYear: nonneg,
        expYearsCap: nonneg,
        depletionPerStay: probability,
        depletionFloor: probability,
        moveCostFlightBase: nonneg,
        moveCostPerFlight: nonneg,
        moltCostPerStep: nonneg,
        incubationCostPerStep: nonneg,
        feedCostByIntensity: z.record(Intensity, nonneg),
        feedCostPerChick: nonneg,
        runStartRatio: probability,
        inheritStartRatio: probability,
        starvationWarnRatio: probability,
      })
      .strict(),
    feather: z
      .object({ max: nonneg, runStart: nonneg, decayPerStep: nonneg, moltRecoverPerStep: nonneg })
      .strict(),
    risk: z
      .object({
        floor: probability,
        cap: probability,
        vigilancePerStat: nonneg,
        flightPerStat: nonneg,
        flightRef: nonneg,
        expPerYear: nonneg,
        expCap: probability,
        flockMult: nonneg,
        fatHeavyFrom: probability,
        fatHeavySlope: nonneg,
        hungerFrom: probability,
        hungerSlope: nonneg,
        featherFrom: nonneg,
        featherSlope: nonneg,
        injuryMult: nonneg,
      })
      .strict(),
    brood: z
      .object({
        chickDeathPerStep: probability,
        chickDeathByIntensity: z.record(Intensity, nonneg),
        nestLossVigilancePerStat: nonneg,
      })
      .strict(),
    mate: z
      .object({
        acceptMin: probability,
        acceptMax: probability,
        roleFit: table(['native', 'shared', 'unusual'], nonneg),
        personality: table(['match', 'neutral', 'mismatch'], nonneg),
        conditionBase: nonneg,
        conditionFullAt: probability,
        bondBase: nonneg,
        bondPerPoint: nonneg,
        /** 최근 협력 횟수(0·1·2) → 배수 */
        reciprocity: table(['0', '1', '2'], nonneg),
        reciprocityWindowSteps: int,
        costConflict: z.record(Tier, nonneg),
        socialBase: nonneg,
        socialPerStat: nonneg,
        refusalEffectMin: probability,
        refusalEffectMax: probability,
        displayBands: table(['high', 'mid'], probability),
      })
      .strict(),
    heredity: z
      .object({
        /** 스탯별 유전율 */
        h2: z.partialRecord(StatName, probability),
        mutationSd: nonneg,
        potentialMin: num,
        potentialMax: num,
        /** 부화한 새끼가 암컷일 확률 (05-inheritance 3장) */
        femaleShare: probability,
        /** 잠재력 등급 범위의 반폭 — 화면에 `등급(p − w) ~ 등급(p + w)` (05-inheritance 4장) */
        rangeWithin: nonneg,
      })
      .strict(),
    silverSpoon: z
      .object({
        chickNeedPerStep: nonneg,
        nodeFoodDivisor: z.number().positive(),
        feedByIntensity: z.record(Intensity, nonneg),
        startStatBase: nonneg,
        startStatPerIndex: nonneg,
        growthBase: nonneg,
        growthPerIndex: nonneg,
        growthUntilAge: int,
        firstWinterRelief: nonneg,
      })
      .strict(),
    aging: z
      .object({
        riskPerYear: nonneg,
        statDeclinePerYear: nonneg,
        declineStats: z.array(StatName),
      })
      .strict(),
    display: z
      .object({
        riskDecimalsBelow: probability,
        riskMinShown: probability,
        riskBands: table(['low', 'high'], probability),
      })
      .strict(),
    /** 칸 수 — `01-formulas` 9.6 (#265) */
    routine: z
      .object({
        /** 한 시기의 기본 칸 수. 번식기는 이것 ÷ 단계 수 */
        slotsBase: int,
        /** 평시 칸 +1 문턱 — 스탯 합 ÷ 종 평균 잠재력 합이 이 값 이상이면 하나씩 */
        extraSlotRatios: z.array(nonneg),
      })
      .strict(),
    events: z
      .object({
        chancePerStep: probability,
        cooldownSteps: int,
        envChancePerPeriod: probability,
        checkBase: num,
        checkPerPoint: num,
        checkMin: probability,
        checkMax: probability,
      })
      .strict(),
  })
  .strict();
export type Formulas = z.infer<typeof Formulas>;
