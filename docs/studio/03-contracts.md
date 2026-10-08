# 모듈 경계 · 소유권 · 인터페이스 계약

> 관리: 엔진. 상태: **v1** (2026-10-03, ADR-001 반영). 바꾸는 법은 8장.
> 3장의 타입은 `packages/engine/src/types.ts`, 4장의 형식은 `packages/schema/src/`가 **실제 정의**이고 이 문서는 그 요약이다. 둘이 다르면 코드가 맞고, 이 문서를 고친다.
> 데이터 필드의 **의미**는 그 파일의 소유 부서가 정한다. 엔진은 그 의미대로 타입·검증기를 만든다.

---

## 1. 원칙

1. **데이터 주도**: 규칙의 숫자와 게임의 글은 `data/`에, 코드에는 로직만.
2. **사실과 수치의 분리**: 생태 사실(콘텐츠)과 조정 가능한 수치(디자인)는 다른 파일에 둔다. 서로의 파일을 고치지 않고도 각자 일할 수 있게.
3. **순수 엔진**: 엔진은 UI·브라우저·네트워크에 의존하지 않는다. 같은 코드가 브라우저(게임)와 Node(시뮬레이터)에서 돈다.
4. **결정론**: 같은 데이터 + 같은 시드 + 같은 선택 순서 = 같은 결과. 주간 시드, 버그 재현, 리플레이 검증의 기반.
5. **화면은 엔진의 거울**: 화면은 엔진이 준 ViewModel과 Preview를 그릴 뿐, 확률·점수를 계산하지 않는다.
6. **필요한 만큼만**: 이 계약도 지금 마일스톤에 필요한 만큼만 확정한다. 쓰이지 않는 필드·함수를 미리 정의하지 않는다(01-collaboration 15장).

---

## 2. 저장소 구조와 소유권

| 경로 | 소유 | 내용 |
|---|---|---|
| `apps/web/` | client | 화면, 상태 관리, PWA, 온라인 기능 |
| `infra/` | client | 리더보드 백엔드 설정(테이블·보안 규칙·함수) |
| `.env.example` | client | 환경 변수 형식(비밀값 없음) |
| `packages/engine/` | engine | 게임 규칙(순수·결정론) |
| `packages/schema/` | engine | 데이터 타입·검증기 |
| `packages/sim/` | engine | 헤드리스 시뮬레이션 러너, 봇 인터페이스 |
| `packages/tokens/` | art | 디자인 토큰(색·글꼴·간격) — 클라이언트가 가져다 쓴다 |
| `qa/` | qa | 봇(`bots/`), 리포트(`reports/`), e2e, 테스트 전략·지표, 출시 체크리스트(`release-checklist.md`), CI용 검사 스크립트(`ci/` — `ci.yml`에서 부르는 연결은 엔진) |
| `data/balance/` | design | 모든 조정 가능한 수치(공식 계수, 종별 밸런스, 효과 등급표, 목표치) |
| `data/calendar/` | design | 종별 연간 단계표(시기 → 단계마다의 국면, 재번식 시기) — 4.3.2 |
| `data/titles/` | design | 칭호·업적의 조건 (이름·설명 글은 content가 PR로 작성, design 리뷰) |
| `data/species/*.ecology.json` | content | 종의 생태 사실 |
| `data/events/` | content | 이벤트(글·조건·생태 근거, 효과는 등급 참조) — design 리뷰 필수 |
| `data/environment/` | content | 환경 변화(해거리·혹한·장마·천이·홍수·매립 등)의 생태 내용과 조건, 효과는 등급 — design 리뷰 필수 |
| `data/nodes/` `data/predators/` `data/codex/` | content | 지도 장소, 포식자, 도감 |
| `data/text/` | content | UI·튜토리얼·안내 문구 (client가 새 키를 잠정 문구와 함께 PR로 추가할 수 있다, content 리뷰) |
| `assets/` | art | 최종 에셋, 자리표시(`assets/placeholder/`) |
| `assets/inbox/` | art (대표가 넣음) | 이미지 생성 결과 투입함 |
| `scripts/art/` | art | 에셋 후처리 |
| `scripts/data/` | engine | 데이터 변환·마이그레이션 |
| `scripts/setup-github.sh` | pm | 라벨·마일스톤 생성 |
| `docs/design/` | design | 기획서 `gdd.md`, 시스템 명세 `specs/`(화면별 정보 요구사항 `specs/screens.md` 포함), 이벤트 컨셉 `event-concepts/` |
| `docs/content/` | content | 출처, 사실 검증, 문체, 식별 특징 |
| `docs/art/` `docs/ux/` | art | 아트 바이블, 에셋 목록, 프롬프트, 와이어프레임 |
| `docs/adr/` | engine(관리) | 기술 결정 기록. 작성은 결정한 부서 |
| `docs/studio/` | pm | 협업 규칙, 로드맵, 결정 기록, 위험, 회고 (단, 이 문서는 engine) |
| `docs/agents/` | pm | 부서별 임무 문서 (각 부서는 개정을 PM에 제안) |
| `docs/status/<부서>.md` | 각 부서 | 상태 파일 |
| `docs/status/README.md` | pm | 대시보드 |
| 루트 설정·잠금 파일: `package.json` `package-lock.json` `tsconfig.json` `biome.json` `.gitattributes` | engine | 의존성을 추가하는 부서는 잠금 파일 변경을 포함해 `review:engine`. 각 워크스페이스의 `package.json`은 그 패키지의 소유 부서 |
| `version.json` `CHANGELOG.md` `README.md` `docs/README.md` `.gitignore` | pm | |
| `.github/workflows/ci.yml` | engine | 검사 |
| `.github/workflows/deploy.yml` | client | 배포 |
| `.github/ISSUE_TEMPLATE/` `.github/pull_request_template.md` | pm | |
| `CLAUDE.md` | pm (명령어·저장소 지도 섹션은 engine) | |

**데이터 필드의 의미**는 그 데이터 파일의 소유 부서가 정의하고, 엔진은 그 의미대로 타입·검증기를 만든다.

---

## 3. 엔진 API — `@wb/engine`

