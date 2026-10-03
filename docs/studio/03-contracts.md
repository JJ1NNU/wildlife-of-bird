# 모듈 경계 · 소유권 · 인터페이스 계약

> 관리: 엔진. 상태: **초안 v0** — 엔진이 M0에 v1로 확정한다(데이터 필드의 의미는 디자인·콘텐츠와 `type:decision`으로 합의).
> 아래의 파일 경로·함수 이름은 ADR-001(기술 스택) 결정에 맞춰 바뀔 수 있다. 원칙(1장)과 소유권(2장)은 유지한다.

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
| 루트 설정·잠금 파일(패키지 매니저·tsconfig·린트 등) | engine | 의존성을 추가하는 부서는 잠금 파일 변경을 포함해 `review:engine` |
| `version.json` `CHANGELOG.md` `README.md` `docs/README.md` `.gitignore` | pm | |
| `.github/workflows/ci.yml` | engine | 검사 |
| `.github/workflows/deploy.yml` | client | 배포 |
| `.github/ISSUE_TEMPLATE/` `.github/pull_request_template.md` | pm | |
| `CLAUDE.md` | pm (명령어·저장소 지도 섹션은 engine) | |

**데이터 필드의 의미**는 그 데이터 파일의 소유 부서가 정의하고, 엔진은 그 의미대로 타입·검증기를 만든다.

---

## 3. 엔진 API (초안)

```ts
// 모든 함수는 순수 함수다. data = 검증된 게임 데이터 묶음(GameData).

newRun(config: RunConfig, data: GameData): RunState
getChoices(state: RunState, data: GameData): Choice[]               // 지금 고를 수 있는 모든 선택
preview(state: RunState, choiceId: string, data: GameData): Preview // 난수를 쓰지 않는다
act(state: RunState, choiceId: string, data: GameData): { state: RunState; log: LogEntry[] }
getView(state: RunState, data: GameData): ViewModel                 // 화면이 그대로 그리는 형태
serialize(state: RunState): string
deserialize(text: string, data: GameData): RunState                 // 버전 확인·마이그레이션
```

```ts
interface RunConfig {
  speciesId: string           // 예: "parus-minor"
  seed: string
  startSex?: 'female' | 'male'
  mode: 'free' | 'weekly'
  weeklyId?: string           // 주간 시드 모드일 때
}

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
  energyDelta: [number, number]  // 예상 범위
  statGains?: Record<string, number>
  mateAcceptance?: number        // 짝 지시 수락률
  notes: string[]                // "배가 고파 위험한 곳을 골랐다" 같은 설명
}

interface LogEntry {
  at: { year: number; period: number; step: number }  // period: 1~24 (1 = 1월 상반)
  type: string                                        // 'event' | 'death' | 'breeding' | ...
  text: string
  deltas?: Record<string, number>
  cause?: string                                      // 사망·실패 원인 (QA 분석용)
}
```

필수 성질
- `RunState` 안에 난수 상태, 달력(년·시기·단계), 플레이어 개체, 짝, 새끼, 가계도, 세계 상태(장소·환경), 점수(`totalBreeding`), 게임 오버 여부가 있다.
- `getView`는 화면에 필요한 모든 것을 준다. 부족하면 클라이언트가 엔진에 이슈로 요청한다.
- 시뮬레이터는 같은 API를 쓴다: `봇.choose(view, choices, previews) → choiceId`.

---

## 4. 데이터 계약 (예시 형식 — 값은 예시)

### 4.1 종: 생태 사실(content)과 밸런스(design)의 분리

`data/species/parus-minor.ecology.json` — content
```json
{
  "id": "parus-minor",
  "nameKo": "박새",
  "scientificName": "Parus minor",
  "residency": "resident",
  "habitats": ["forest", "woodland-edge"],
  "breeding": {
    "season": { "fromPeriod": 7, "toPeriod": 14 },
    "clutchSize": { "min": 4, "max": 13, "typicalMin": 7, "typicalMax": 10 },
    "broodsPerYearMax": 2,
    "incubationBy": "female",
    "nestType": "cavity"
  },
  "sources": ["SRC-004"],
  "factCheck": "verified"
}
```

