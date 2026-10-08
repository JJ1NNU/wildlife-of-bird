import { getChoices, getView, type Preview, preview, type RunState } from '@wb/engine';
import type { GameData } from '@wb/schema';
import avg from '../../../qa/bots/avg.ts';
import { actRecorded } from './save.ts';

/**
 * 개발용 빨리 감기(#24, client.md): QA 평균 봇(#26)이 사람 대신 고른다 — 대표 플레이테스트용.
 * 출시 빌드(태그 v* 배포, deploy.yml이 VITE_RELEASE=1)에서는 숨긴다.
 */
export const SHOW_FAST_FORWARD = import.meta.env.VITE_RELEASE !== '1';

/** 한 판이 아무리 길어도 이만큼 넘게 돌지 않는다(1년 결정 예산의 몇 배) */
const MAX_STEPS = 1000;

/** 1년 뒤 같은 때까지, 또는 게임 오버까지 봇으로 진행한다 */
export function fastForward(state: RunState, data: GameData): RunState {
  const { year, period, step } = state.at;
  let s = state;
  for (let i = 0; i < MAX_STEPS && !s.gameOver; i++) {
    const { at } = s;
    if (at.year > year && (at.period > period || (at.period === period && at.step >= step))) break;
    const choices = getChoices(s, data);
    const previews = new Map<string, Preview>(
      choices.filter((c) => !c.disabled).map((c) => [c.id, preview(s, c.id, data)]),
    );
    const id = avg.choose({ view: getView(s, data), choices, previews });
    s = actRecorded(s, id, data).state;
  }
  return s;
}