```ts
import { newRun, getChoices, preview, act, getView, serialize, deserialize } from '@wb/engine';
import type { GameData } from '@wb/schema';   // 검증된 데이터 묶음 (4장)

// 모든 함수는 순수 함수다. 같은 입력이면 언제나 같은 출력.
newRun(config: RunConfig, data: GameData): RunState
getChoices(state: RunState, data: GameData): Choice[]               // 지금 고를 수 있는 모든 선택
preview(state: RunState, choiceId: string, data: GameData): Preview // 난수를 쓰지 않는다
act(state: RunState, choiceId: string, data: GameData): ActResult   // { state, log }
getView(state: RunState, data: GameData): ViewModel                 // 화면이 그대로 그리는 형태
serialize(state: RunState): string
deserialize(text: string, data: GameData): RunState                 // 저장 버전이 다르면 던진다 (6장)
```

```ts
interface RunConfig {
  speciesId: string           // 예: "parus-minor"
  seed: string
  startSex?: 'female' | 'male'
  mode: 'free' | 'weekly'
  weeklyId?: string           // 주간 시드 모드일 때
}

interface CalendarAt { year: number; period: number; step: number }  // period: 1~24 (1 = 1월 상반)

interface Choice {
  id: string
  kind: 'node' | 'action' | 'eventOption' | 'seasonPolicy'
      | 'mateCandidate' | 'mateOrder' | 'nestSite' | 'clutchSize' | 'parentingPolicy' | 'secondBrood'
      | 'inheritance' | 'migration'
  label: string
  disabled?: { reason: string }  // 예: 생물학적으로 불가능한 짝 지시 → 이유 표시
}

interface Preview {
  deathRisk: number              // 0~1, 화면에서 반올림 표시
  broodRisk?: number
  energyDelta: [number, number]  // 예상 범위 [최소, 최대]
  statGains?: Partial<Record<StatName, number>>
  mateAcceptance?: number        // 짝 지시 수락률
  notes: string[]                // "배가 고파 위험한 곳을 골랐다" 같은 설명
}

interface LogEntry {
  at: CalendarAt
  type: string                   // 'decision' | 'death' | 'mate' | 'event' | 'breeding' | ...
  text: string
  deltas?: Record<string, number>
  cause?: string                 // 사망·실패 원인 (QA 분석용)
}

interface ViewModel {
  at: CalendarAt
  phase: Phase                   // 지금 단계의 국면
  speciesId: string
  node: string                   // 지금 장소 id — 이름은 data.nodes
  player: Bird                   // 종 · 성별 · 나이 · 에너지 · 스탯(현재값) · 잠재력 · 깃털 · 경험 연수
  energyCap: number              // 에너지 상한(지방 상한, 01-formulas 2.1)
  starving: boolean              // 굶주림 경고 — energy < energyCap × energy.starvationWarnRatio (S-10)
  potentialRange: { [stat]: [아래, 위] }  // 플레이어 잠재력 등급 범위 — 숫자 대신 이것을 보인다 (05-inheritance 4장)
  totalBreeding: number          // 점수
  gameOver: boolean
  gate?: { kind: 'mateCandidate', cards: MateCandidateCard[], previousGone?: 'mateDeath' | 'divorce' }  // 열린 관문 — 짝 후보(S-20). previousGone = 지난 짝이 없어진 이유(2.1)
       | { kind: 'mateOrder', cards: { choiceId, acceptance?: 'high' | 'mid' | 'low' }[] }  // 짝 지시 — 수락률은 등급만
       | { kind: 'parentingPolicy', cards: Choice['items'] }  // 육아 방침 — 항목별 선택·현재값
  recentLog: LogEntry[]          // 최근 20건 — 이야기 피드
}

interface MateCandidateCard {    // 신호만 — 실제 잠재력·성격은 없다 (04-breeding 2.3)
  choiceId: string               // 'mateCandidate.<n>'
  plumage: string                // 깃 선명도 등급 = 품질 + 고정 오차
  song: string                   // 노래 등급 = 과시 현재값
  age: number
  hint: 'bold' | 'shy'           // 성격 힌트 (hintAccuracy 확률로 맞음)
  accepts: boolean               // 아니면 그 선택지는 disabled
  previous?: true                // 지난 짝(맨 앞 1장, 늘 받아들임, hint는 실제 성격) — 고르면 재결합 (2.1·2.2)
  potentialRange?: { [stat]: [아래, 위] }  // 지난 짝만 — 잠재력 등급 범위 (05-inheritance 4장)
  bond?: { now, reunion }        // 지난 짝만 — 유대 지금 → 재결합 뒤 (2.2)
}
```

`StatName` = `flight` `foraging` `vigilance` `stamina` `display` `social` `navigation` (gdd 5.1장).

