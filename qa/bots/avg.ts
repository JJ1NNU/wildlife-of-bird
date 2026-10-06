/**
 * 평균 봇 v0 (#26, test-strategy 4장). 평균 플레이어의 대리 — 기대 총 번식 수·런 길이 목표의 기준.
 *
 * 화면이 보여 주는 것(`ViewModel` · `Preview`)만 보고 두 규칙으로 고른다. 난수를 쓰지 않는다.
 * 1. 배가 부르면(에너지 ≥ 상한의 75%) 능력치가 오르는 훈련 중 가장 많이 오르는 것 — 훈련 뒤에도 에너지가 상한의 절반 이상일 때만.
 * 2. 아니면 점수 = 예상 에너지 변화의 가운데 − 100 × 사망 위험이 가장 큰 것(같으면 목록 앞쪽).
 *    사망 위험 1%p를 에너지 1로 본다. 모든 선택 종류에 같은 점수를 쓴다(번식 선택은 04-breeding 구현 뒤 v1에서 따로).
 */

import type { Preview } from '@wb/engine';
import type { Bot } from '@wb/sim';

const FED = 0.75;
const KEEP_AFTER_TRAINING = 0.5;
const RISK_WEIGHT = 100;

const mid = (p: Preview) => (p.energyDelta[0] + p.energyDelta[1]) / 2;
const gain = (p: Preview) => Object.values(p.statGains ?? {}).reduce((a, b) => a + (b ?? 0), 0);

function best<T>(items: T[], score: (item: T) => number): T | undefined {
  let top: T | undefined;
  let topScore = Number.NEGATIVE_INFINITY;
  for (const item of items) {
    const s = score(item);
    if (s > topScore) [top, topScore] = [item, s];
  }
  return top;
}

const bot: Bot = {
  id: 'avg',
  version: '0.1.0',
  choose({ view, previews }) {
    const entries = [...previews];
    const { energy } = view.player;
    const cap = view.energyCap;

    if (energy >= FED * cap) {
      const trainings = entries.filter(
        ([, p]) => gain(p) > 0 && energy + mid(p) >= KEEP_AFTER_TRAINING * cap,
      );
      const pick = best(trainings, ([, p]) => gain(p));
      if (pick) return pick[0];
    }

    return (best(entries, ([, p]) => mid(p) - RISK_WEIGHT * p.deathRisk) as [string, Preview])[0];
  },
};

export default bot;
