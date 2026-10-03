# `@wb/sim` — 헤드리스 시뮬레이션 러너

화면 없이 엔진을 돌린다. 밸런스 측정의 도구이고, **봇의 전략 자체는 QA**가 쓴다
(`qa/bots/`).

```bash
npm run sim              # data/의 첫 종으로 한 판
npm run sim parus-minor seed-1
```

## 봇 인터페이스

봇은 사람 플레이어와 **같은 정보만** 본다 — `RunState`를 직접 보지 않는다.
그래서 밸런스 측정이 실제 플레이와 어긋나지 않는다.

```ts
import type { Bot } from '@wb/sim';

export const greedyBot: Bot = {
  name: 'greedy',
  choose: ({ view, choices, previews }) =>
    // previews: Map<choiceId, Preview> — deathRisk, energyDelta, notes ...
    [...choices].sort((a, b) => previews.get(a.id).deathRisk - previews.get(b.id).deathRisk)[0].id,
};
```

## 지금 상태 (M0)

런 한 판을 끝까지 돌리는 고리와 봇 인터페이스만 있다. 대량 실행 · 지표 집계 ·
봇 3종(무작위 / 평균 플레이어 / 숙련)은 M1이다. 계측 항목은 QA가 요구한 것만 넣는다.
