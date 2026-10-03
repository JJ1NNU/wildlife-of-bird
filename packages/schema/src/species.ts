import { z } from 'zod';
import { Tier } from './effects.ts';
import { FactCheck, fact, SourceId, UnresolvedFact } from './fact.ts';

/** 종 ID. 학명을 소문자 하이픈으로. 예: `parus-minor` */
export const SpeciesId = z
  .string()
  .regex(/^[a-z]+(-[a-z]+)+$/, '학명을 소문자-하이픈으로 (예: parus-minor)');
export type SpeciesId = z.infer<typeof SpeciesId>;

/** 시기 1~24 (1 = 1월 상반). gdd 4.2장 */
export const Period = z.number().int().min(1).max(24);

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
    /** 텃새 · 여름 철새 · 겨울 철새 · 나그네새. 값 목록은 content 확인 대기 — 잠정(#46) */
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
    lifespan: UnresolvedFact,
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

/**
 * 종의 밸런스 수치 — `data/balance/species/<id>.json` (소유: design, 03-contracts 4.1)
 */
export const SpeciesBalance = z
  .object({
    speciesId: SpeciesId,
    targets: z
      .object({
        avgRunYears: z.number().positive(),
        expectedTotalBreeding: z.number().positive(),
      })
      .strict(),
    nestSuccessBase: z.number().min(0).max(1),
    secondBrood: z
      .object({ energyCost: Tier, moltDelayPeriods: z.number().int().nonnegative() })
      .strict()
      .optional(),
    agingStartAge: z.number().int().nonnegative(),
    aptitude: z.partialRecord(StatName, Grade),
  })
  .strict();
export type SpeciesBalance = z.infer<typeof SpeciesBalance>;
