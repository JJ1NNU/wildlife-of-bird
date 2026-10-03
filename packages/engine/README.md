# `@wb/engine` — 게임 규칙

순수하고 결정론적이다. UI·브라우저·네트워크에 의존하지 않으므로 같은 코드가
브라우저(게임)와 Node(시뮬레이터)에서 돈다.

- 계약: [`docs/studio/03-contracts.md`](../../docs/studio/03-contracts.md) 3장
- 원칙: [`docs/agents/engine.md`](../../docs/agents/engine.md) 7장

## 쓰는 법

```ts
import { loadGameData } from '@wb/schema';
import { act, getChoices, getView, newRun, preview, serialize } from '@wb/engine';

const { data } = loadGameData(raw);            // 검증된 데이터 묶음
if (!data) throw new Error('데이터가 어긋났다');

let state = newRun({ speciesId: 'parus-minor', seed: 'abc', mode: 'free' }, data);
const choices = getChoices(state, data);                 // 지금 고를 수 있는 것
const risk = preview(state, choices[0].id, data);        // 난수를 쓰지 않는 예상치
state = act(state, choices[0].id, data).state;           // 선택을 실행
const view = getView(state, data);                       // 화면이 그대로 그리는 형태
localStorage.setItem('save', serialize(state));          // 저장 (버전 포함)
```

## 지금 상태 (M0)

**형(타입)은 확정이고 속은 최소다.** 결정론과 저장/불러오기 왕복만 진짜로 보장한다.
행동·판정·에너지·위험·이벤트·번식 같은 실제 규칙은 디자인 명세가 나오는 M1에 채운다.

`잠정(#이슈)` 표시가 붙은 곳은 그 이슈의 결정에 따라 바뀐다.

## 화면에 필요한 것이 `ViewModel`에 없으면

엔진에 `dept:engine` 이슈로 요청한다. 화면이 확률·점수를 직접 계산하지 않는다
(03-contracts 1장 5번).
