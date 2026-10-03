import { z } from 'zod';
import { RiskTier, Tier, WeightTier } from './effects.ts';
import { FactCheck, SourceId } from './fact.ts';
import { Period, SpeciesId, StatName } from './species.ts';

/**
 * 이벤트 — `data/events/<종 또는 common>.json` (소유: content, design 리뷰 필수).
 * 필드의 의미: `docs/design/specs/03-events.md` (#54 결정). 요약: 03-contracts 4.3.
 */

const Sign = z.enum(['gain', 'loss']);

/** 사망 원인 코드 (`00-core-loop` 8장) */
export const DeathCause = z.enum(['cold', 'accident', 'disease', 'predation']);
export type DeathCause = z.infer<typeof DeathCause>;

/**
 * 효과 — 숫자가 아니라 **등급**으로 쓴다. 등급의 숫자는 `data/balance/effects.json`.
 * 방향이 있는 효과는 `sign`이 필수다(#37 결정).
 */
export const Effect = z.discriminatedUnion('type', [
  z.object({ type: z.literal('energy'), tier: Tier, sign: Sign }).strict(),
  z.object({ type: z.literal('feather'), tier: Tier, sign: Sign }).strict(),
  z.object({ type: z.literal('statGain'), stat: StatName, tier: Tier }).strict(),
  z.object({ type: z.literal('bond'), tier: Tier, sign: Sign }).strict(),
  z.object({ type: z.literal('injury'), tier: Tier }).strict(),
  z
    .object({
      type: z.literal('deathRisk'),
      tier: RiskTier,
      cause: DeathCause,
      /** `data/predators/`의 id. `cause`가 `predation`일 때만 */
      predator: z.string().min(1).optional(),
    })
    .strict()
    .refine((e) => e.predator === undefined || e.cause === 'predation', {
      error: 'predator는 cause가 predation일 때만 쓴다',
      path: ['predator'],
    }),
  z.object({ type: z.literal('broodRisk'), tier: RiskTier }).strict(),
  z.object({ type: z.literal('chickLoss'), tier: Tier }).strict(),
  z.object({ type: z.literal('riskMod'), tier: RiskTier }).strict(),
  z.object({ type: z.literal('foodMod'), tier: Tier, sign: Sign }).strict(),
  z.object({ type: z.literal('fledgeEarly') }).strict(),
]);
export type Effect = z.infer<typeof Effect>;

const names = z.array(z.string().min(1)).min(1);

/** 조건 — 적힌 것이 **모두** 참이어야 한다. 비어 있으면 늘 참 (03-events 4장) */
export const EventWhen = z
  .object({
    /** 국면 이름 (`00-core-loop` 2.2) */
    phaseAny: names.optional(),
    habitatAny: names.optional(),
    /** from > to면 해를 넘긴다 (23~4 = 23·24·1·2·3·4) */
    periodFrom: Period.optional(),
    periodTo: Period.optional(),
    sex: z.enum(['female', 'male']).optional(),
    ageMin: z.number().int().nonnegative().optional(),
    ageMax: z.number().int().nonnegative().optional(),
    hasMate: z.boolean().optional(),
    hasBrood: z.boolean().optional(),
    /** 에너지 / 지방 상한 < 값 */
    energyBelow: z.number().min(0).max(1).optional(),
    /** 행동 id (`data/balance/formulas.json`의 `actions`) */
    actionAny: names.optional(),
  })
  .strict()
  .refine((w) => (w.periodFrom === undefined) === (w.periodTo === undefined), {
    error: 'periodFrom과 periodTo는 함께 쓴다',
    path: ['periodFrom'],
  })
  .refine((w) => w.ageMin === undefined || w.ageMax === undefined || w.ageMin <= w.ageMax, {
    error: 'ageMin은 ageMax보다 클 수 없다',
    path: ['ageMin'],
  });
export type EventWhen = z.infer<typeof EventWhen>;

/**
 * 선택지 — 두 모양 중 하나 (03-events 5장)
 * - 고정 효과: `{ id, text, effects }`
 * - 판정형: `{ id, text, check: { stat, difficulty }, onSuccess, onFail }`
 */
