import type { Choice, Preview, ViewModel } from '@wb/engine';

/**
 * 봇 인터페이스 (03-contracts 3장). 봇은 사람 플레이어와 **같은 정보**만 본다 —
 * `RunState`를 직접 보지 않으므로 밸런스 측정이 실제 플레이와 어긋나지 않는다.
 */
export interface Bot {
  name: string;
  /** 고를 선택의 id. `choices`에 없는 id를 돌려주면 러너가 던진다. */
  choose(input: { view: ViewModel; choices: Choice[]; previews: Map<string, Preview> }): string;
}
