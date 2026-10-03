import { z } from 'zod';

/** 사실 검증 상태. `needs-review`는 출시 전에 0이 되어야 한다 (QA 출시 체크리스트) */
export const FactCheck = z.enum(['verified', 'needs-review']);
export type FactCheck = z.infer<typeof FactCheck>;

/** `docs/content/sources.md`의 출처 ID. 예: `SRC-004` */
export const SourceId = z.string().min(1);

/** 사실 하나에 붙는 출처 · 검증 상태 · 메모 */
export interface FactMeta {
  sources: string[];
  factCheck: FactCheck;
  note?: string;
}

const factMeta = {
  sources: z.array(SourceId),
  factCheck: FactCheck,
  note: z.string().min(1).optional(),
};

/**
 * 출처가 붙은 사실 하나. 값 필드 + 출처 · 검증 상태 · 메모 (#56 결정).
 *
 * 한 종 파일 안에서도 사실마다 출처 등급이 다르므로(포란 담당은 확인, 포란 기간은 미확인)
 * 출처는 **값 단위**로 붙인다. 값의 모양은 셋 중 하나로 쓴다:
 * - 하나의 값 → `{ "value": ... }`
 * - 값의 목록 → `{ "values": [...] }`
 * - 여러 필드로 된 값 → 그 필드를 그대로 (예: `{ "min": 12, "max": 13 }`)
 *
 * `verified`이면 출처가 1개 이상 있어야 한다.
 */
export function fact<T extends z.ZodRawShape>(shape: T) {
  return z
    .object({ ...shape, ...factMeta })
    .strict()
    .refine(
      (f) => {
        // 제네릭 모양이라 타입이 좁혀지지 않는다. 메타 필드는 위에서 반드시 넣었다.
        const meta = f as unknown as FactMeta;
        return meta.factCheck !== 'verified' || meta.sources.length > 0;
      },
      {
        error: 'verified인 사실에는 출처가 1개 이상 필요하다',
        path: ['sources'],
      },
    );
}

/**
 * 아직 값을 찾지 못한 사실. 출처를 못 찾아 일부러 비워 두고, 찾아볼 곳을 `note`에 적는다.
 * 값을 찾으면 그 모양을 정해 `fact()`로 바꾼다.
 */
export const UnresolvedFact = z
  .object({
    sources: z.array(SourceId),
    factCheck: z.literal('needs-review'),
    note: z.string().min(1, '값을 비운 이유와 찾아볼 곳을 적는다'),
  })
  .strict();
