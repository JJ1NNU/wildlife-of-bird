import { z } from 'zod';

/**
 * 화면 문구 파일 하나 — `data/text/<화면>.json` (소유: content, #254). 03-contracts 4.5.
 * 평평한 `{ "<화면>.<항목>.<용도>": "문구" }`. 키의 첫 마디는 파일 이름이다(검증기가 확인).
 */
export const TextFile = z.record(
  z
    .string()
    .regex(
      /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$/,
      '<화면>.<항목>.<용도> 형식(camelCase, 점으로 나눔)',
    ),
  z.string().min(1),
);
export type TextFile = z.infer<typeof TextFile>;
