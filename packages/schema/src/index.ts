/**
 * `@wb/schema` — 게임 데이터의 타입과 검증기.
 *
 * 형식의 출처는 `docs/studio/03-contracts.md` 4장이다.
 * 데이터 파일의 **필드 의미는 소유 부서**(design·content)가 정의하고,
 * 엔진은 그 의미대로 여기에 타입을 만든다.
 */
import './locale.ts';

export * from './breeding.ts';
export * from './calendar.ts';
export * from './codex.ts';
export * from './effects.ts';
export * from './events.ts';
export * from './fact.ts';
export * from './formulas.ts';
export * from './load.ts';
export * from './nodes.ts';
export * from './predators.ts';
export * from './species.ts';
export * from './text.ts';