### 선택지 ID
- 행동 `action.<행동>`(`forage` `rest` `social` `explore`), 훈련은 스탯마다 `action.train.<스탯>`(종 `aptitude`의 스탯마다 — 맨 `action.train`은 없다, #124), 이동 `move.<장소>`.
- 짝 후보 관문의 선택지 id는 `mateCandidate.<n>`(카드 순서, 1부터). 관문은 그 단계의 흐름 끝에 열리고 **달력은 그 단계에 머문다** — 관문을 고르면 다음 단계로 간다. 고르기는 판정이 없어 `preview`는 위험 0·에너지 0이다.
- 번식 관문(`04-breeding` 1장)의 `kind`: `mateCandidate` `mateOrder` `nestSite` `clutchSize` `parentingPolicy` `secondBrood` `inheritance`. **관문이 열려 있으면 `getChoices`는 관문의 선택지만** 준다. 짝 지시·육아 방침은 판정 1 전에 받고 같은 단계에서 이어 행동을 고른다. 나머지 관문은 단계 흐름의 끝에 열린다.
- 짝 지시 관문의 선택지 id는 `mateOrder.none` · `mateOrder.<지시>` · `help.<도움>`(`breeding.json` `orders`·`help`의 키, 그 국면·성별에 맞는 것만). 짝이 있는 둥지 국면의 첫 단계에 **첫 칸보다 먼저** 열리고, 고르면 같은 단계의 칸으로 간다(달력 그대로). 불가능한 지시(`role: impossible`)는 `disabled`. `preview`의 `mateAcceptance`와 카드 등급은 성격 확인 전이면 `neutral`로 계산한 화면용 값. 로그 `order`(`deltas.acceptance`·`effect`, 거절이면 `cause: 'refused'`). `RunState.order`가 그 국면 동안 걸린다.
- 둥지 국면 동안(둥지 자리 관문 뒤 ~ `nestling` 끝) `move.*`는 `disabled`("둥지를 떠날 수 없다").
- **육아 방침은 선택지 하나에 여러 항목**을 담는다(확정, #21): 선택지는 `parentingPolicy` 하나, `Choice.items: { item, label, options, current, locked? }[]`(`locked` = `postFledge` 조정에서 못 바꾸는 `nestCare`·`fledgeTiming`). `act(state, 'parentingPolicy?intensity=high&allocation=compete')` — 빠진 항목은 현재값(처음에는 기본값, 급이 강도는 `mid`), 맨 `parentingPolicy`는 그대로 두기. 없는 항목·선택이나 잠긴 항목을 바꾸면 던진다. 항목 이름은 `intensity` + `breeding.json` `parenting`의 키. 새끼가 있는 `nestling`·`postFledge` 첫 단계에 짝 지시 다음, **첫 칸보다 먼저** 열리고 고르면 같은 단계의 칸으로 간다. `getView().gate`는 `{ kind: 'parentingPolicy', cards: items }`. 로그 `parenting`. `RunState.parenting`은 둥지가 있는 동안 걸린다.
- **2차 번식 여부 관문**(`04-breeding` 7장, #121): 선택지 `secondBrood.yes` · `secondBrood.no`. 번식이 실패한 단계(B-5 부화 0·새끼 전멸·둥지 손실)의 흐름 끝에 `00-core-loop` 4.4 조건 1~3(그 해 둥지 `RunState.yearNests` < 2 · 짝 있음 · 다음 시기 ≤ `layByPeriod`)이 참이면 열리고, 고르면 다음 단계로 간다. `getView().gate`는 `{ kind: 'secondBrood', cards: { choiceId, energyCost }[] }`. '한다'는 에너지 손실 · 다음 시기부터 `rebrood`로 덮어쓰기(짝 그대로). '안 한다'거나 관문이 안 열리면 분할 해제(4.5). 로그 `brood`(둥지 손실은 `cause: 'nestLoss'` — `01-formulas` 3.2, 알·새끼가 둥지에 있는 단계마다 1번, 그 시기의 이벤트·환경 `riskMod`가 위험 보정 — `RunState.periodMods`, 시기가 바뀌면 사라진다). 1차 성공 뒤에는 계승 화면에서 잔류를 고른 직후 같은 단계에서 열린다(조건 4).
- **계승 관문**(`05-inheritance` 5장, #139): `postFledge` 마지막 단계의 흐름 끝에 새끼가 1마리 이상 살아 있으면 독립 — `totalBreeding` +1(로그 `breeding`) 뒤 열린다. 선택지 `inherit.stay` · `inherit.chick.<n>`(부화 순서, 1부터). `getView().gate`는 `{ kind: 'inheritance', totalBreeding, stay: { choiceId, age, agingMult, bond?, yearSurvival }, cards: { choiceId, sex, potentialRange, silverSpoon, firstWinter, yearSurvival }[] }` — `yearSurvival`은 0~1(사건 제외, 6장). 잔류면 둥지를 거두고 2차 번식 관문(조건이 참일 때) 또는 다음 단계. 계승이면 고른 새끼가 `player`(나이·경험 0, 에너지 = 지방 상한 × `inheritStartRatio`, 깃털 `runStart`, `Bird.silverSpoon` = 은수저 지수)가 되고 짝·둥지·지시·방침이 없어지며 그 해는 분할 해제. 로그 `inheritance`. `Bird.silverSpoon`이 있으면 나이 ≤ `silverSpoon.growthUntilAge` 동안 스탯 상승에 은수저 성장 배율(01-formulas 1.3·6.2). **가계도**(8장): `RunState.life`가 지금 개체의 생애(`generation` 1부터 · `sex` · `start {at, age}` · 조작 중 `breeding`·`fledged`)를 들고, 조작이 끝나면 그 로그에 `LogEntry.life`(= 위 + `end {at, age}` · `reason: 'inherit' | 'death'`, 사망 원인은 로그 `cause`)로 한 줄을 남긴다 — 계승은 `inheritance` 로그, 사망은 `death` 로그. 잔류는 줄을 닫지 않는다. 화면 S-30·QA는 이 로그를 모아 읽는다. `SAVE_VERSION` 5.

### 행동 루틴 — 칸 단위 입력 (#186, 잠정)
`00-core-loop` 3.5(#175)를 API로 옮긴 것. **함수 목록·`Bot` 인터페이스·선택지 id는 그대로**다 — 루틴은 "칸 하나 = `act` 하나"로 들어온다.

- **칸 채우기 = `act` 1회.** 루틴을 짜는 동안 `getChoices`는 **다음 빈 칸**의 선택지(`action.*` · `action.train.<스탯>` · `move.<장소>`, 지금과 같은 id)를 준다. 앞 칸에 옮기기를 넣었으면 그 장소 기준이다(3.5 '다음 칸부터 새 장소'). 채우는 `act`는 칸을 적어 두기만 한다 — **판정·난수 없음**.
- **마지막 칸을 채우는 `act`가 루틴을 실행**한다. 칸마다 판정 1→2→3(3.1) → 이벤트 추첨. 칸 사망이면 남은 칸은 실행하지 않는다. 한 루틴의 이벤트는 1개까지(첫 당첨 뒤 그 단계의 남은 칸은 추첨 안 함).
- **되돌리기는 엔진이 갖지 않는다.** 함수가 모두 순수하므로 화면은 칸을 채운 `RunState`를 자기 쪽에 쌓아 두고, 칸을 지우면 앞 상태로 돌아간다. 확정 전 칸의 `preview`도 그 상태로 부른다.
- **`preview`(칸)** = 앞에 채운 칸들을 위험·이벤트 없이(난수 없이) 적용한 **예상 상태**에서 그 칸 하나의 결과. 루틴 전체 위험이 화면에 필요하면 클라이언트가 이슈로 요청한다(지금은 만들지 않는다).
- **이벤트로 멈춤**: 당첨되면 `getChoices`는 그 이벤트의 `eventOption`만 준다. 고르면 **남은 칸 다시 채우기**로 돌아간다 — 빈 칸 수 = 남은 칸 수, 제안값 = 원래 계획의 남은 칸. 그대로 두려면 화면이 제안값을 차례로 `act`한다(화면의 버튼 하나, 엔진 함수는 없음). 제안값이 이제 못 고르는 선택(예: 이벤트로 장소가 바뀜)이면 그 칸 제안은 비운다.
- **제안값(기본값)**: 새 루틴의 제안 = 바로 전 단계 루틴을 앞에서부터(칸 수가 다르면 자르거나 마지막 칸 반복, 3.5). 둥지 국면처럼 못 고르는 칸은 비운다.
- **관문**: 짝 지시·육아 방침은 첫 칸보다 먼저(지금처럼 단계 시작), 나머지 관문은 마지막 칸 실행 뒤 단계 끝(4.6). 관문이 열려 있으면 칸 선택지는 나오지 않는다.

```ts
interface ViewModel {
  // ...기존 필드
  routine?: {                    // 루틴을 짜는 중일 때만 (관문·이벤트 중에는 없음)
    slots: number                // 이 단계의 칸 수. 번식기 = 6 ÷ 단계 수, 평시 = 6 + 스탯 합 문턱(7·8, 01-formulas 9.6). 루틴을 짜기 시작한 상태로 정하고 실행 중에는 고정
    nextSlotIn?: number          // 평시에 다음 칸까지 남은 스탯 합(올림). 번식기·8칸이면 없음
    filled: string[]             // 이미 채운 칸의 선택 id (이벤트 뒤 다시 채우기면 실행된 칸은 빠진다). 마지막 칸에서 이벤트가 났으면 다시 채우기 없이 단계 끝
    suggested: (string | null)[] // 남은 빈 칸마다 제안 id. null = 제안 없음
    replan: boolean              // true = 이벤트 뒤 남은 칸 다시 채우기 (결정으로 세지 않는다)
  }
}

interface LogEntry {
  // ...기존 필드
  slot?: number                  // 칸 판정 로그면 그 단계의 몇째 칸(1부터)
}
```

- **로그**: 칸마다 `type: 'slot'`(`text` = 행동 이름, `deltas`, `slot`). 루틴이 실행될 때 **`decision` 1건**(`text` = 칸 이름들, `deltas` = 루틴 합) — 결정 셈(5.1·5.4)은 `decision` 수로 한다. 이벤트 뒤 다시 채우기의 실행은 `decision`이 아니라 `replan` 1건. 사망은 지금처럼 `death`(+ `slot`).
- **봇**: 인터페이스 그대로. 칸마다 `choose`가 1번 불린다(`view.routine`으로 몇째 칸인지·제안값을 본다). 기존 봇은 고치지 않아도 돈다. `choose` 호출 수는 결정 수가 아니다 — 지표는 로그 `decision`으로 센다.
- **저장·리플레이**: `RunState`에 짜는 중인 루틴(칸 수·채운 칸·이벤트로 멈춘 위치)이 있어 칸 사이 어디서든 `serialize`/`deserialize`·`replay --resume-at`이 이어진다. 판 기록 `choices`는 칸 id 순서(관문·이벤트 선택이 사이에 섞임). 구현 때 `SAVE_VERSION` +1.
- **연속 체류(`stay`)**: 칸 단위로 센다(도착한 칸 0). 칸 단위 수치(에너지·깃털 ÷ 칸 수, 고갈 `stay ÷ 칸 수`, 위험 `1 − (1 − p)^(1/칸 수)`, 잠 회복 `sleepRecoverPerStep`)는 `01-formulas` 9.4.
- 구현(#186): `RunState.routine`(채운 칸)·`lastRoutine`(제안값), `SAVE_VERSION` 3. 에너지 상한은 칸마다 자른다.
- 구현(#21, 이벤트): 칸마다 판정 3 뒤 단계 이벤트 추첨 — 확률 `1 − (1 − events.chancePerStep)^(1/칸 수)`(`01-formulas` 9.4), u₁은 칸마다 늘 쓴다. 당첨되면 **관문 `event`**(`RunState.gate = { kind: 'event', id }`, 멈춘 자리 `RunState.paused` — 칸 수·실행한 칸 수·원래 계획). 선택지 id `event.<선택지 id>`(`kind: 'eventOption'`, `label` = 선택지 글). `getView().gate`는 `{ kind: 'event', id, cards: { choiceId, chance? }[] }` — `chance`는 판정형만(성공 확률 0~1, 03-events 5.2), 제목·본문·효과 숫자는 화면이 `data.events`·`data.effects`에서. 다시 채우기 중 `view.routine`은 `slots` = 남은 칸 수 · `filled`·`suggested`는 남은 칸만 · `replan: true` · `nextSlotIn` 없음. 이벤트 효과로 죽으면 `death`(`cause` = 효과 원인). 쿨다운 `RunState.eventCooldown`(이벤트 id → 남은 단계, 단계가 넘어갈 때 1 준다). 로그 `event` 2건(당첨: `text` = 제목, `slot` / 고름: `text` = 선택지 글) — 둘 다 `event` = 이벤트 id. `SAVE_VERSION` 6. 잠정(#21): 마지막 칸의 이벤트로 걸린 부상도 그 단계 끝에 1 준다.

### 필수 성질
- **결정론**: 난수 상태(`RunState.rng`, 32비트 정수)가 상태 안에 있다. `Math.random`·현재 시간 사용 금지. 테스트가 지킨다.
- `RunState` 안에는 지금 난수 상태, 달력, **그 해의 실제 단계표**(`calendar`, 00-core-loop 8장), 지금 장소·연속 체류, 플레이어 개체, 점수(`totalBreeding`), 게임 오버 여부, 판정 기록(`log`)이 있다. **짝 · 새끼 · 가계도 · 환경은 그 규칙을 구현할 때(M1, #21) 더한다.** 화면·봇은 `RunState`를 직접 읽지 않고 `getView`만 쓴다 — 그래서 `RunState` 내부가 바뀌어도 화면·봇이 깨지지 않는다.
- `getView`는 화면에 필요한 모든 것을 준다. 부족하면 클라이언트가 `dept:engine` 이슈로 요청한다. `ViewModel`에 필드를 **더하는** 것은 깨지지 않는 변경이다.
- 고를 수 없는 `choiceId`(목록에 없거나 `disabled`)를 `preview`·`act`에 넘기면 던진다(#47).
- **화면 표시 글자**는 엔진이 낸다: `formatRisk` · `formatEnergyDelta` · `formatStatGain` · `acceptanceBand` (`01-formulas` 7장). 화면은 `Preview`의 숫자를 이 함수로 바꿔 보여 준다 — 반올림 규칙이 화면·봇 리포트에서 갈라지지 않게.

### 시뮬레이터 — `@wb/sim`

```ts
interface Bot {
  id: string
  version: string              // 전략을 바꾸면 올린다 — 판 기록에 남는다
  choose(input: { view: ViewModel; choices: Choice[]; previews: Map<string, Preview> }): string  // choiceId
}
runOne(config: RunConfig, data: GameData, bot: Bot): RunRecord
replay(record: { config, choices }, data: GameData, resumeAt?: number): string   // 마지막 상태 해시
```

- 봇은 사람 플레이어와 같은 정보(`ViewModel` · `Choice` · `Preview`)만 본다. `getView`는 복사본이라 봇이 고쳐도 상태가 바뀌지 않는다. 봇 전략은 QA(`qa/bots/<이름>.ts`가 `Bot`을 `export default`), 러너·판 기록 형식은 엔진.
- `previews`에는 `disabled`가 아닌 선택만 있다. 봇이 목록에 없거나 `disabled`인 id를 고르면, 엔진이 던지면, 선택이 0개면, 100년(2400시기)에 닿으면 — 그 판은 `error`를 적고 끝나며 러너는 다음 판으로 간다.
- **판 기록**(JSONL, 판 하나 = 한 줄): `config` · `bot {id, version}` · `gameVersion` · `commit` · `choices`(선택 id 순서) · `result {totalBreeding, gameOver, endAt}` · `error`(null 또는 `{message, at, stack}`) · `finalStateHash`(`serialize` 결과의 SHA-256) · `log`.
- `replay`는 `config` + `choices`를 다시 재생한다. `resumeAt = k`면 k번째 선택 앞에서 `serialize` → `deserialize`로 끊었다 이어 간다. 명령은 `CLAUDE.md` "시뮬레이션 실행".
- 지표용 로그 종류(`decision` `breedingSeason` `breeding` `inheritance` `death` `event`, #33 4절)는 그 규칙을 구현할 때(M1, #21) 더한다.

### 구현 상태 (M1 진행 중, #21)
- 실제 규칙: 단계표(시기별 단계 수·국면) · 행동·훈련·옮기기 선택지 · 판정 1·2·3(에너지 → 스탯 → 위험, `00-core-loop` 3.1) · 아사(`starvation`)·포식(`predation`) 사망 · `period 1` 진입(나이·경험 +1, 노화, 단계표 초기화). 로그 `decision` · `death`. **짝 후보 관문**(`pairing` 첫 단계, 04-breeding 2.2~2.4 — 후보 생성·신호·상호 선택·1장이면 자동 진행), `RunState.mate`·`gate`, 로그 `mate`. 정규분포 표본은 `nextNormal`(Box–Muller, 균등 2개).
- 잠정(#21): 지난 짝의 생존·이혼·재결합 카드(04-breeding 2.1)는 종 키(`mateYearSurvival`·`divorce`)가 생기면 — 그 전에는 해마다 새 후보만 나오고 고르면 짝이 바뀐다.
- **짝 지시 관문**(04-breeding 3장 — 수락·거절 f·유대·성격 확인·짝 r·상호성은 `feedMate` 단계만). 효과: `patrol`(경쟁 확률) · `courtshipFeed`·`incubationFeed`(소비에서 뺌) · `feedMate`(소비 +) · `splitBrood`(새끼 사망). 잠정(#21): `guardNest`·`feedHigh`는 걸어 두기만 — 둥지 손실·은수저 조각에서.
- 아직 없음: 1차 성공 뒤 2차 번식 관문 · 둥지 손실 · 은수저 · 계승 · 점수 · 이벤트 · 환경 카드 · 계절 방침.
- 런 시작 개체의 잠재력 = 종 평균(`stats.aptitudeMean`), 현재값 = 잠재력 × `mate.candidateCurrentRatio`, 경험 연수 = `runStart.age`(05-inheritance 2장, #152). 잠정(#21): 런 시작 개체의 성장 배율 1.

---

## 4. 데이터 계약 — `@wb/schema` (값은 예시)

- 검증: `npm run validate:data` — CI에서도 돈다. 실패하면 **파일 · 파일 안의 위치 · 이유**를 알려 준다.
- 스키마가 담은 형식: 4.1 · 4.2 · 4.3 · 4.3.1 · 4.3.2 · 4.3.3 · 4.4 장소·포식자·도감 · 4.5 화면 문구. `data/titles/`는 소유 부서가 **첫 파일을 올릴 때** 엔진이 형식을 확정해 스키마에 더한다(미리 만들지 않는다).
- 모든 객체는 **모르는 필드를 거부**한다(오타를 잡기 위해). 필드를 더하려면 8장 절차로 스키마를 함께 고친다.

### 4.1 종: 생태 사실(content)과 밸런스(design)의 분리

`data/species/parus-minor.ecology.json` — content · 스키마 `SpeciesEcology` (줄임 — 전체는 실제 파일)
```json
{
  "id": "parus-minor",
  "nameKo": "박새",
  "scientificName": "Parus minor",
  "residency": { "value": "resident", "sources": ["SRC-004"], "factCheck": "needs-review" },
  "habitats": { "values": ["forest", "woodland-edge"], "sources": ["SRC-004"], "factCheck": "needs-review" },
  "breeding": {
    "season": { "fromPeriod": 7, "toPeriod": 14, "sources": ["SRC-004"], "factCheck": "needs-review" },
    "clutchSize": { "typicalMin": 7, "typicalMax": 10, "max": 18, "sources": ["SRC-004"], "factCheck": "needs-review",
                    "note": "최소값은 출처에 없어 비웠다" },
    "incubationDays": { "min": 12, "max": 13, "sources": ["SRC-004"], "factCheck": "needs-review" },
    "incubationBy": { "value": "female", "sources": ["SRC-001"], "factCheck": "verified" },
    "...": "layStart · layStartDriver · broodsPerYearMax · nestlingDays · nestType"
  },
  "diet": { "primary": { "values": ["insects", "spiders"], "sources": ["SRC-004"], "factCheck": "needs-review" }, "...": "secondary · nestlingFood" },
  "lifespan": { "maxRecordedMonths": 95, "sources": ["SRC-025"], "factCheck": "verified", "note": "최장 기록이지 평균 수명이 아니다" },
  "alarmCalls": { "values": [ { "id": "jar", "predatorType": "snake", "...": "...", "sources": ["SRC-001"], "factCheck": "verified" } ] },
  "sources": ["SRC-001", "SRC-004", "SRC-005"],
  "factCheck": "needs-review"
}
```
- **사실마다 출처를 붙인다** (#56 결정 — 한 파일 안에서도 사실마다 출처 등급이 다르다). 사실 하나 = 값 + `sources` · `factCheck`(`verified` | `needs-review`) · `note?`. 값의 모양은 셋 중 하나: 하나의 값 `value` / 목록 `values` / 여러 필드(`min`·`max` 등)를 그대로. 스키마 `fact()`.
- `verified`인 사실은 출처가 1개 이상 있어야 한다.
- 값을 아직 못 찾은 사실은 값 없이 `needs-review`와 `note`(찾아볼 곳)만 둔다 (지금은 없음). 스키마 `UnresolvedFact`.
- 맨 위의 `sources`는 파일이 쓰는 출처 전체, `factCheck`는 파일 요약. 출시 판정(QA 체크리스트)은 사실마다 붙은 `factCheck`로 센다.
- `id`: 학명을 소문자-하이픈으로. 파일 이름과 같게 쓴다.
- `residency`: `resident` | `summer` | `winter` | `passage` (텃새·여름 철새·겨울 철새·나그네새). (content 확인, #46)
- `breeding.clutchSize`: `min`(선택) `≤ typicalMin ≤ typicalMax ≤ max`, `incubationDays`·`nestlingDays`: `min ≤ max`를 검증한다.
- `breeding.incubationBy`: `female` | `male` | `both`
- 필드 이름과 의미는 content가 정한다. 필드를 더하면 8장 절차로 스키마를 같은 PR에서 고친다(`review:engine`).

`data/balance/species/parus-minor.json` — design · 스키마 `SpeciesBalance` · 의미: `docs/design/specs/01-formulas.md` (줄임)
```json
{
  "speciesId": "parus-minor",
  "targets": { "avgRunYears": 4.5, "expectedTotalBreeding": 4.0, "tolerance": 0.1, "breedingYearRatio": 1.0,
               "yearBreedingSuccess": 0.9, "firstBroodSuccess": 0.55, "decisionsPerYear": { "min": 60, "max": 90 } },
  "aptitude": { "flight": "C", "foraging": "A", "vigilance": "A", "stamina": "D", "display": "B", "social": "A" },
  "runStart": { "age": 1, "period": 1 },
  "seasons": { "winter": [23, 24, 1, 2, 3, 4], "spring": [5, 6, 7, 8, 9, 10], "summer": [11, "…", 16], "autumn": [17, "…", 22] },
  "basalPerStep": { "winter": 8, "spring": 6, "summer": 5, "autumn": 6 },
  "predatorActivity": { "winter": 1.0, "nestling": 1.3, "…": "국면 이름 → 배수" },
  "flockPhases": ["winter", "autumnFlock"],
  "nestLossPerStep": 0.045,
  "agingStartAge": 3,
  "firstWinterRiskMult": 1.8,
  "secondBrood": { "layByPeriod": 13, "energyCost": "large" }
}
```
- `speciesId`의 생태 파일이 있어야 한다(교차 검증).
- `seasons`: 1~24가 **정확히 한 번씩** 나와야 한다(검증).
- `aptitude`는 종에 해당하는 스탯만(예: `navigation`은 철새만), 등급 `S`~`D`. 쓰는 등급마다 `formulas.json`의 `stats.aptitudeMean`·`aptitudeGrowth`에 계수가 있어야 한다(교차 검증).
- 국면 이름(`predatorActivity` 키 · `flockPhases`)은 열거 `Phase`이고, 그 종의 단계표(4.3.2)에 있는 국면이어야 한다(교차 검증, #91). 밸런스가 있는 종은 단계표도 있어야 한다.
- `secondBrood`는 2차 번식이 있는 종만 쓴다(선택). 털갈이 지연은 재번식이 `molt` 시기를 차지하는 것으로 생기므로 `moltDelayPeriods`는 없앴다(#91, `00-core-loop` 4.4). v0의 `nestSuccessBase`는 `targets.firstBroodSuccess`(목표)와 `nestLossPerStep`(계수)로 나뉘었다(#54).

### 4.2 효과 등급표 — design

`data/balance/effects.json` · 스키마 `EffectsTable` · 의미: `docs/design/specs/03-events.md` 6장 — 표의 모든 등급이 있어야 한다.
```json
{
  "energy":     { "small": 5, "medium": 12, "large": 25 },
  "feather":    { "small": 5, "medium": 10, "large": 20 },
  "deathRisk":  { "low": 0.01, "medium": 0.03, "high": 0.08 },
  "broodRisk":  { "low": 0.1, "medium": 0.3, "high": 0.6 },
  "chickLoss":  { "small": 0.15, "medium": 0.3, "large": 0.5 },
  "statGain":   { "small": 1, "medium": 3, "large": 6 },
  "bond":       { "small": 3, "medium": 8, "large": 15 },
  "injury":     { "small": 2, "medium": 3, "large": 4 },
  "riskMod":    { "low": 0.2, "medium": 0.5, "high": 1.0 },
  "foodMod":    { "small": 0.15, "medium": 0.3, "large": 0.5 },
  "eventWeight":{ "common": 10, "uncommon": 4, "rare": 1 },
  "checkDifficulty": { "low": 30, "medium": 50, "high": 70 }
}
```
콘텐츠는 이벤트에 숫자 대신 등급을 쓰고, 디자인은 이 표만 바꿔 전체 밸런스를 조정한다. 등급은 `small·medium·large`와 `low·medium·high`(그리고 가중치 `common·uncommon·rare`)뿐이다. `injury`는 정수(부상 단계 수). 새 효과 종류는 디자인이 추가하고 엔진이 해석기를 구현한다.

### 4.3 이벤트 — content (design 리뷰)

`data/events/<종 또는 common>.json` 은 이벤트의 **배열**이다 · 스키마 `GameEvent` · 의미: `docs/design/specs/03-events.md`. 아래는 한 항목
```json
{
  "id": "ev.parus-minor.snake-at-nest",
  "species": ["parus-minor"],
  "when": { "phaseAny": ["nestling"], "phaseLastStep": true, "habitatAny": ["forest"], "hasBrood": true, "hasMate": true },
  "weight": "uncommon",
  "title": "둥지 아래의 소리",
  "body": "둥지 구멍 아래 나무껍질을 무언가 천천히 긁으며 올라온다. 짝이 날카로운 경보음을 연달아 낸다.",
  "options": [
    {
      "id": "mob",
      "text": "짝과 함께 둥지 주변을 날며 경보음을 낸다",
      "check": { "stat": "vigilance", "difficulty": "medium" },
      "onSuccess": [{ "type": "broodRisk", "tier": "low" }, { "type": "bond", "tier": "small", "sign": "gain" }],
      "onFail": [{ "type": "deathRisk", "tier": "low", "cause": "predation", "predator": "rat-snake" }, { "type": "broodRisk", "tier": "high" }]
    },
    { "id": "signal-flee", "text": "새끼들이 둥지를 빠져나가도록 경보를 이어 간다",
      "effects": [{ "type": "fledgeEarly" }, { "type": "chickLoss", "tier": "small" }] },
    { "id": "stay-away", "text": "몸을 낮추고 멀리서 지켜본다", "effects": [{ "type": "broodRisk", "tier": "high" }] }
  ],
  "ecologyBasis": "박새는 뱀에게 다른 포식자와 구별되는 경보음을 내며, 이를 들은 새끼는 둥지 구멍 밖으로 빠져나간다.",
  "sources": ["SRC-001", "SRC-023"],
  "factCheck": "verified"
}
```
- `id`: `ev.<종 또는 common>.<이름>` (소문자·숫자·하이픈). `species`의 종마다 생태 파일이 있어야 한다(교차 검증).
- `draw`: `step`(기본 — 단계 이벤트) | `periodStart`(환경 카드).
- `when`(모두 선택, 모두 참이어야 함): `phaseAny`(국면 열거 `Phase`, 이벤트의 모든 종의 단계표에 있어야 함) `phaseLastStep`(그 국면이 이어지는 마지막 단계, #73) `habitatAny` `periodFrom`·`periodTo`(함께, from > to면 해를 넘김) `sex` `ageMin` `ageMax` `hasMate` `hasBrood` `energyBelow`(0~1) `actionAny`. v0의 `phase`는 `phaseAny`로 바뀌었다(#54).
- 선택지 두 모양: 고정 효과 `{ id, text, effects }` / 판정형 `{ id, text, check: { stat, difficulty }, onSuccess, onFail }`. 섞어 쓸 수 없다.
- 효과 종류: `energy` `feather` `bond` `foodMod`(등급 + **`sign` 필수**: `gain` | `loss`, #37), `statGain`(`stat` + 등급), `chickLoss` `injury`(등급), `deathRisk`(위험 등급 + **`cause` 필수**: `cold` `accident` `disease` `predation`, `predation`이면 `predator` 선택), `broodRisk` `riskMod`(위험 등급), `fledgeEarly`.
- **성립 조건 검증** (03-events 6.2): `bond` → `when.hasMate: true` / `broodRisk`·`chickLoss` → `when.hasBrood: true` / `fledgeEarly` → `when.phaseAny`가 `["nestling"]`뿐 **그리고** `phaseLastStep: true` (#73) / `statGain`·`check.stat` → 이벤트의 모든 종의 `aptitude`에 그 스탯 / 선택지 수: `step` 2~3개, `periodStart` 1~3개.
- 글은 v1에서 데이터 파일에 한국어로 직접 쓴다(다국어는 P2).
- `factCheck`: `verified` | `needs-review`. `needs-review` 항목은 출시 빌드에서 제외하거나 출시 전 해결(QA 출시 체크리스트).

### 4.3.1 공식 계수 — design

`data/balance/formulas.json` · 스키마 `Formulas` · 의미: `docs/design/specs/01-formulas.md` 전체.
- 종 공통 계수. 최상위 키: `stats` `actions` `nodeTiers` `energy` `feather` `risk` `brood` `mate` `heredity` `silverSpoon` `aging` `display` `events`.
- **키 하나하나 엄격히** 검사한다 — 오타 난 키가 조용히 기본값으로 빠지면 밸런스 버그를 찾기 어렵다(#54). 키를 더하거나 바꾸면 스키마를 같은 PR에서 고친다(`review:engine`).
- 행동 id는 `forage` `rest` `train` `social` `explore` `move`로 고정이다 — 행동마다 엔진 로직이 따로 있기 때문이다.

### 4.3.2 연간 단계표 — design

`data/calendar/<종>.json` · 스키마 `Calendar` · 의미: `docs/design/specs/00-core-loop.md` 4장
```json
{
  "speciesId": "parus-minor",
  "periods": [ { "period": 1, "steps": ["winter"] }, { "period": 7, "steps": ["nestSite", "nestSite", "nestSite"] } ],
  "rebrood": [ { "steps": ["nestSite", "laying", "incubation"] }, { "steps": ["nestling", "nestling", "postFledge"] } ]
}
```
- `periods`: 시기 1~24가 **차례로 한 번씩**. `steps`는 단계마다의 국면 이름, 길이 = 단계 수(1~3).
- `rebrood`: 재번식을 하면 다음 시기부터 덮어쓰는 시기들(1개 이상, 각 1~3단계).
- 국면 이름은 열거 `Phase`(`00-core-loop` 2.2의 9개). 새 국면은 엔진 규칙과 함께 더한다(M4 `migration` 등).
- 단계표는 기본값이고 런 상태가 실제 값이다(재번식·분할 해제). 행동 목록·관문은 단계표에 두지 않는다(`00-core-loop` 4.3 · 4.6).
- `GameData.calendar`: 종 id → 단계표. 생태 파일이 있는 종이어야 한다.

### 4.3.3 번식 계수 — design

`data/balance/breeding.json` · 스키마 `Breeding` · 의미: `docs/design/specs/04-breeding.md`(키 이름으로 참조).
- 최상위 키: `mate` `orders` `help` `nestSite` `parenting` `species`. `formulas.json`처럼 **키 하나하나 엄격히** 검사한다.
- `orders.<id>.role`: 지시를 받는 **짝의 성별** → `native` | `shared` | `unusual` | `impossible`. 할 수 있는 성별이 있는 지시는 `cost`(`Tier` → `formulas.mate.costConflict`) · `risky` · `mateR`가 필요하다.
- `nestSite.contestDifficulty`: 장소의 봄 경쟁 등급(`low` `medium` `high`) → 판정 난이도 등급(`effects.checkDifficulty`). `none`은 판정 없이 성공.
- `parenting.<항목>`: 선택 → 효과. **첫 선택이 기본값**이고 효과가 없어야 한다(`{}`). 급이 강도(`low`·`mid`·`high`)는 `formulas.json`에 있어 여기 없다.
- `species.<종>`: 종마다 다른 번식 계수. 생태 파일이 있는 종이어야 하고, 종 밸런스가 있는 종은 여기에도 있어야 한다.
- `GameData.breeding`: 이 파일 그대로.

### 4.4 장소·포식자·도감 — content
- 장소(`data/nodes/<id>.json`, 스키마 `MapNode`): `id`(소문자-하이픈), `nameKo`, `species`(해당 종, 생태 파일 필요), `habitats`(서식지 태그), `links`(연결된 장소 — **양방향**, 자기 자신·없는 장소 금지), `seasons.<계절>`의 `food`·`risk`·`competition` 등급(이름은 `formulas.json` `nodeTiers`의 키, 숫자는 design), `basis`(등급 방향의 출처 · `factCheck` · `note`).
- 시작 장소는 장소 파일이 아니라 종 밸런스 `runStart.node`(design). 그 종의 장소여야 한다.
- `GameData.nodes`: 장소 id → 장소.
- 포식자(`data/predators/<id>.json`, 스키마 `Predator`, #128): `id`(소문자-하이픈 — 사망 원인 `predation:<id>`), `nameKo`, `targets`(`adult` | `nest` — 둥지는 알·새끼), `basis`(출처 · `factCheck` · `note`). 사냥 방식·활동 계절은 쓰는 곳(도감·이벤트 조건)이 생길 때 필드로 더한다. 대응 상성은 이벤트 선택지가 구현한다(01-formulas).
- 이벤트 `deathRisk.predator`는 `data/predators/`의 id여야 한다(포식자 파일이 있을 때 검사).
- `GameData.predators`: 포식자 id → 포식자.
- 도감(`data/codex/<kind>.<이름>.json`, 스키마 `CodexEntry`, #155): 파일 하나에 항목 하나. `id` = `cx.` + 파일 이름(예: `cx.predator.rat-snake`), `kind`(`species` | `predator` | `node` | `phenomenon`), `target`(종·포식자·장소의 id — `id`의 끝과 같다. 현상은 없다), `nameKo`, `scientificName`(종만, 반드시), `body`(본문), `unlock`, `basis`(출처 · `factCheck` · `note`).
- `unlock.on` 잠정(#155 — 해금 조건은 design 몫): `run-start`+`species` · `predator-met`+`predator` · `node-visited`+`node` · `event-seen`+`events`(1개 이상, 그중 하나를 보면).
- `target`과 `unlock`의 id는 실제 데이터(`data/species/` 생태 · `data/predators/` · `data/nodes/` · `data/events/`)에 있어야 한다(교차 검증).
- `GameData.codex`: 도감 id → 항목. `RawGameData.codex`는 선택(화면이 도감을 읽기 전에는 빈 묶음).

### 4.5 화면 문구 — content
- `data/text/<화면>.json`(스키마 `TextFile`, #254): 평평한 `{ "<화면>.<항목>.<용도>": "문구" }`. 키는 camelCase 마디를 점으로 잇고(2마디 이상), **첫 마디 = 파일 이름**(그래서 파일끼리 겹치지 않는다). 문구는 빈 글 금지. 예: `data/text/routine.json`의 `routine.nightRest.label`.
- `GameData.text`: 키 → 문구(모든 파일을 합친 것). `RawGameData.text`는 선택.

---

## 5. 에셋 ID 규칙 — art

형식: `<분류>.<대상>.<변형…>` / 파일: `assets/<분류>/<ID>.<확장자>`

| 분류 | 예시 ID | 비고 |
|---|---|---|
| `bird` | `bird.parus-minor.adult-m.breeding.perch` | 나이·성별: `adult-m` `adult-f` `adult`(암수 구별 없음) `juv` `chick` `egg` / 깃: `breeding` `nonbreeding` / 자세: `perch` `fly` `forage` `nest` |
| `bg` | `bg.forest.spring.day` | 서식지·계절·시간, 새 없이 |
| `pred` | `pred.rat-snake` | |
| `scene` | `scene.parus-minor.fledging` | 핵심 장면 전용 |
| `icon` | `icon.risk` | SVG, 아트가 직접 제작 |
| `ui` | `ui.card-frame` | |
| `app` | `app.icon-512` | |
| `ph` | `ph.bird.parus-minor` | 자리표시 SVG, `assets/placeholder/`에 둔다 |

---

## 6. 저장 형식과 버전

```json
{ "saveVersion": 2, "state": { } }
```
- `serialize`가 만들고 `deserialize`가 읽는다. 화면은 이 문자열을 그대로 보관만 한다(예: `localStorage`).
- `saveVersion`: 저장 형식이 바뀌면 엔진이 올린다. 친구 알파(M3) 전에는 버전이 다르면 `deserialize`가 던지고, 화면이 "새 게임 시작"을 안내하면 충분하다. 알파 이후 형식이 바뀔 때부터 마이그레이션을 제공한다.
- v0 초안의 `gameVersion` 필드는 **뺐다** — 저장 파일에서 읽는 곳이 없다(01-collaboration 15장). 게임 버전은 루트 `version.json`에 있고(PM이 관문 통과 때 올린다, 02-roadmap 5장), 리더보드 기록(7장)에는 클라이언트가 `version.json`에서 읽어 넣는다. 데이터 버전은 따로 두지 않는다.

## 7. 리더보드 기록 — client (서버 설계는 ADR-002)

| 필드 | 설명 |
|---|---|
| `nickname` | 2~12자, 개인정보 금지 |
| `speciesId` | |
| `totalBreeding` | **점수**(총 번식 수) |
| `yearsSurvived`, `generations` | 부가 기록 |
| `mode`, `weeklyId?` | |
| `gameVersion`, `seed` | |
| `actionLog?` | 압축한 선택 기록(P1: 리플레이 검증용) |
| `submittedAt` | |

정렬: `totalBreeding` 내림차순 → 같으면 먼저 제출한 기록이 위.

## 8. 계약 변경 절차

1. 엔진(또는 요청 부서)이 이 문서와 스키마(`packages/schema`)·엔진 타입(`packages/engine/src/types.ts`)을 함께 고치는 PR을 연다. `npm run check`가 통과해야 한다.
2. 영향받는 부서에 `review:*` 라벨.
3. 호환이 깨지는 변경이면 기존 데이터 파일을 새 형식으로 바꾸는 변환 스크립트(`scripts/data/`)를 같은 PR에서 실행해 함께 커밋하고, 전 부서에 `type:task` 공지 이슈를 만든다.
