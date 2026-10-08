/**
 * 숙련 봇 v0 (#391, test-strategy 4장). 평균 봇 v1에 규칙 두 개를 얹은 튜닝 규칙 봇 — M-12 지배 전략 검사의 기준.
 *
 * 화면이 보여 주는 것만 보고 고른다. 난수를 쓰지 않는다.
 * 1. 계승 관문: 지금 개체·새끼 카드 중 `yearSurvival`(1년 생존 예상)이 가장 큰 쪽(같으면 잔류).
 * 2. 계절 방침 관문: `playerRiskMult`가 가장 낮은 방침(1 미만이 없으면 평균 봇 규칙).
 * 3. 그 밖은 평균 봇 v1과 같다.
 * 200판 탐색(`qa-m2`)에서 2차 번식은 평균 봇이 이미 늘 '한다'를 골라 바꾸지 않았다.
 */

import type { Bot } from '@wb/sim';
import avg from './avg.ts';

const bot: Bot = {
  id: 'skilled',
  version: '0.1.0',
  choose(input) {
    const gate = input.view.gate;

    if (gate?.kind === 'inheritance') {
      let pick: string = gate.stay.choiceId;
      let survival = gate.stay.yearSurvival;
      for (const c of gate.cards) {
        if (c.yearSurvival > survival && input.previews.has(c.choiceId)) {
          [pick, survival] = [c.choiceId, c.yearSurvival];
        }
      }
      return pick;
    }

    if (gate?.kind === 'seasonPolicy') {
      let pick: string | undefined;
      let mult = 1;
      for (const c of gate.cards) {
        const m = c.effects.playerRiskMult ?? 1;
        if (m < mult && input.previews.has(c.choiceId)) [pick, mult] = [c.choiceId, m];
      }
      if (pick) return pick;
    }

    return avg.choose(input);
  },
};

export default bot;
