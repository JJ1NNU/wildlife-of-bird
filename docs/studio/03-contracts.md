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
| `data/calendar/` | design | 종별 연간 단계표(시기 → 단계, 단계별 가능한 행동·이벤트 풀·결정) |
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
      | 'mateCandidate' | 'mateOrder' | 'clutchSize' | 'parentingPolicy'
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
  type: string                   // 'action' | 'event' | 'death' | 'breeding' | ...
  text: string
  deltas?: Record<string, number>
  cause?: string                 // 사망·실패 원인 (QA 분석용)
}

interface ViewModel {
  at: CalendarAt
  speciesId: string
  player: Bird                   // 종 · 성별 · 나이 · 에너지 · 스탯
  totalBreeding: number          // 점수
  gameOver: boolean
  recentLog: LogEntry[]          // 최근 20건 — 이야기 피드
}
```

`StatName` = `flight` `foraging` `vigilance` `stamina` `display` `social` `navigation` (gdd 5.1장).

### 필수 성질
- **결정론**: 난수 상태(`RunState.rng`, 32비트 정수)가 상태 안에 있다. `Math.random`·현재 시간 사용 금지. 테스트가 지킨다.
- `RunState` 안에는 지금 난수 상태, 달력, 플레이어 개체, 점수(`totalBreeding`), 게임 오버 여부, 판정 기록(`log`)이 있다. **짝 · 새끼 · 가계도 · 세계 상태(장소·환경)는 디자인 상태 기계 명세(#5)와 함께 M1에 더한다.** 화면·봇은 `RunState`를 직접 읽지 않고 `getView`만 쓴다 — 그래서 `RunState` 내부가 바뀌어도 화면·봇이 깨지지 않는다.
- `getView`는 화면에 필요한 모든 것을 준다. 부족하면 클라이언트가 `dept:engine` 이슈로 요청한다. `ViewModel`에 필드를 **더하는** 것은 깨지지 않는 변경이다.
- 고를 수 없는 `choiceId`를 `preview`·`act`에 넘기면 던진다.

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

### M0의 상태
형은 확정이고 속은 자리표시다. 결정론 · 저장/불러오기 왕복만 실제로 보장한다. 실제 규칙은 M1(#21).

---

## 4. 데이터 계약 — `@wb/schema` (값은 예시)

- 검증: `npm run validate:data` — CI에서도 돈다. 실패하면 **파일 · 파일 안의 위치 · 이유**를 알려 준다.
- 스키마가 담은 형식: 4.1 · 4.2 · 4.3 · 4.3.1. 4.4(장소·포식자·도감)와 `data/calendar/` `data/titles/` `data/text/`는 소유 부서가 **첫 파일을 올릴 때** 엔진이 형식을 확정해 스키마에 더한다(미리 만들지 않는다).
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
  "lifespan": { "sources": [], "factCheck": "needs-review", "note": "출처를 찾지 못해 값을 비웠다. 찾아볼 곳: ..." },
  "alarmCalls": { "values": [ { "id": "jar", "predatorType": "snake", "...": "...", "sources": ["SRC-001"], "factCheck": "verified" } ] },
  "sources": ["SRC-001", "SRC-004", "SRC-005"],
  "factCheck": "needs-review"
}
```
- **사실마다 출처를 붙인다** (#56 결정 — 한 파일 안에서도 사실마다 출처 등급이 다르다). 사실 하나 = 값 + `sources` · `factCheck`(`verified` | `needs-review`) · `note?`. 값의 모양은 셋 중 하나: 하나의 값 `value` / 목록 `values` / 여러 필드(`min`·`max` 등)를 그대로. 스키마 `fact()`.
- `verified`인 사실은 출처가 1개 이상 있어야 한다.
- 값을 아직 못 찾은 사실은 값 없이 `needs-review`와 `note`(찾아볼 곳)만 둔다 — 지금은 `lifespan`. 스키마 `UnresolvedFact`.
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
  "secondBrood": { "layByPeriod": 13, "energyCost": "large", "moltDelayPeriods": 2 }
}
```
- `speciesId`의 생태 파일이 있어야 한다(교차 검증).
- `seasons`: 1~24가 **정확히 한 번씩** 나와야 한다(검증).
- `aptitude`는 종에 해당하는 스탯만(예: `navigation`은 철새만), 등급 `S`~`D`. 쓰는 등급마다 `formulas.json`의 `stats.aptitudeMean`·`aptitudeGrowth`에 계수가 있어야 한다(교차 검증).
- `secondBrood`는 2차 번식이 있는 종만 쓴다(선택). v0의 `nestSuccessBase`는 `targets.firstBroodSuccess`(목표)와 `nestLossPerStep`(계수)로 나뉘었다(#54).

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
  "when": { "phaseAny": ["nestling"], "habitatAny": ["forest"], "hasBrood": true, "hasMate": true },
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
- `when`(모두 선택, 모두 참이어야 함): `phaseAny` `habitatAny` `periodFrom`·`periodTo`(함께, from > to면 해를 넘김) `sex` `ageMin` `ageMax` `hasMate` `hasBrood` `energyBelow`(0~1) `actionAny`. v0의 `phase`는 `phaseAny`로 바뀌었다(#54).
- 선택지 두 모양: 고정 효과 `{ id, text, effects }` / 판정형 `{ id, text, check: { stat, difficulty }, onSuccess, onFail }`. 섞어 쓸 수 없다.
- 효과 종류: `energy` `feather` `bond` `foodMod`(등급 + **`sign` 필수**: `gain` | `loss`, #37), `statGain`(`stat` + 등급), `chickLoss` `injury`(등급), `deathRisk`(위험 등급 + **`cause` 필수**: `cold` `accident` `disease` `predation`, `predation`이면 `predator` 선택), `broodRisk` `riskMod`(위험 등급), `fledgeEarly`.
- **성립 조건 검증** (03-events 6.2): `bond` → `when.hasMate: true` / `broodRisk`·`chickLoss` → `when.hasBrood: true` / `fledgeEarly` → `when.phaseAny`가 `["nestling"]`뿐 / `statGain`·`check.stat` → 이벤트의 모든 종의 `aptitude`에 그 스탯 / 선택지 수: `step` 2~3개, `periodStart` 1~3개.
- 글은 v1에서 데이터 파일에 한국어로 직접 쓴다(다국어는 P2).
- `factCheck`: `verified` | `needs-review`. `needs-review` 항목은 출시 빌드에서 제외하거나 출시 전 해결(QA 출시 체크리스트).

### 4.3.1 공식 계수 — design

`data/balance/formulas.json` · 스키마 `Formulas` · 의미: `docs/design/specs/01-formulas.md` 전체.
- 종 공통 계수. 최상위 키: `stats` `actions` `nodeTiers` `energy` `feather` `risk` `brood` `mate` `heredity` `silverSpoon` `aging` `display` `events`.
- **키 하나하나 엄격히** 검사한다 — 오타 난 키가 조용히 기본값으로 빠지면 밸런스 버그를 찾기 어렵다(#54). 키를 더하거나 바꾸면 스키마를 같은 PR에서 고친다(`review:engine`).
- 행동 id는 `forage` `rest` `train` `social` `explore` `move`로 고정이다 — 행동마다 엔진 로직이 따로 있기 때문이다.

### 4.4 장소·포식자·도감 — content
- 장소(`data/nodes/`): `id`, 이름, 서식지 태그, 계절별 먹이·위험 기본 등급(등급의 숫자는 design), 연결된 장소, 해당 종.
- 포식자(`data/predators/`): `id`, 이름, 노리는 대상(성조·둥지·새끼), 사냥 방식, 대응 상성, 활동 계절·시간, 출처.
- 도감(`data/codex/`): `id`, 분류(종·포식자·장소·현상), 본문, 해금 조건, 출처.

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
{ "saveVersion": 1, "state": { } }
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
