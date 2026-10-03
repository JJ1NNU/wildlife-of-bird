import type { Choice, Preview, ViewModel } from '@wb/engine';

/**
 * 봇 인터페이스 (03-contracts 3장). 봇은 사람 플레이어와 **같은 정보**만 본다 —
 * `RunState`를 직접 보지 않으므로 밸런스 측정이 실제 플레이와 어긋나지 않는다.
 *
 * 봇 모듈(`qa/bots/<이름>.ts`)은 이 형의 값을 `export default`한다.
 */
export interface Bot {
  /** 판 기록의 `bot.id` */
  id: string;
  /** 판 기록의 `bot.version`. 전략을 바꾸면 올린다 */
  version: string;
  /**
   * 고를 선택의 id. `previews`에는 `disabled`가 아닌 선택만 있다.
   * `choices`에 없거나 `disabled`인 id를 돌려주면 그 판은 오류로 끝난다.
   */
  choose(input: { view: ViewModel; choices: Choice[]; previews: Map<string, Preview> }): string;
}
