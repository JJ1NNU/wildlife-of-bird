/**
 * `@wb/sim` — 화면 없이 엔진을 돌리는 러너. 봇 전략 자체는 QA가 쓴다(`qa/bots/`).
 *
 * M0에서는 봇 인터페이스와 런 한 판을 끝까지 돌리는 고리만 있다.
 * 대량 실행·지표 집계는 M1(#21)이다.
 */
export * from './bot.ts';
export * from './runner.ts';
