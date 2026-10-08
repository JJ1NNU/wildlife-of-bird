import { z } from 'zod';
import { Season, SpeciesId, StatName } from './species.ts';

/**
 * 계절 방침 — `data/balance/season-policy.json` (소유: design)
 * 필드의 의미: `docs/design/specs/11-season-policy.md` 3장. 없는 키는 배율 1 · 가산 0.
 */

const positive = z.number().finite().positive();

const Policy = z
  .object({
    intakeMult: positive.optional(),
    playerCostPerStep: z.number().finite().optional(),
    playerRiskMult: positive.optional(),
    nestLossMult: positive.optional(),
    moltRecoverMult: positive.optional(),
    statGainMult: z.partialRecord(StatName, positive).optional(),
  })
  .strict();
export type SeasonPolicyEffect = z.infer<typeof Policy>;

export const SeasonPolicy = z
  .object({
    policies: z.record(z.string().min(1), Policy),
    /** 종 → 계절 → 방침 id 목록. 첫 방침이 기본값(1장) */
    species: z.record(SpeciesId, z.partialRecord(Season, z.array(z.string().min(1)).min(1))),
  })
  .strict()
  .superRefine((s, ctx) => {
    for (const [speciesId, seasons] of Object.entries(s.species)) {
      for (const [season, ids] of Object.entries(seasons ?? {})) {
        for (const [i, id] of (ids ?? []).entries()) {
          if (!(id in s.policies)) {
            ctx.addIssue({
              code: 'custom',
              path: ['species', speciesId, season, i],
              message: `없는 방침이다: ${id} (policies)`,
            });
          }
        }
      }
    }
  });
export type SeasonPolicy = z.infer<typeof SeasonPolicy>;
