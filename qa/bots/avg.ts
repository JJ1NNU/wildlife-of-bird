/**
 * 평균 봇 v1 (#26, #343, test-strategy 4장). 평균 플레이어의 대리 — 기대 총 번식 수·런 길이 목표의 기준.
 *
 * 화면이 보여 주는 것(`ViewModel` · `Preview` · 이벤트 카드의 선택지 효과)만 보고 고른다. 난수를 쓰지 않는다.
 * 1. 이벤트 관문이면 선택지 효과 점수가 가장 큰 것(같으면 목록 앞쪽). 판정형은 카드 `chance`로 성공·실패 가중.
 *    효과 점수(등급 값 `data/balance/effects.json` × 무게, #325 디자인 임시 봇 규칙):
 *    에너지 ×1 · 깃털 ×0.5 · 사망위험 −100× · 부상 −4×턴 · riskMod −20× · foodMod +20× ·
 *    둥지 위험·새끼 손실 −20× · 스탯 +2× · 유대 +0.3× · 일찍 떠나기 −3
 * 2. 배가 부르면(에너지 ≥ 상한의 75%) 능력치가 오르는 훈련 중 가장 많이 오르는 것 — 훈련 뒤에도 에너지가 상한의 절반 이상일 때만.
 * 3. 아니면 점수 = 예상 에너지 변화의 가운데 − 100 × 사망 위험이 가장 큰 것(같으면 목록 앞쪽).
 *    사망 위험 1%p를 에너지 1로 본다. 번식 관문은 04-breeding 구현 뒤 따로.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Preview } from '@wb/engine';
import type { Effect, GameEvent } from '@wb/schema';
import type { Bot } from '@wb/sim';

const FED = 0.75;
const KEEP_AFTER_TRAINING = 0.5;
const RISK_WEIGHT = 100;

const root = path.resolve(import.meta.dirname, '../..');
const readJson = (file: string) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
const tiers: Record<string, Record<string, number>> = readJson('data/balance/effects.json');
const events = new Map<string, GameEvent>(
  readdirSync(path.join(root, 'data/events'))
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => readJson(`data/events/${f}`) as GameEvent[])
    .map((e) => [e.id, e]),
);

function effectScore(e: Effect): number {
  if (e.type === 'fledgeEarly') return -3;
  const v = tiers[e.type]?.[e.tier] ?? 0;
  const sign = 'sign' in e && e.sign === 'loss' ? -1 : 1;
  switch (e.type) {
    case 'energy':
      return sign * v;
    case 'feather':
      return sign * 0.5 * v;
    case 'deathRisk':
      return -RISK_WEIGHT * v;
    case 'injury':
      return -4 * v;
    case 'riskMod':
      return -20 * v;
    case 'foodMod':
      return sign * 20 * v;
    case 'broodRisk':
    case 'chickLoss':
      return -20 * v;
    case 'statGain':
      return 2 * v;
    case 'bond':
      return sign * 0.3 * v;
  }
}

const sum = (effects: Effect[] | undefined) =>
  (effects ?? []).reduce((a, e) => a + effectScore(e), 0);

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
  version: '1.0.0',
  choose({ view, previews }) {
    const entries = [...previews];

    const gate = view.gate;
    if (gate?.kind === 'event') {
      const event = events.get(gate.id);
      if (!event) throw new Error(`평균 봇: 없는 이벤트 ${gate.id}`);
      const score = (choiceId: string) => {
        const o = event.options.find((x) => `event.${x.id}` === choiceId);
        if (!o) return Number.NEGATIVE_INFINITY;
        if (!o.check) return sum(o.effects);
        const p = gate.cards.find((c) => c.choiceId === choiceId)?.chance ?? 0;
        return p * sum(o.onSuccess) + (1 - p) * sum(o.onFail);
      };
      return (best(entries, ([id]) => score(id)) as [string, Preview])[0];
    }

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
