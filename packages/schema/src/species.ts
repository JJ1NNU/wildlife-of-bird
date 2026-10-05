import { z } from 'zod';
import { Tier } from './effects.ts';
import { FactCheck, fact, SourceId } from './fact.ts';

/** 종 ID. 학명을 소문자 하이픈으로. 예: `parus-minor` */
export const SpeciesId = z
  .string()
  .regex(/^[a-z]+(-[a-z]+)+$/, '학명을 소문자-하이픈으로 (예: parus-minor)');
export type SpeciesId = z.infer<typeof SpeciesId>;

/** 시기 1~24 (1 = 1월 상반). gdd 4.2장 */
export const Period = z.number().int().min(1).max(24);

/**
 * 국면 이름 (`00-core-loop` 2.2). 엔진의 규칙이 국면마다 다르므로(털갈이 비용·급이·둥지 손실 등)
 * 데이터가 새 국면을 쓰려면 이 열거와 엔진을 함께 고친다. `migration` `wintering`은 M4.
 */
export const Phase = z.enum([
  'winter',
  'pairing',
  'nestSite',
  'laying',
  'incubation',
  'nestling',
  'postFledge',
  'molt',
  'autumnFlock',
]);
export type Phase = z.infer<typeof Phase>;

/** 스탯 이름. gdd 5.1장 */
export const StatName = z.enum([
  'flight',
  'foraging',
  'vigilance',
  'stamina',
  'display',
  'social',
  'navigation',
]);
export type StatName = z.infer<typeof StatName>;

/** 적성 등급. gdd 8.3장 */
export const Grade = z.enum(['S', 'A', 'B', 'C', 'D']);
export type Grade = z.infer<typeof Grade>;

/** 범위 [min, max] — `min ≤ max`를 검사한다 */
const range = (min: z.ZodNumber, max: z.ZodNumber) =>
  fact({ min, max }).refine((r) => r.min <= r.max, {
    error: 'min은 max보다 클 수 없다',
    path: ['min'],
  });

const periodRange = fact({ fromPeriod: Period, toPeriod: Period });
const textList = fact({ values: z.array(z.string().min(1)).min(1) });
const count = z.number().int().positive();

/** 경보음 하나. 포식자 종류마다 듣는 쪽의 반응이 다르다 */
const AlarmCall = fact({
  id: z.string().min(1),
  predatorType: z.string().min(1),
  incubatingFemaleResponse: z.string().min(1),
  lateNestlingResponse: z.string().min(1),
});

/**
 * 종의 생태 사실 — `data/species/<id>.ecology.json` (소유: content, 03-contracts 4.1)
 *
 * 여기에는 **사실만** 넣는다. 조정 가능한 수치는 `data/balance/species/`에.
 * 사실마다 출처 · 검증 상태를 붙인다(`fact()`, #56 결정). 필드의 의미는 content가 정하고,
 * 필드를 더하려면 03-contracts 8장대로 이 스키마를 함께 고친다(`review:engine`).
 */
export const SpeciesEcology = z
  .object({
    id: SpeciesId,
    nameKo: z.string().min(1),
    scientificName: z.string().min(1),
    /** 텃새 · 여름 철새 · 겨울 철새 · 나그네새 (content 확인, #46) */
    residency: fact({ value: z.enum(['resident', 'summer', 'winter', 'passage']) }),
    habitats: textList,
    breeding: z
      .object({
        season: periodRange,
        layStart: periodRange,
        layStartDriver: fact({ value: z.string().min(1) }),
        /** 최소값은 출처에 없을 수 있어 선택. `min ≤ typicalMin ≤ typicalMax ≤ max` */
        clutchSize: fact({
          min: count.optional(),
          typicalMin: count,
          typicalMax: count,
          max: count,
        })
          .refine((c) => c.min === undefined || c.min <= c.typicalMin, {
            error: 'min은 typicalMin보다 클 수 없다',
            path: ['min'],
          })
          .refine((c) => c.typicalMin <= c.typicalMax, {
            error: 'typicalMin은 typicalMax보다 클 수 없다',
            path: ['typicalMin'],
          })
          .refine((c) => c.typicalMax <= c.max, {
            error: 'typicalMax는 max보다 클 수 없다',
            path: ['typicalMax'],
          }),
        broodsPerYearMax: fact({ value: count }),
        incubationDays: range(count, count),
        nestlingDays: range(count, count),
        incubationBy: fact({ value: z.enum(['female', 'male', 'both']) }),
        nestType: fact({ value: z.string().min(1) }),
      })
      .strict(),
    diet: z.object({ primary: textList, secondary: textList, nestlingFood: textList }).strict(),
    /** 가락지 조사로 확인된 최장 생존 기록(개월). 평균 수명이 아니다 */
    lifespan: fact({ maxRecordedMonths: count }),
    alarmCalls: z
      .object({ values: z.array(AlarmCall).min(1), note: z.string().min(1).optional() })
      .strict(),
    /** 이 파일이 쓰는 출처 전체 */
    sources: z.array(SourceId).min(1, '생태 사실에는 출처가 필요하다'),
    /** 파일 전체의 요약 상태. 출시 판정은 사실마다 붙은 `factCheck`로 센다 */
    factCheck: FactCheck,
  })
  .strict();
