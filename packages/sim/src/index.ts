/**
 * `@wb/sim` — 화면 없이 엔진을 돌리는 러너. 봇 전략 자체는 QA가 쓴다(`qa/bots/`).
 *
 * 봇 인터페이스 · 판 기록(JSONL) · 리플레이(#33). 지표 집계·리포트는 QA가 판 기록으로 한다.
 */
export * from './bot.ts';
export * from './runner.ts';
