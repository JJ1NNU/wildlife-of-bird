import { z } from 'zod';
import { RiskTier, Tier, WeightTier } from './effects.ts';
import { FactCheck } from './fact.ts';
import { SpeciesId, StatName } from './species.ts';

/**
 * 이벤트 효과 — 숫자가 아니라 **등급**으로 쓴다 (03-contracts 4.2·4.3).
 * 새 효과 종류는 design이 추가하고 엔진이 해석기를 구현한다.
 *
 * `energy`·`feather`의 `sign`(얻음/잃음)은 03-contracts 예시에 없어 디자인에 물었다. 잠정(#37)
 */
export const Effect = z.discriminatedUnion('type', [
  z.object({ type: z.literal('energy'), tier: Tier, sign: z.enum(['gain', 'loss']) }).strict(),
  z.object({ type: z.literal('feather'), tier: Tier, sign: z.enum(['gain', 'loss']) }).strict(),
  z.object({ type: z.literal('deathRisk'), tier: RiskTier }).strict(),
  z.object({ type: z.literal('broodRisk'), tier: RiskTier }).strict(),
  z.object({ type: z.literal('statGain'), stat: StatName, tier: Tier }).strict(),
  z.object({ type: z.literal('fledgeEarly') }).strict(),
]);
export type Effect = z.infer<typeof Effect>;

/** 번식 단계. 단계 이름의 주인은 design(`data/calendar/`). */
export const Phase = z.string().min(1);

/**
 * 이벤트 — `data/events/<id>.json` (소유: content, design 리뷰 필수. 03-contracts 4.3)
 * 파일 하나는 이벤트 배열이다.
 */
export const GameEvent = z
  .object({
    id: z.string().regex(/^ev\.[a-z0-9-]+\.[a-z0-9-]+$/, 'ev.<종 또는 공통>.<이름> 형식'),
    species: z.array(SpeciesId).min(1),
    when: z
      .object({
        phase: Phase.optional(),
        habitatAny: z.array(z.string().min(1)).min(1).optional(),
      })
      .strict(),
    weight: WeightTier,
    title: z.string().min(1),
    body: z.string().min(1),
    options: z
      .array(
        z
          .object({
            id: z.string().min(1),
            text: z.string().min(1),
            effects: z.array(Effect),
          })
          .strict(),
      )
      .min(1, '선택지가 하나 이상 필요하다'),
    /** 이 이벤트가 생태적으로 왜 가능한지 — 우리 말로 */
    ecologyBasis: z.string().min(1),
    sources: z.array(z.string().min(1)).min(1, '생태 근거에는 출처가 필요하다'),
    factCheck: FactCheck,
  })
  .strict();
export type GameEvent = z.infer<typeof GameEvent>;

export const GameEventFile = z.array(GameEvent);
