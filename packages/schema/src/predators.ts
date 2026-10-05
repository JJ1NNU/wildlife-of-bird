import { z } from 'zod';
import { fact } from './fact.ts';

/** 포식자 ID. 소문자 하이픈. 예: `rat-snake` */
export const PredatorId = z
  .string()
  .regex(/^[a-z]+(-[a-z]+)*$/, '소문자-하이픈으로 (예: rat-snake)');

/** 포식자가 노리는 것. `nest` = 둥지의 알·새끼 */
export const PredatorTarget = z.enum(['adult', 'nest']);

/**
 * 포식자 — `data/predators/<id>.json` (소유: content). 03-contracts 4.4.
 * 사냥 방식·활동 계절은 쓰는 곳(도감·이벤트 조건)이 생길 때 필드로 더한다. 지금은 `basis.note`의 글.
 */
export const Predator = z
  .object({
    /** 사망 원인 `predation:<id>`와 이벤트 `deathRisk.predator`가 이 id를 쓴다 */
    id: PredatorId,
    nameKo: z.string().min(1),
    targets: z
      .array(PredatorTarget)
      .min(1)
      .refine((t) => new Set(t).size === t.length, { error: '같은 대상이 두 번 나온다' }),
    basis: fact({}),
  })
  .strict();
export type Predator = z.infer<typeof Predator>;