export const EventOption = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1),
    effects: z.array(Effect).optional(),
    check: z.object({ stat: StatName, difficulty: RiskTier }).strict().optional(),
    onSuccess: z.array(Effect).optional(),
    onFail: z.array(Effect).optional(),
  })
  .strict()
  .superRefine((o, ctx) => {
    const fixed = o.effects !== undefined;
    const checked = o.check !== undefined || o.onSuccess !== undefined || o.onFail !== undefined;
    if (fixed && checked) {
      ctx.addIssue({
        code: 'custom',
        message: 'effects(고정 효과)와 check·onSuccess·onFail(판정형)을 함께 쓸 수 없다',
      });
    } else if (!fixed && !checked) {
      ctx.addIssue({ code: 'custom', message: 'effects 또는 check·onSuccess·onFail이 필요하다' });
    } else if (checked) {
      for (const key of ['check', 'onSuccess', 'onFail'] as const) {
        if (o[key] === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `판정형 선택지에는 ${key}가 필요하다`,
          });
        }
      }
    }
  });
export type EventOption = z.infer<typeof EventOption>;

/** 선택지 하나의 모든 효과 (고정 · 성공 · 실패) */
export function optionEffects(option: EventOption): Effect[] {
  return [...(option.effects ?? []), ...(option.onSuccess ?? []), ...(option.onFail ?? [])];
}

/** 효과가 성립하려면 `when`이 보장해야 하는 것 (03-events 6.2) */
function checkEffectPreconditions(event: z.infer<typeof EventBase>, ctx: z.RefinementCtx) {
  const { when } = event;
  const optionCount = event.options.length;
  const [minOptions, maxOptions] = event.draw === 'step' ? [2, 3] : [1, 3];
  if (optionCount < minOptions || optionCount > maxOptions) {
    ctx.addIssue({
      code: 'custom',
      path: ['options'],
      message: `draw가 ${event.draw}인 이벤트의 선택지는 ${minOptions}~${maxOptions}개다 (지금 ${optionCount}개)`,
    });
  }
  for (const [o, option] of event.options.entries()) {
    for (const effect of optionEffects(option)) {
      const fail = (message: string) =>
        ctx.addIssue({ code: 'custom', path: ['options', o], message });
      if (effect.type === 'bond' && when.hasMate !== true) {
        fail('bond 효과에는 when.hasMate: true가 필요하다');
      }
      if ((effect.type === 'broodRisk' || effect.type === 'chickLoss') && when.hasBrood !== true) {
        fail(`${effect.type} 효과에는 when.hasBrood: true가 필요하다`);
      }
      if (
        effect.type === 'fledgeEarly' &&
        !(when.phaseAny?.length === 1 && when.phaseAny[0] === 'nestling')
      ) {
        fail('fledgeEarly 효과에는 when.phaseAny: ["nestling"]이 필요하다');
      }
    }
  }
}

const EventBase = z
  .object({
    id: z.string().regex(/^ev\.[a-z0-9-]+\.[a-z0-9-]+$/, 'ev.<종 또는 common>.<이름> 형식'),
    species: z.array(SpeciesId).min(1),
    /** 단계 이벤트(기본) 또는 시기 시작의 환경 카드 */
    draw: z.enum(['step', 'periodStart']).default('step'),
    when: EventWhen,
    weight: WeightTier,
    title: z.string().min(1),
    body: z.string().min(1),
    options: z.array(EventOption).min(1, '선택지가 하나 이상 필요하다'),
    /** 이 이벤트가 생태적으로 왜 가능한지 — 우리 말로 */
    ecologyBasis: z.string().min(1),
    sources: z.array(SourceId).min(1, '생태 근거에는 출처가 필요하다'),
    factCheck: FactCheck,
  })
  .strict();

export const GameEvent = EventBase.superRefine(checkEffectPreconditions);
export type GameEvent = z.infer<typeof GameEvent>;

export const GameEventFile = z.array(GameEvent);
