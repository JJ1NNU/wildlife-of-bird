import { z } from 'zod';
import { Tier } from './effects.ts';

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

/**
 * 종의 생태 사실 — `data/species/<id>.ecology.json` (소유: content, 03-contracts 4.1)
 *
 * 여기에는 **사실만** 넣는다. 조정 가능한 수치는 `data/balance/species/`에.
 */
export const SpeciesEcology = z
  .object({
    id: SpeciesId,
    nameKo: z.string().min(1),
    scientificName: z.string().min(1),
    residency: z.enum(['resident', 'summer', 'winter', 'passage']),
    habitats: z.array(z.string().min(1)).min(1),
    breeding: z
      .object({
        season: z.object({ fromPeriod: Period, toPeriod: Period }),
        clutchSize: z.object({
          min: z.number().int().positive(),
          max: z.number().int().positive(),
          typicalMin: z.number().int().positive(),
          typicalMax: z.number().int().positive(),
        }),
        broodsPerYearMax: z.number().int().positive(),
        incubationBy: z.enum(['female', 'male', 'both']),
        nestType: z.string().min(1),
      })
      .strict()
      .refine((b) => b.clutchSize.min <= b.clutchSize.typicalMin, {
        error: 'clutchSize.min은 typicalMin보다 클 수 없다',
        path: ['clutchSize'],
      })
      .refine((b) => b.clutchSize.typicalMin <= b.clutchSize.typicalMax, {
        error: 'clutchSize.typicalMin은 typicalMax보다 클 수 없다',
        path: ['clutchSize'],
      })
      .refine((b) => b.clutchSize.typicalMax <= b.clutchSize.max, {
        error: 'clutchSize.typicalMax는 max보다 클 수 없다',
        path: ['clutchSize'],
      }),
    /** `docs/content/sources.md`의 출처 ID */
    sources: z.array(z.string().min(1)).min(1, '생태 사실에는 출처가 필요하다'),
    factCheck: z.enum(['verified', 'needs-review']),
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
