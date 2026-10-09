/**
 * 숙련 봇 v1.1 (#391·#429, test-strategy 4장). 평균 봇 v1에 규칙 네 개를 얹은 튜닝 규칙 봇 — M-12 지배 전략 검사의 기준.
 *
 * 화면이 보여 주는 것만 보고 고른다(장소 먹이 등급은 지도에 보이는 `data/nodes`). 난수를 쓰지 않는다.
 * 1. 계승 관문: 지금 개체·새끼 카드 중 `yearSurvival`(1년 생존 예상)이 가장 큰 쪽(같으면 잔류).
 * 2. 계절 방침 관문: `playerRiskMult`가 가장 낮은 방침(1 미만이 없으면 평균 봇 규칙).
 * 3. 관문이 아닌 칸: 평균 봇이 고른 것보다 `deathRisk`가 낮은 옮기기(`move.*`)가 있으면 그중 가장 낮은 것.
 *    평균 봇 점수는 이번 칸만 봐서 옮기기를 고르지 않는다(#391 측정: 숙련 v0 6.04년 → v1 10.6년, 200판 `qa-m2`).
 * 4. 둥지 짓기 전(`pairing`·`nestSite`, 둥지 없음): 봄 먹이 low 장소로는 옮기지 않고, 지금 low면 low 아닌 곳 중
 *    가장 안전한 곳으로 옮긴다 — 둥지 손실 먹이 배율(`brood.nestLossByFood`, 01-formulas 9.7). #429 잠정 측정:
 *    번식 5.04 → 7.07(같은 시드 쌍 +2.02 ± 1.00, 200판 `qa-m2`).
 * 5. 그 밖은 평균 봇 v1과 같다.
 * 200판 탐색(`qa-m2`)에서 2차 번식은 평균 봇이 이미 늘 '한다'를 골라 바꾸지 않았다.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Bot } from '@wb/sim';
import avg from './avg.ts';

const nodesDir = path.resolve(import.meta.dirname, '../../data/nodes');
const springFood = new Map<string, string>(
  readdirSync(nodesDir).map((f) => {
    const n = JSON.parse(readFileSync(path.join(nodesDir, f), 'utf8'));
    return [n.id, n.seasons.spring.food];
  }),
);
const beforeNest = new Set(['pairing', 'nestSite']);

const bot: Bot = {
  id: 'skilled',
  version: '1.1.0',
  choose(input) {
    const view = input.view;
    const gate = view.gate;

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

    const pick = avg.choose(input);
    if (gate) return pick;

    const avoidLow = beforeNest.has(view.phase) && !view.nest;
    let best = pick;
    let risk = input.previews.get(pick)?.deathRisk ?? Infinity;
    if (avoidLow && springFood.get(view.node) === 'low') [best, risk] = ['', Infinity];
    for (const [id, p] of input.previews) {
      if (!id.startsWith('move.')) continue;
      if (avoidLow && springFood.get(id.slice(5)) === 'low') continue;
      if (p.deathRisk < risk) [best, risk] = [id, p.deathRisk];
    }
    return best || pick;
  },
};

export default bot;
