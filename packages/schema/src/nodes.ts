import { z } from 'zod';
import { fact } from './fact.ts';
import { Season, SpeciesId } from './species.ts';

/** 장소 등급 이름. 숫자는 `data/balance/formulas.json` `nodeTiers` (design) */
export const FoodTier = z.enum(['scarce', 'low', 'medium', 'high', 'rich']);
export const NodeRiskTier = z.enum(['veryLow', 'low', 'medium', 'high', 'veryHigh']);
export const CompetitionTier = z.enum(['none', 'low', 'medium', 'high']);

/** 장소 ID. 소문자 하이픈. 예: `forest-edge` */
export const NodeId = z.string().regex(/^[a-z]+(-[a-z]+)*$/, '소문자-하이픈으로 (예: forest-edge)');

const SeasonTiers = z
  .object({ food: FoodTier, risk: NodeRiskTier, competition: CompetitionTier })
  .strict();

/**
 * 지도 장소 — `data/nodes/<id>.json` (소유: content). 지도 구성: `00-core-loop` 3.4.
 * 등급은 게임 값이므로 `basis`는 등급의 **방향**(어디가 더/덜)을 뒷받침하는 출처다.
 */
export const MapNode = z
  .object({
    id: NodeId,
    nameKo: z.string().min(1),
    species: z.array(SpeciesId).min(1),
    /** 서식지 태그. 이벤트 조건이 쓴다. 예: `forest` `settlement` */
    habitats: z.array(z.string().min(1)).min(1),
    /** 이동할 수 있는 장소. 양방향이어야 한다(검증기가 확인) */
    links: z
      .array(NodeId)
      .min(1)
      .refine((l) => new Set(l).size === l.length, { error: '같은 장소가 두 번 나온다' }),
    seasons: z.record(Season, SeasonTiers),
    basis: fact({}),
  })
  .strict();
export type MapNode = z.infer<typeof MapNode>;