`data/balance/species/parus-minor.json` — design
```json
{
  "speciesId": "parus-minor",
  "targets": { "avgRunYears": 4.5, "expectedTotalBreeding": 4.0 },
  "nestSuccessBase": 0.55,
  "secondBrood": { "energyCost": "large", "moltDelayPeriods": 2 },
  "agingStartAge": 3,
  "aptitude": { "flight": "C", "foraging": "A", "vigilance": "A", "stamina": "D", "display": "B", "social": "A" }
}
```

### 4.2 효과 등급표 — design

`data/balance/effects.json`
```json
{
  "energy":     { "small": 5, "medium": 12, "large": 25 },
  "feather":    { "small": 5, "medium": 10, "large": 20 },
  "deathRisk":  { "low": 0.01, "medium": 0.03, "high": 0.08 },
  "broodRisk":  { "low": 0.1, "medium": 0.3, "high": 0.6 },
  "statGain":   { "small": 1, "medium": 3, "large": 6 },
  "eventWeight":{ "common": 10, "uncommon": 4, "rare": 1 }
}
```
콘텐츠는 이벤트에 숫자 대신 등급을 쓰고, 디자인은 이 표만 바꿔 전체 밸런스를 조정한다. 새 효과 종류는 디자인이 추가하고 엔진이 해석기를 구현한다.

### 4.3 이벤트 — content (design 리뷰)

`data/events/parus-minor.json` 안의 한 항목
```json
{
  "id": "ev.parus-minor.snake-at-nest",
  "species": ["parus-minor"],
  "when": { "phase": "nestling", "habitatAny": ["forest"] },
  "weight": "uncommon",
  "title": "둥지 아래의 소리",
  "body": "둥지 구멍 아래 나무껍질을 무언가 천천히 긁으며 올라온다. 짝이 날카로운 경보음을 연달아 낸다.",
  "options": [
    {
      "id": "mob",
      "text": "짝과 함께 둥지 주변을 날며 경보음을 낸다",
      "effects": [{ "type": "deathRisk", "tier": "low" }, { "type": "broodRisk", "tier": "medium" }]
    },
    {
      "id": "signal-flee",
      "text": "새끼들이 둥지를 빠져나가도록 경보를 이어 간다",
      "effects": [{ "type": "fledgeEarly" }]
    }
  ],
  "ecologyBasis": "박새는 뱀에게 다른 포식자와 구별되는 경보음을 내며, 이를 들은 새끼는 둥지 구멍 밖으로 빠져나간다.",
  "sources": ["SRC-001"],
  "factCheck": "verified"
}
```
- 글은 v1에서 데이터 파일에 한국어로 직접 쓴다(다국어는 P2).
- `factCheck`: `verified` | `needs-review`. `needs-review` 항목은 출시 빌드에서 제외하거나 출시 전 해결(QA 출시 체크리스트).

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
{ "saveVersion": 1, "gameVersion": "0.1.0", "state": { } }
```
- `gameVersion`: 루트 `version.json`의 값. PM이 관문 통과 때 `0.<M번호>.0`으로 올린다(02-roadmap 5장). 데이터 버전은 따로 두지 않는다.
- `saveVersion`: 저장 형식이 바뀌면 엔진이 올린다. 친구 알파(M3) 전에는 버전이 다르면 "새 게임 시작" 안내로 충분하고, 알파 이후 형식이 바뀔 때부터 마이그레이션을 제공한다.

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

1. 엔진(또는 요청 부서)이 이 문서와 스키마를 함께 고치는 PR을 연다.
2. 영향받는 부서에 `review:*` 라벨.
3. 호환이 깨지는 변경이면 기존 데이터 파일을 새 형식으로 바꾸는 변환 스크립트(`scripts/data/`)를 같은 PR에서 실행해 함께 커밋하고, 전 부서에 `type:task` 공지 이슈를 만든다.
