import { z } from 'zod';
import { Phase, SpeciesId } from './species.ts';

/** 시기 하나: 단계마다의 국면. 길이 = 단계 수, 상한 3 (`00-core-loop` 4.1) */
const PeriodSteps = z
  .object({ steps: z.array(Phase).min(1).max(3, '시기당 단계는 3개까지다 (00-core-loop 4.1)') })
  .strict();

/**
 * 종별 연간 단계표 — `data/calendar/<종>.json` (소유: design).
 * 의미: `docs/design/specs/00-core-loop.md` 4.3. 단계표는 기본값이고 런 상태가 실제 값이다.
 */
export const Calendar = z
  .object({
    speciesId: SpeciesId,
    /** 시기 1~24가 차례로 한 번씩 */
    periods: z
      .array(PeriodSteps.extend({ period: z.number().int() }).strict())
      .superRefine((periods, ctx) => {
        for (const [i, p] of periods.entries()) {
          if (p.period !== i + 1) {
            ctx.addIssue({
              code: 'custom',
              path: [i, 'period'],
              message: `시기는 1~24가 차례로 한 번씩이어야 한다: ${i + 1}번째 자리에 ${p.period}`,
            });
          }
        }
        if (periods.length !== 24) {
          ctx.addIssue({
            code: 'custom',
            message: `시기는 24개여야 한다 (지금 ${periods.length}개)`,
          });
        }
      }),
    /** 재번식을 하면 다음 시기부터 차례로 덮어쓰는 시기들 (`00-core-loop` 4.4) */
    rebrood: z.array(PeriodSteps).min(1),
  })
  .strict();
export type Calendar = z.infer<typeof Calendar>;

/** 단계표에 나오는 국면 이름 전체 (기본 + 재번식) — 교차 검증의 기준 */
export function calendarPhases(calendar: Calendar): Set<Phase> {
  return new Set([...calendar.periods, ...calendar.rebrood].flatMap((p) => p.steps));
}
