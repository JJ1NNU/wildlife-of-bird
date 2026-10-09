/**
 * 숙련 봇 v1.2 (#391·#429·#454, test-strategy 4장). 평균 봇 v1에 규칙 다섯 개를 얹은 튜닝 규칙 봇 — M-12 지배 전략 검사의 기준.
 *
 * 화면이 보여 주는 것만 보고 고른다(장소 먹이·위험 등급은 지도에 보이는 `data/nodes`). 난수를 쓰지 않는다.
 * 1. 계승 관문: 지금 개체·새끼 카드 중 `yearSurvival`(1년 생존 예상)이 가장 큰 쪽(같으면 잔류).
 * 2. 계절 방침 관문: `playerRiskMult`가 가장 낮은 방침(1 미만이 없으면 평균 봇 규칙).
 * 3. 관문이 아닌 칸: 평균 봇이 고른 것보다 `deathRisk`가 낮은 옮기기(`move.*`)가 있으면 그중 가장 낮은 것.
 *    평균 봇 점수는 이번 칸만 봐서 옮기기를 고르지 않는다(#391 측정: 숙련 v0 6.04년 → v1 10.6년, 200판 `qa-m2`).
 * 4. 둥지 짓기 전(`pairing`·`nestSite`, 둥지 없음): 봄 먹이 low 장소로는 옮기지 않고, 지금 low면 low 아닌 곳 중
 *    가장 안전한 곳으로 옮긴다 — 둥지 손실 먹이 배율(`brood.nestLossByFood`, 01-formulas 9.7). #429 잠정 측정:
 *    번식 5.04 → 7.07(같은 시드 쌍 +2.02 ± 1.00, 200판 `qa-m2`).
 * 5. 번식기 밖(`winter`·`molt`·`autumnFlock`, 둥지 없음, 관문 아님): 그 계절 위험 low 장소까지 링크 거리가 줄어드는
 *    옮기기 중 `deathRisk` 낮은 것, 이미 low면 옮기지 않고 평균 봇 규칙으로 칸 행동(sim-M2-03 3장 `lowOff`:
 *    런 6.53 → 8.19년, 쌍 +1.66 ± 1.05, 300판 `qa-m1`).
 * 6. 그 밖은 평균 봇 v1과 같다.
 * 200판 탐색(`qa-m2`)에서 2차 번식은 평균 봇이 이미 늘 '한다'를 골라 바꾸지 않았다.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Bot } from '@wb/sim';
import avg from './avg.ts';

type BotInput = Parameters<Bot['choose']>[0];

const dataDir = path.resolve(import.meta.dirname, '../../data');
const nodes = new Map<
  string,
  { links: string[]; seasons: Record<string, { food: string; risk: string }> }
>(
  readdirSync(path.join(dataDir, 'nodes')).map((f) => {
    const n = JSON.parse(readFileSync(path.join(dataDir, 'nodes', f), 'utf8'));
    return [n.id, n];
  }),
);
const beforeNest = new Set(['pairing', 'nestSite']);
const offSeason = new Set(['winter', 'molt', 'autumnFlock']);

const seasonOfPeriod = new Map<string, Map<number, string>>();
function seasonOf(speciesId: string, period: number): string {
  let m = seasonOfPeriod.get(speciesId);
  if (!m) {
    const file = path.join(dataDir, 'balance/species', `${speciesId}.json`);
    const seasons: Record<string, number[]> = JSON.parse(readFileSync(file, 'utf8')).seasons;
    m = new Map(Object.entries(seasons).flatMap(([s, ps]) => ps.map((p) => [p, s] as const)));
    seasonOfPeriod.set(speciesId, m);
  }
  return m.get(period) ?? '';
}

/** 그 계절 위험 low 장소까지 링크 거리(없으면 Infinity). */
function lowDistance(from: string, season: string): number {
  const dist = new Map([[from, 0]]);
  const queue = [from];
  for (let x = queue.shift(); x !== undefined; x = queue.shift()) {
    const n = nodes.get(x);
    if (n?.seasons[season]?.risk === 'low') return dist.get(x) ?? 0;
    for (const y of n?.links ?? []) {
      if (!dist.has(y)) {
        dist.set(y, (dist.get(x) ?? 0) + 1);
        queue.push(y);
      }
    }
  }
  return Infinity;
}

/** 규칙 3·4: 평균 봇 선택보다 안전한 옮기기. */
function saferMove(input: BotInput, pick: string): string {
  const view = input.view;
  const avoidLow = beforeNest.has(view.phase) && !view.nest;
  let best = pick;
  let risk = input.previews.get(pick)?.deathRisk ?? Infinity;
  if (avoidLow && nodes.get(view.node)?.seasons.spring?.food === 'low')
    [best, risk] = ['', Infinity];
  for (const [id, p] of input.previews) {
    if (!id.startsWith('move.')) continue;
    if (avoidLow && nodes.get(id.slice(5))?.seasons.spring?.food === 'low') continue;
    if (p.deathRisk < risk) [best, risk] = [id, p.deathRisk];
  }
  return best || pick;
}

/** 규칙 5: 번식기 밖엔 low 장소로 가서 머문다. */
function toLow(input: BotInput): string {
  const view = input.view;
  const season = seasonOf(view.speciesId, view.at.period);
  const here = lowDistance(view.node, season);
  if (here === 0) {
    const pick = saferMove(input, avg.choose(input));
    if (!pick.startsWith('move.')) return pick;
    const stay = new Map([...input.previews].filter(([id]) => !id.startsWith('move.')));
    return stay.size ? avg.choose({ ...input, previews: stay }) : pick;
  }
  let best = '';
  let bestDist = here;
  let risk = Infinity;
  for (const [id, p] of input.previews) {
    if (!id.startsWith('move.')) continue;
    const d = lowDistance(id.slice(5), season);
    if (d < bestDist || (d === bestDist && best && p.deathRisk < risk))
      [best, bestDist, risk] = [id, d, p.deathRisk];
  }
  return best || saferMove(input, avg.choose(input));
}

const bot: Bot = {
  id: 'skilled',
  version: '1.2.0',
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

    if (gate) return avg.choose(input);
    if (offSeason.has(view.phase) && !view.nest) return toLow(input);
    return saferMove(input, avg.choose(input));
  },
};

export default bot;
