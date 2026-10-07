# 03 · 이벤트 틀

- 버전: v0.1.2 (2026-10-08, #21 칸 루틴의 `injury` — 걸린 단계 끝에는 줄지 않음) · v0.1.1 (2026-10-08, #21 `injury` 세는 법) · v0.1 (2026-10-04, #7 · #73 `phaseLastStep`)
- 소유: 게임디자인(틀·효과·등급) / 이벤트 글·생태 근거: 생태·콘텐츠 / 해석기: 엔진
- 기준: 기획서 `gdd.md` 3장 원칙 5, 4.3, 6.2, 7.2 / `03-contracts.md` 4.2·4.3 / 스키마 v0(`packages/schema/src/events.ts`, PR #41)
- 숫자: `data/balance/effects.json`(효과 등급표), `data/balance/formulas.json`의 `events.*`(추첨·판정 계수) — PR #48
- **엔진 합의**: #54(`type:decision`)에서 엔진과 합의한다(아래 9장). 합의 전까지 이 문서가 잠정안이다.

## 1. 이 문서가 정하는 것

| 누가 | 무엇을 | 어디에 |
|---|---|---|
| 게임디자인 | 이벤트의 종류, 추첨 규칙, 조건 문법, 효과 종류와 의미, 등급의 숫자 | 이 문서, `effects.json` |
| 생태·콘텐츠 | 개별 이벤트의 상황·글·선택지·생태 근거·출처, 효과는 **등급으로만** | `data/events/<종 또는 common>.json` |
| 엔진 | 조건 해석기, 추첨, 효과 적용, 검증기 | `packages/schema`, `packages/engine` |
| 게임디자인 | 이벤트 PR 리뷰 — 효과 등급이 의도와 맞는지 (`review:design` 필수) | PR |

콘텐츠는 이벤트에 **숫자를 쓰지 않는다.** 디자인은 `effects.json` 한 파일만 바꿔 모든 이벤트의 크기를 조정한다.

---

## 2. 이벤트의 종류

| 종류 | 언제 뽑나 | 선택지 | 결정으로 세나 |
|---|---|---|---|
| **단계 이벤트** (`draw: "step"`, 기본값) | 한 단계의 판정 3(위험)을 살아남은 뒤 (`00-core-loop` 3장) | 2~3개 | 예 |
| **환경 카드** (`draw: "periodStart"`) | 시기가 시작될 때. 그 시기의 환경 카드에 함께 보인다(gdd 4.3 1번) | 대개 1개(알림). 2개 이상이면 선택 | 선택지가 2개 이상일 때만 |

- 선택지가 1개인 이벤트(알림)는 결정이 아니다(`00-core-loop` 5.1). 버튼은 "확인" 하나.
- 환경 카드는 해거리·한파·장마·포식자 출현처럼 **그 시기 전체에 걸리는** 사건이다. 주로 `riskMod`·`foodMod`를 쓴다.
- 세대를 넘는 환경 변화(천이·매립 등, gdd 9장)는 이 틀이 아니라 `08-environment`(M5)가 맡는다.
- 짧은 미니게임(gdd 4.3 6번 — 다친 척 유인 등)은 M0·M1 범위가 아니다. 필요해지면 이 문서에 종류를 더한다.

---

## 3. 추첨

### 3.1 단계 이벤트

판정 3을 살아남은 단계에서 **한 번만**:

```
1. u₁ < events.chancePerStep 이 아니면 → 이벤트 없음
2. 후보 = 아래를 모두 만족하는 이벤트
     - draw가 "step"
     - species에 조작 개체의 종이 있다
     - when의 모든 조건이 참 (4장)
     - 마지막으로 나온 뒤 events.cooldownSteps 단계가 지났다 (런 안에서 한 번도 안 나왔으면 통과)
3. 후보가 없으면 → 이벤트 없음
4. 가중치 effects.eventWeight[weight] 비례로 하나를 u₂로 뽑는다
```

- 한 단계에 이벤트는 최대 1개.
- 난수를 쓰는 순서(u₁ → u₂ → 선택지 판정 → 효과 판정)는 고정한다. 결정론(QA T1)이 이 순서에 달려 있다. 후보가 없어 3에서 끝나도 u₁은 이미 쓴 것이다.

### 3.2 환경 카드

시기가 시작될 때(`PeriodStart`) 한 번:

```
u < events.envChancePerPeriod 이면, draw가 "periodStart"인 후보 중에서 3.1의 2~4와 같이 하나를 뽑는다
```

- 시기당 최대 1장.

### 예시 (입력 → 출력)

| 입력 | 출력 |
|---|---|
| u₁ = 0.35 | 0.35 ≥ 0.2 → **이벤트 없음** |
| u₁ = 0.1, 후보 A(common), B(uncommon), C(rare) | 가중치 10 : 4 : 1 → A가 뽑힐 확률 **10/15 ≈ 0.667** |
| u₁ = 0.1, 후보 A만 있는데 A가 5단계 전에 나왔다 | 쿨다운 12 미만 → 후보 없음 → **이벤트 없음** |

---

## 4. 조건 문법 (`when`)

- 모든 필드는 **선택**이고, 적힌 조건은 **모두 참**이어야 한다(AND). 비어 있으면 늘 참.
- OR가 필요하면 `…Any` 배열을 쓴다. 그 외의 논리식(OR·NOT 조합, 이전 이벤트 연결)은 **두지 않는다**. 필요한 이벤트가 생기면 이 문서에 필드를 더한다(`01-collaboration` 15장).

| 필드 | 형식 | 참이 되는 때 | 예 |
|---|---|---|---|
| `phaseAny` | 국면 이름 배열 | 지금 국면이 배열에 있다 (`00-core-loop` 2.2) | `["nestling"]` |
| `phaseLastStep` | 불 | 지금 단계가 그 국면이 이어지는 **마지막 단계**다 / 아니다 (`00-core-loop` 4.7, #73) | 육추 후기: `true` |
| `habitatAny` | 서식지 태그 배열 | 지금 장소의 서식지 태그 중 하나가 배열에 있다(`data/nodes/`) | `["forest"]` |
| `periodFrom` `periodTo` | 1~24 | `periodFrom ≤ 지금 시기 ≤ periodTo`. **from > to면 해를 넘긴다** | `23`~`4` = 23·24·1·2·3·4 |
| `sex` | `"female"` `"male"` | 조작 개체의 성별 | 박새 포란 중 암컷 |
| `ageMin` `ageMax` | 정수 | `ageMin ≤ 나이 ≤ ageMax` | 첫 겨울: `ageMax: 0` |
| `hasMate` | 불 | 살아 있는 짝이 있다 / 없다 | |
| `hasBrood` | 불 | 살아 있는 알·새끼가 있다 / 없다 | |
| `energyBelow` | 0~1 | `에너지 / 지방 상한 < 값` | 굶주린 상태: `0.3` |
| `actionAny` | 행동 id 배열 | 이 단계에 고른 행동이 배열에 있다 | `["forage", "explore"]` |

- 스키마 v0의 `phase`(문자열 하나)는 **`phaseAny`(배열)로 바꾼다.** `habitatAny`와 모양을 맞추고, 여러 국면에 걸친 이벤트를 복사하지 않기 위해서다. 아직 이벤트 파일이 없어 옮길 데이터가 없다.

| 예시 조건 | 상태 | 결과 |
|---|---|---|
| `{ "phaseAny": ["winter"], "ageMax": 0 }` | `winter`, 나이 0 | **참** |
| 같은 조건 | `winter`, 나이 1 | **거짓** |
| `{ "periodFrom": 23, "periodTo": 4 }` | `period 2` | **참** |
| 같은 조건 | `period 10` | **거짓** |
| `{ "hasBrood": true, "energyBelow": 0.3 }` | 새끼 있음, 에너지 15/67 = 0.22 | **참** |

---

## 5. 선택지

선택지는 두 가지 모양 중 하나다.

### 5.1 고정 효과

```json
{ "id": "stay-away", "text": "몸을 낮추고 멀리서 지켜본다", "effects": [ … ] }
```

### 5.2 판정형 — 스탯으로 성공 확률이 정해진다

```json
{
  "id": "mob",
  "text": "짝과 함께 둥지 주변을 날며 경보음을 낸다",
  "check": { "stat": "vigilance", "difficulty": "medium" },
  "onSuccess": [ … ],
  "onFail": [ … ]
}
```

```
성공 확률 = clamp(events.checkBase + events.checkPerPoint × (스탯 − effects.checkDifficulty[difficulty]),
                  events.checkMin, events.checkMax)
u < 성공 확률 → onSuccess, 아니면 onFail
```

- 기획서 6.2의 **"포식자 상성 대응 성공 시 크게 감소"**와 원칙 5 **"확률을 보여주고 고르게 한다"**를 구현하는 곳이다. 훈련한 스탯이 이벤트에서 보상으로 돌아온다.
- 판정에 쓰는 스탯은 조작 개체의 **현재값**. 그 종에 없는 스탯(박새의 `navigation`)은 쓸 수 없다(검증기가 막는다).

| 예시 입력 | 성공 확률 |
|---|---|
| 경계 70, `medium`(50) | `0.6 + 0.015 × 20` = **0.90** |
| 경계 46, `medium` | `0.6 − 0.06` = **0.54** |
| 비행 30, `high`(70) | `0.0` → **0.10** (하한 — 늘 기회가 있다) |
| 경계 95, `low`(30) | `1.575` → **0.95** (상한 — 늘 실패할 수 있다) |

### 5.3 선택지 화면 표시

- 고정 효과: 효과마다 **실제 숫자**로 보여준다. 예: "에너지 −12", "사망 위험 3%", "둥지를 잃을 위험 30%".
- 판정형: **성공 확률을 정수 %**로, 그리고 성공·실패 각각의 효과를 보여준다. 예: "경계 판정 90% — 성공: 둥지 손실 위험 10% / 실패: 사망 위험 1%, 둥지 손실 위험 60%".
- 확률 표시 형식은 `01-formulas` 7.1. 보여준 확률은 실제 판정 확률과 같다(정직한 확률).
- 글(`text`)에는 숫자를 쓰지 않는다. 숫자는 화면이 등급표에서 계산해 붙인다.

---

## 6. 효과

### 6.1 효과 종류

| type | 필드 | 등급 | 하는 일 | 대상 |
|---|---|---|---|---|
| `energy` | `tier` `sign` | small·medium·large | `sign: gain`이면 +값, `loss`면 −값. 지방 상한으로 자르고, **0 이하가 되면 아사**(`00-core-loop` B-1) | 조작 개체 |
| `feather` | `tier` `sign` | small·medium·large | ±값, 0~`feather.max`로 자름 | 조작 개체 |
| `statGain` | `stat` `tier` | small·medium·large | `01-formulas` 1.3의 공식으로 상승(등급 값이 기본 상승) | 조작 개체 |
| `bond` | `tier` `sign` | small·medium·large | 짝 유대 ±값, 0~100으로 자름 | 짝 |
| `injury` | `tier` | small·medium·large | 값 = 부상 배율(`risk.injuryMult`)을 받는 **위험 판정 수**. 판정 3을 받은 단계가 끝날 때마다 1 줄고 0이면 낫는다 — 단계 이벤트(판정 뒤)는 다음 단계부터, 환경 카드(판정 전)는 그 단계부터 센다. 루틴(칸) 중에 걸린 단계 이벤트의 부상은 **그 단계의 남은 칸 판정에도 배율이 붙지만 그 단계 끝에는 줄지 않는다**(몇 번째 칸이든 같다, #21). 이미 부상이면 남은 값과 새 값 중 큰 쪽 | 조작 개체 |
| `deathRisk` | `tier` `cause` (+`predator`) | low·medium·high | 그 자리에서 1회 사망 판정: `u < 값`이면 사망, 원인 `cause` | 조작 개체 |
| `broodRisk` | `tier` | low·medium·high | 그 자리에서 1회 둥지 판정: `u < 값`이면 알·새끼 전멸(`00-core-loop` B-5) | 둥지 |
| `chickLoss` | `tier` | small·medium·large | 살아 있는 새끼 수 × 값을 **올림**한 만큼 사망(1마리 이상). 전부 죽으면 전멸 | 새끼 |
| `riskMod` | `tier` | low·medium·high | **그 시기가 끝날 때까지** 위험에 `× (1 + 값)`. 여러 개면 곱한다 | 조작 개체의 사망 위험(`01-formulas` 3.1) · 둥지 손실(3.2) |
| `foodMod` | `tier` `sign` | small·medium·large | **그 시기가 끝날 때까지** 섭취에 `× (1 + 값)`(gain) 또는 `× (1 − 값)`(loss). 여러 개면 곱한다 | 조작 개체의 섭취(`01-formulas` 2.3) · 짝 r(`04-breeding` 3.3) |
| `fledgeEarly` | — | — | 새끼가 **지금** 둥지를 떠난다(이소). 은수저 지수는 지금까지(이 단계 포함)의 평균으로 확정하고, 다음 단계부터 `postFledge`. 육추의 마지막 단계에서만 쓸 수 있어(6.2) 국면 길이는 바뀌지 않는다 — 이 효과의 무게는 "둥지 전체를 걸지 않고 새끼 일부만 잃는 탈출"(7.2)에 있다 | 새끼 |

- `sign`이 있는 효과는 **`sign`이 필수**다(#37 결정 A).
- `deathRisk.cause`는 **필수**이고 `cold` `accident` `disease` `predation` 중 하나다(`00-core-loop` 8장). `predation`이면 `predator`(`data/predators/`의 id)를 적을 수 있고, 로그에는 `predation:<predator>`로 남는다.
- **적용 순서**: 배열 순서대로. 중간에 조작 개체가 죽으면 남은 효과는 버린다.

| 예시 입력 | 출력 |
|---|---|
| 에너지 20, `energy medium loss` | **8** |
| 에너지 10, `energy large loss` | `−15` → 0 → **아사** |
| 새끼 7, `chickLoss medium` | `ceil(7 × 0.3)` = **3마리 사망**, 4마리 남음 |
| 새끼 1, `chickLoss small` | `ceil(0.15)` = 1 → **전멸** → B-5 |
| 단계 k(판정 3 뒤)에 `injury small`(2) | 단계 k+1·k+2의 판정에 × `injuryMult`, k+3부터 정상 |
| 단계 k의 6칸 중 3번째 칸 이벤트로 `injury small`(2) | 단계 k의 4~6번째 칸 + 단계 k+1·k+2의 판정에 × `injuryMult`, k+3부터 정상 |
| `foodMod medium loss` 두 번 | 섭취 × `0.7 × 0.7` = **× 0.49** (그 시기 끝까지) |
| `riskMod high` | 위험 **× 2.0** (그 시기 끝까지) |

### 6.2 효과가 성립하려면 — 검증기가 확인할 것

이 규칙을 어긴 이벤트는 **데이터 검증에서 실패**해야 한다. 런 도중에 "대상이 없는 효과"를 만나지 않게 하기 위해서다.

| 효과 | 이벤트의 `when`이 보장해야 하는 것 |
|---|---|
| `bond` | `hasMate: true` |
| `broodRisk` `chickLoss` | `hasBrood: true` |
| `fledgeEarly` | `phaseAny`가 `["nestling"]`뿐 **그리고** `phaseLastStep: true` (#73) |
| `statGain`, 선택지 `check.stat` | 이벤트의 모든 `species`에 그 스탯이 있다(종 밸런스 파일의 `aptitude`) |
| 선택지 수 | `draw: "step"`이면 2~3개, `draw: "periodStart"`면 1~3개 |

---

## 7. 이벤트 파일 형식과 작성 예시

### 7.1 필드

스키마 v0(`GameEvent`)에 아래를 더하고 바꾼다.

| 필드 | 필수 | 변경 |
|---|---|---|
| `id` `species` `weight` `title` `body` `ecologyBasis` `sources` `factCheck` | 예 | 그대로 |
| `draw` | 아니오 (기본 `"step"`) | **추가** |
| `when` | 예 (빈 객체 가능) | 4장의 필드로 **확장**, `phase` → `phaseAny` |
| `options[]` | 예 | 5장의 두 모양 중 하나 — `effects` 또는 `check`+`onSuccess`+`onFail` |
| `options[].effects[]` 등 | | 6장의 효과 종류로 **확장** |

### 7.2 작성 예시 — 박새, 둥지의 뱀

생태 사실과 글은 콘텐츠의 것을 빌려 왔다(`03-contracts` 4.3 예시, 출처 SRC-001). **디자인이 보여 주는 것은 틀과 효과 등급의 쓰임새다.** 최종 글은 콘텐츠가 쓴다.

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
      "onSuccess": [
        { "type": "broodRisk", "tier": "low" },
        { "type": "bond", "tier": "small", "sign": "gain" }
      ],
      "onFail": [
        { "type": "deathRisk", "tier": "low", "cause": "predation", "predator": "rat-snake" },
        { "type": "broodRisk", "tier": "high" }
      ]
    },
    {
      "id": "signal-flee",
      "text": "새끼들이 둥지를 빠져나가도록 경보를 이어 간다",
      "effects": [
        { "type": "fledgeEarly" },
        { "type": "chickLoss", "tier": "small" }
      ]
    },
    {
      "id": "stay-away",
      "text": "몸을 낮추고 멀리서 지켜본다",
      "effects": [
        { "type": "broodRisk", "tier": "high" }
      ]
    }
  ],
  "ecologyBasis": "박새는 뱀에게 다른 포식자와 구별되는 경보음을 내며, 이를 들은 새끼는 둥지 구멍 밖으로 빠져나간다.",
  "sources": ["SRC-001"],
  "factCheck": "verified"
}
```

이 예시가 의도한 긴장 (디자인 리뷰가 보는 것)

| 선택지 | 무엇을 거는가 | 경계 70인 플레이어에게 |
|---|---|---|
| `mob` 맞서기 | 내 목숨 약간 + 판정 운 | 성공 90%: 둥지 손실 10% + 유대↑ / 실패 10%: 사망 1%, 둥지 손실 60% |
| `signal-flee` 탈출 | 새끼 일부 + 덜 자란 새끼(은수저 조기 확정) | 둥지 손실 없음, 새끼 15% 손실(최소 1마리) |
| `stay-away` 지켜보기 | 둥지 전체 | 둥지 손실 60%, 내 위험 없음 |

- 경계가 높으면 맞서기가 좋아지고, 낮으면(경계 46 → 성공 54%) 탈출이 낫다 — **스탯 육성이 선택을 바꾼다.** 어느 선택지도 늘 최선이 아니다.

---

## 8. 콘텐츠 작성 규칙 (디자인 리뷰 기준)

이벤트 PR의 `review:design`은 아래를 본다.

1. **지배 선택지 금지.** 모든 선택지에 대가가 있다. 하나가 모든 면에서 낫다면 수정 요청.
2. 단계 이벤트의 선택지는 **2~3개**.
3. 효과는 **등급으로만**. 글에 숫자를 쓰지 않는다.
4. 등급의 크기 감각 (v0 숫자, 박새 기준)

| 등급 | 크기 | 쓰는 곳 |
|---|---|---|
| `energy small` (5) | 보통 장소 채식 한 단계 섭취의 절반쯤 | 작은 손해·이득 |
| `energy medium` (12) | 좋은 채식 한 단계 | 보통 |
| `energy large` (25) | 지방 상한의 약 40% | 한파·큰 사고. 드물게 |
| `deathRisk low` (1%) | 평범한 단계 위험의 2~3배 | 맞서기의 실패, 위험한 탐색 |
| `deathRisk medium` (3%) | | 맹금 습격 등 |
| `deathRisk high` (8%) | 평범한 단계 약 20개분 | **`rare` 이벤트에만** |
| `broodRisk low` / `medium` / `high` | 10% / 30% / 60% | 방어 성공 / 애매 / 둥지 방치 |

5. **짝의 거절은 파국이 아니다**(gdd 7.2 [확정]). 짝과의 갈등을 다루는 이벤트에 `broodRisk` 큰 등급이나 이별을 넣지 않는다.
6. **포식자는 악당이 아니다**(gdd 12장). 글에서 포식자를 탓하지 않는다 — 콘텐츠 문체 가이드를 따른다.
7. `deathRisk`에는 `cause`를, 포식이면 가능한 한 `predator`를 적는다.
8. 6.2의 성립 조건을 `when`에 적는다.
9. 생태 근거·출처·`factCheck`는 콘텐츠의 규칙을 따른다. `needs-review` 이벤트는 출시 빌드에서 빠진다(`03-contracts` 4.3).

---

## 9. 엔진과 합의할 것

#54에서 다룬다. 결정자는 게임디자인(데이터 필드의 의미는 소유 부서가 정한다, `03-contracts` 2장), 엔진은 해석기·검증기를 이대로 구현할 수 있는지 의견을 단다.

| # | 항목 | 이 문서 |
|---|---|---|
| 1 | `when` 필드 확장, `phase` → `phaseAny` | 4장 |
| 2 | `draw` 필드 | 2장 |
| 3 | 판정형 선택지(`check` `onSuccess` `onFail`) | 5.2 |
| 4 | 효과 종류 확장, `deathRisk.cause` 필수, `predator` | 6.1 |
| 5 | 효과 성립 조건의 검증 | 6.2 |
| 6 | 추첨 순서와 난수 소비 순서 고정 | 3장 |
| 7 | `EffectsTable`에 `chickLoss` `bond` `injury` `riskMod` `foodMod` `checkDifficulty` 추가 | PR #48 |
| 8 | `when.phaseLastStep` 추가, `fledgeEarly` 성립 조건에 포함 (#73) | 4장 · 6.2 |

## 10. 남은 것

| 무엇 | 어디서 | 언제 |
|---|---|---|
| 박새 이벤트 컨셉 40개 | `docs/design/event-concepts/parus-minor.md` | M1 (#22) |
| 계절 방침의 보정 | `04-breeding.md` | M1 |
| 미니게임형 이벤트 | 이 문서 | 필요해질 때 |
| 세대를 넘는 환경 변화 | `08-environment.md` | M5 |