export type SpeciesEcology = z.infer<typeof SpeciesEcology>;

const probability = z.number().min(0).max(1);
const positive = z.number().positive();
const SEASONS = ['winter', 'spring', 'summer', 'autumn'] as const;
export const Season = z.enum(SEASONS);
export type Season = z.infer<typeof Season>;

/**
 * 종의 밸런스 수치 — `data/balance/species/<id>.json` (소유: design, 03-contracts 4.1)
 * 필드의 의미: `docs/design/specs/01-formulas.md` (#54 결정).
 */
export const SpeciesBalance = z
  .object({
    speciesId: SpeciesId,
    /** 밸런스 목표치 — QA가 지표 목표로 읽는다 */
    targets: z
      .object({
        avgRunYears: positive,
        expectedTotalBreeding: positive,
        tolerance: probability,
        breedingYearRatio: probability,
        yearBreedingSuccess: probability,
        firstBroodSuccess: probability,
        decisionsPerYear: z
          .object({ min: z.number().int().positive(), max: z.number().int().positive() })
          .strict()
          .refine((d) => d.min <= d.max, { error: 'min은 max보다 클 수 없다', path: ['min'] }),
      })
      .strict(),
    aptitude: z.partialRecord(StatName, Grade),
    runStart: z
      .object({
        age: z.number().int().nonnegative(),
        period: Period,
        /** 시작 장소 id (`data/nodes/`). 장소 파일이 있으면 검증기가 확인한다 */
        node: z.string().min(1),
      })
      .strict(),
    /** 계절 → 시기 목록. 1~24가 정확히 한 번씩 */
    seasons: z.record(Season, z.array(Period).min(1)).superRefine((seasons, ctx) => {
      const seen = new Map<number, string>();
      for (const season of SEASONS) {
        for (const period of seasons[season]) {
          const before = seen.get(period);
          if (before) {
            ctx.addIssue({
              code: 'custom',
              path: [season],
              message:
                before === season
                  ? `시기 ${period}가 ${season}에 두 번 나온다`
                  : `시기 ${period}가 ${before}와 ${season}에 겹친다`,
            });
          }
          seen.set(period, season);
        }
      }
      const missing = Array.from({ length: 24 }, (_, i) => i + 1).filter((p) => !seen.has(p));
      if (missing.length > 0) {
        ctx.addIssue({ code: 'custom', message: `어느 계절에도 없는 시기: ${missing.join(', ')}` });
      }
    }),
    basalPerStep: z.record(Season, positive),
    /** 국면 이름 → 포식자 활동 배수. 없는 국면은 1 */
    predatorActivity: z.partialRecord(Phase, positive),
    /** 무리 생활을 하는 국면 */
    flockPhases: z.array(Phase),
    nestLossPerStep: probability,
    agingStartAge: z.number().int().nonnegative(),
    firstWinterRiskMult: positive,
    /** 2차 번식이 있는 종만 */
    secondBrood: z
      .object({
        layByPeriod: Period,
        energyCost: Tier,
      })
      .strict()
      .optional(),
  })
  .strict();
export type SpeciesBalance = z.infer<typeof SpeciesBalance>;
