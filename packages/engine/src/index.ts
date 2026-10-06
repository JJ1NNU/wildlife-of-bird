/**
 * `@wb/engine` — 게임 규칙. 순수하고 결정론적이다.
 *
 * UI·브라우저·네트워크에 의존하지 않으므로 같은 코드가 브라우저(게임)와
 * Node(시뮬레이터)에서 돈다. 쓰는 법은 `README.md`.
 */
export * from './api.ts';
export * from './calendar.ts';
export * from './display.ts';
export { mateAccepts } from './mate.ts';
export { contestChance, nestHoles } from './nest.ts';
export * from './rng.ts';
export * from './types.ts';
