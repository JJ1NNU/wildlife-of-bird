# 01 · 공식 v0

- 버전: v0 (2026-10-03, #6)
- 소유: 게임디자인 / 구현: 엔진 / 검증: QA
- 기준: 기획서 `gdd.md` 5.1·5.4·5.5·6·7.2장
- 숫자: `data/balance/formulas.json`(공통), `data/balance/species/parus-minor.json`(박새), `data/balance/effects.json`(이벤트 효과 등급)

## 0. 읽는 법

- 본문의 `energy.capBase` 같은 이름은 **`data/balance/formulas.json`의 키 경로**다. `species.` 으로 시작하면 종 파일(`data/balance/species/<종>.json`)의 키다.
- 이 문서에는 숫자를 적지 않는다. **예시의 숫자만** 예외다 — 예시는 이 PR 시점의 데이터 값으로 계산했고, 엔진·QA는 예시를 테스트로 쓸 때 **데이터 파일에서 값을 읽어** 같은 결과가 나오는지 본다. 데이터를 바꾸면 예시도 같은 PR에서 다시 계산한다.
- v0의 모든 숫자는 [초안]이다. 봇 시뮬레이션(M1~M2) 전까지는 "말이 되는 크기"로만 맞췄다(9장).
- 계산 순서는 `00-core-loop.md` 3.1의 **에너지 → 스탯 → 위험**이다.

### 수의 규칙 (모든 공식 공통)

| 규칙 | 내용 |
|---|---|
| 내부 표현 | 실수(소수). 에너지·스탯·깃털·확률 모두 반올림하지 않고 저장한다 |
| 반올림 | **화면 표시에서만** 한다. 방식은 반올림(0.5는 올림). 7장 |
| 정직한 확률 | 화면에 보여준 확률은 실제 판정에 쓰는 확률과 같다. 표시 반올림 외의 숨은 보정 금지 (gdd 3장 원칙 5) |
| 난수 | 엔진의 시드 고정 난수 하나만 쓴다. `preview()`는 난수를 쓰지 않는다 |
| 확률 판정 | `난수 u ∈ [0, 1)`, `u < p`이면 사건 발생 |
| 자르기 | `clamp(x, a, b)` = `min(b, max(a, x))` |

---

## 1. 스탯

### 1.1 범위와 등급

- 스탯 6종: `flight`(비행) `foraging`(채식) `vigilance`(경계) `stamina`(체력) `display`(과시) `social`(사회). 항법(`navigation`)은 박새에 없다 — M4에서 추가.
- 범위 `stats.min`~`stats.max`. 각 스탯에는 **현재값**과 **잠재력**(상한)이 있다. 현재값은 잠재력을 넘지 않는다.
- 화면 등급: `stats.grades`의 표. 값이 `from` 이상인 가장 높은 등급.

| 예시 입력 | 출력 |
|---|---|
| 69.9 | `B` |
| 70 | `A` |
| 0 | `G` |

### 1.2 종 적성

종 파일의 `species.aptitude`가 스탯별 적성(A~D)을 준다. 적성은 두 곳에 쓰인다.

- 그 종의 **평균 잠재력**: `stats.aptitudeMean[적성]` — 유전 공식의 '종 평균'(5장)
- **성장 배율**: `stats.aptitudeGrowth[적성]` (1.3)

### 1.3 스탯 상승 (판정 2)

```
상승량 = 행동 기본 상승 × aptitudeGrowth[적성] × 성장 배율 × clamp((잠재력 − 현재) / stats.gainTaperWithin, 0, 1)
현재 ← min(잠재력, 현재 + 상승량)
```

- 행동 기본 상승: `actions.<행동>.gain`. `train`의 `chosen`은 플레이어가 고른 스탯 하나에 준다.
- 성장 배율: 나이가 `silverSpoon.growthUntilAge` 이하이면 6.2의 은수저 성장 배율, 아니면 1.
- 마지막 항은 **잠재력에 가까워질수록 덜 오르게** 한다. 잠재력까지 `gainTaperWithin` 이상 남았으면 전부 오르고, 그보다 가까우면 비례해서 줄어든다.
- 이벤트의 `statGain` 효과(`effects.json`)도 같은 공식을 쓴다(기본 상승 자리에 등급 값).

| 예시 입력 | 계산 | 출력 |
|---|---|---|
| `train` 비행, 적성 C, 잠재력 50, 현재 30, 성장 배율 1 | `3 × 0.85 × 1 × (20/30)` | **+1.7** → 31.7 |
| 같은 조건, 현재 48 | `3 × 0.85 × 1 × (2/30)` | **+0.17** |
| 현재 = 잠재력 | 마지막 항 0 | **+0** |

---

## 2. 에너지 (판정 1)

### 2.1 지방 상한

```
지방 상한 = energy.capBase + energy.capPerStamina × 체력
```

| 예시 입력 | 출력 |
|---|---|
| 체력 34 (박새 체력 적성 D의 평균) | `50 + 0.5 × 34` = **67** |

### 2.2 채식 효율

```
채식 효율 = energy.forageEffBase + energy.forageEffPerStat × 채식 + energy.forageEffPerExpYear × min(경험 연수, energy.expYearsCap)
```

- 경험 연수 = 그 개체가 `period 1`을 지난 횟수(계승 직후 0).

| 예시 입력 | 출력 |
|---|---|
| 채식 70, 경험 1년 | `0.6 + 0.56 + 0.02` = **1.18** |

### 2.3 섭취

```
섭취 = nodeTiers.food[장소 먹이 등급] × 먹이 보정 × 채식 효율 × actions.<행동>.intakeMult × 고갈 × (1 − nodeTiers.competition[장소 경쟁 등급])
고갈 = max(energy.depletionFloor, 1 − energy.depletionPerStay × 연속 체류)
```

- 장소의 먹이·경쟁 **등급**은 콘텐츠가 `data/nodes/`에 계절별로 적고, 등급의 **숫자**는 여기(`nodeTiers`)에 있다(`03-contracts` 4.4).
- 먹이 보정: 그 시기에 걸린 이벤트·환경 카드의 `foodMod`마다 `1 + effects.foodMod[등급]`(sign `gain`) 또는 `1 − effects.foodMod[등급]`(sign `loss`)을 곱한다. 없으면 1. 효과는 **그 시기가 끝날 때** 사라진다(`03-events`).
- **연속 체류**: 그 장소에 도착한 뒤 지난 단계 수. 도착한 단계는 0. 옮기면 0으로 돌아간다. 같은 자리에서 계속 먹으면 수확이 줄어 "머물기 vs 옮기기"가 생긴다(gdd 10장 '먹이 터 고갈', `00-core-loop` 3.2).

| 예시 입력 | 계산 | 출력 |
|---|---|---|
| 먹이 `medium`, 보정 1, 효율 1.18, `forage`, 연속 체류 2, 경쟁 `low` | `10 × 1 × 1.18 × 1.0 × 0.8 × 0.9` | **8.496** |
| 연속 체류 6 이상 | 고갈 = `max(0.5, 0.4)` | 고갈 **0.5**에서 멈춤 |
| 행동 `move` | `intakeMult` 0 | **0** (이동하는 단계에는 먹지 못한다) |

### 2.4 소비

```
소비 = species.basalPerStep[계절] + 행동 비용 + 번식 비용 + 털갈이 비용
```

| 항 | 값 |
|---|---|
| 계절 | 종 파일 `species.seasons`가 시기 → 계절을 정한다 |
| 행동 비용 | `actions.<행동>.cost`. 단 `move`는 `actions.move.cost × (energy.moveCostFlightBase − energy.moveCostPerFlight × 비행)` |
| 번식 비용 | 포란하는 개체: `energy.incubationCostPerStep` / 급이 국면(`nestling` `postFledge`): `energy.feedCostByIntensity[급이 강도] + energy.feedCostPerChick × 살아 있는 새끼 수` / 그 외 0 |
| 털갈이 비용 | 국면이 `molt`이면 `energy.moltCostPerStep`, 아니면 0 |

- 급이 강도(`low` `mid` `high`)는 육아 방침 1번(gdd 7.3). 정하지 않았으면 `mid`.
- 박새는 암컷만 포란한다. 수컷 플레이어의 `incubation` 단계에는 포란 비용이 없고, 대신 짝 지시 '포란 중 먹이 공급'을 하면 그 비용을 낸다(`04-breeding`, M1).

| 예시 입력 | 계산 | 출력 |
|---|---|---|
| 겨울, `forage` | `8 + 2` | **10** |
| `move`, 비행 46 | `4 × (1.3 − 0.276)` | **4.096** |
| 봄 `nestling`, `forage`, 급이 `high`, 새끼 8 | `6 + 2 + 6 + 0.3 × 8` | **16.4** |

### 2.5 갱신과 아사

```
에너지 ← min(지방 상한, 에너지 + 섭취 − 소비)
에너지 ≤ 0 이면 → 0으로 자르고 아사 (00-core-loop B-1)
```

- 상한을 넘는 섭취는 버린다.
- 에너지가 `지방 상한 × energy.starvationWarnRatio` 미만이면 화면에 굶주림 경고를 띄운다. 위험은 3장의 배고픔 보정이 올린다.
- 시작 에너지: 런 시작 `지방 상한 × energy.runStartRatio`, 계승 직후 `지방 상한 × energy.inheritStartRatio`.

| 예시 입력 | 계산 | 출력 |
|---|---|---|
| 에너지 40, 섭취 8.496, 소비 10, 상한 67 | `40 + 8.496 − 10` | **38.496** |
| 에너지 65, 섭취 12, 소비 8, 상한 67 | `min(67, 69)` | **67** |
| 에너지 5, 섭취 3, 소비 9 | `−1` → 0 | **아사** |

### 2.6 깃털

```
국면이 molt  → 깃털 ← 깃털 + feather.moltRecoverPerStep
그 외        → 깃털 ← 깃털 − feather.decayPerStep
행동이 rest  → 추가로 + actions.rest.featherRecover
깃털 ← clamp(깃털, 0, feather.max)
```

- 시작값 `feather.runStart`. 깃털은 에너지와 같은 판정 1에서 갱신한다.
- 박새 2차 번식의 털갈이 지연은 **재번식이 `molt` 시기(13–14)를 차지하는 것**으로 생긴다(`00-core-loop` 4.4). 털갈이 단계가 줄어 겨울에 깃털이 덜 회복된 상태로 들어간다. 이것이 2차 번식의 겨울 위험이다(gdd 8.4). `species.secondBrood.moltDelayPeriods`는 쓰지 않는다 — 잠정(#8), 스키마에서 빼는 것은 엔진에 요청

| 예시 입력 | 출력 |
|---|---|
| 깃털 60, `winter`, `forage` | **58.5** |
| 깃털 60, `molt`, `rest` | **73** |
| 깃털 96, `molt`, `forage` | **100** (상한) |

---

## 3. 위험 (판정 3)

### 3.1 조작 개체의 사망 위험 — 단계마다 1회

```
위험 = nodeTiers.risk[장소 위험 등급]
     × species.predatorActivity[국면]
     × actions.<행동>.riskMult
     × 위험 보정(그 시기에 걸린 riskMod마다 1 + effects.riskMod[등급]의 곱, 없으면 1)
     × (1 − risk.vigilancePerStat × 경계)
     × (1 − min(risk.expCap, risk.expPerYear × 경험 연수))
     × 무리 보정
     × 지방 보정 × 배고픔 보정 × 깃털 보정 × 노화 보정 × 첫 겨울 보정 × 부상 보정

위험 ← clamp(위험, risk.floor, risk.cap)
```

| 보정 | 식 | 1이 아닐 때 |
|---|---|---|
| 무리 | 국면이 `species.flockPhases`에 있으면 `risk.flockMult` | 박새 겨울·가을 혼성군 |
| 지방 | `1 + risk.fatHeavySlope × max(0, r − risk.fatHeavyFrom)` | 몸이 무거울 때 (gdd 6.1 지방 다이얼) |
| 배고픔 | `1 + risk.hungerSlope × max(0, risk.hungerFrom − r)` | 굶주릴 때 |
| 깃털 | `1 + risk.featherSlope × max(0, risk.featherFrom − 깃털)` | 깃털이 상했을 때 |
| 노화 | 나이 ≥ `species.agingStartAge`이면 `1 + aging.riskPerYear × (나이 − agingStartAge + 1)` | 4장 |
| 첫 겨울 | 나이 0이고 계절이 `winter`이면 `species.firstWinterRiskMult − silverSpoon.firstWinterRelief × 은수저 지수` | 6.3 |
| 부상 | 부상 중이면 `risk.injuryMult` | 이벤트 `injury` |

- `r` = 판정 1 **직후**의 `에너지 / 지방 상한`.
- **하한 `risk.floor`는 0이 아니다** — 어떤 런도 영원하지 않다(gdd 4.5).
- 상한 `risk.cap`은 보정이 겹쳐 터무니없는 값이 나오는 것을 막는다.
- 판정: `u < 위험`이면 사망. `cause: "predation"`. 이벤트가 따로 정한 사망은 그 이벤트의 `cause`를 쓴다(`03-events`).
- gdd 6.2의 "포식자 상성 대응 성공 시 크게 감소"는 이벤트 선택지의 효과로 구현한다(`03-events`). 이 공식에 넣지 않는다.

| 예시 입력 | 출력 |
|---|---|
| 숲 `medium`, `winter`, `forage`, 경계 70, 경험 1, 무리, r 0.575, 깃털 60, 나이 1 | `0.007 × 1.0 × 1.0 × 0.72 × 0.97 × 0.85` = **0.004155** |
| 위와 같되 r 0.2, 깃털 40, 나이 4 | `0.004155 × 1.5(배고픔) × 1.1(깃털) × 1.5(노화)` = **0.010285** |
| `veryHigh`, `nestling`, `explore`, 경계 10, 경험 0, 무리 아님, r 0.1, 깃털 10, 나이 6, 부상 | **0.206694** (상한 미만) |
| 위 + 이벤트 `riskMod: high` | `0.413` → **0.25** (상한) |
| `veryLow`, `autumnFlock`, `rest`, 경계 100, 경험 5, 무리, r 0.6, 깃털 90, 나이 1 | **0.000546** (하한 근처) |

### 3.2 둥지 손실 — 둥지 전체가 실패하는 위험

알이나 새끼가 **둥지 안에 있는** 단계(`laying` `incubation` `nestling`)마다 1회.

```
둥지 손실 = species.nestLossPerStep × (1 − brood.nestLossVigilancePerStat × 부모 경계 평균) × 위험 보정
```

- 부모 경계 평균 = (플레이어 경계 + 짝 경계) / 2. 짝이 없으면 플레이어 경계만.
- 판정: `u < 둥지 손실`이면 **새끼·알 전멸** → `00-core-loop` B-5.
- 이벤트의 `broodRisk`는 이것과 별도로 그 자리에서 1회 굴린다.

| 예시 입력 | 출력 |
|---|---|
| 플레이어 경계 70, 짝 경계 58 | `0.045 × (1 − 0.003 × 64)` = **0.03636** — 9단계 동안 둥지가 남을 확률 약 0.72 |

### 3.3 새끼 개별 사망

`nestling` `postFledge` 단계마다 **새끼 1마리씩** 굴린다.

```
새끼 사망 = brood.chickDeathPerStep × brood.chickDeathByIntensity[급이 강도]
```

- 막내 손실과 먹이 배분(gdd 7.3 2번)은 `04-breeding`(M1)에서 이 식에 새끼별 배율로 더한다.

| 예시 입력 | 출력 |
|---|---|
| 급이 `high` | `0.02 × 0.7` = **0.014** |

---

## 4. 노화

| 언제 | 무엇 |
|---|---|
| 매 단계 | 위험에 노화 보정 (3.1) |
| `period 1` 진입(나이 +1 직후) | 나이 ≥ `species.agingStartAge`이면 `aging.declineStats`의 현재값을 `aging.statDeclinePerYear`씩 내린다(0 아래로 내려가지 않는다). 잠재력은 그대로 |
| 계속 | 경험 연수는 나이와 함께 오른다 — 채식 효율(2.2)과 위험(3.1)에 보정 |

- 박새 노화 시작 3세(gdd 5.5).

| 예시 입력 | 출력 (노화 보정) |
|---|---|
| 나이 2 | **1.0** |
| 나이 3 | **1.25** |
| 나이 5 | **1.75** |
| 나이 3이 된 `period 1`, 비행 50·체력 40 | 비행 **47**, 체력 **37** |

---

## 5. 유전

```
자식 잠재력[s] = 종 평균[s] + heredity.h2[s] × ((어미[s] + 아비[s]) / 2 − 종 평균[s]) + 변이
종 평균[s]   = stats.aptitudeMean[species.aptitude[s]]
변이         = 정규분포(평균 0, 표준편차 heredity.mutationSd)
자식 잠재력  ← clamp(자식 잠재력, heredity.potentialMin, heredity.potentialMax)
```

- **잠재력만 유전된다.** 부모가 훈련으로 올린 현재값은 유전되지 않는다(라마르크식 금지, gdd 3장 원칙 2).
- 종 평균으로 끌려가는 회귀가 있으므로, 계보를 강하게 하려면 **매 세대 좋은 짝과 좋은 새끼를 골라야 한다**(gdd 5.4).
- 정규분포 표본은 엔진의 시드 난수로 만든다(방법은 엔진이 정하고 ADR에 남긴다). 새끼마다 스탯마다 독립으로 뽑는다.
- 짝의 잠재력은 화면에 직접 보이지 않는다. 정직한 신호로 추정한다(`04-breeding`·`screens.md`, M1).
- 선천 특성(체격·깃 선명도·날개 뾰족함·대담성, gdd 5.3)도 같은 식을 쓴다. 특성의 효과와 수치는 `04-breeding`(M1)에서 추가한다 — v0의 에너지·위험 공식에는 특성 항이 없다.

| 예시 입력 | 계산 | 출력 |
|---|---|---|
| 채식(적성 A, 평균 70, h² 0.3), 어미 82, 아비 74, 변이 0 | `70 + 0.3 × (78 − 70)` | **72.4** |
| 같은 부모, 변이 표본 z = +0.5 | `72.4 + 0.5 × 8` | **76.4** |
| 어미·아비 모두 100, 변이 +30 | 자르기 | **100** |

---

## 6. 은수저 — 성장 환경

### 6.1 은수저 지수 (0~1)

새끼가 둥지·돌봄 기간에 얼마나 잘 먹었는가. `nestling` `postFledge` 단계마다 계산해 **평균**한다.

```
한 단계의 공급   = Σ(부모) silverSpoon.feedByIntensity[그 부모의 급이 강도] × 그 부모의 채식 효율 × nodeTiers.food[장소 먹이 등급] / silverSpoon.nodeFoodDivisor
새끼 1마리 몫    = 공급 / 살아 있는 새끼 수
그 단계의 충족도 = min(1, 새끼 1마리 몫 / silverSpoon.chickNeedPerStep)
은수저 지수     = 그 번식의 모든 급이 단계 충족도의 평균
```

- 짝의 급이 강도는 짝이 지시를 받아들였으면 지시대로, 아니면 `mid`.
- v0에서는 한 둥지의 새끼가 모두 같은 지수를 받는다. 먹이 배분 방침으로 새끼마다 달라지는 것은 `04-breeding`(M1).
- **새끼가 많을수록 1마리 몫이 줄어든다.** 많이 낳으면 성공 확률과 후계 폭이 늘지만 새끼 하나하나의 출발이 약해진다 — gdd 8.3 '새끼 수의 역할'의 트레이드오프가 이 식에서 나온다.

| 예시 입력 | 출력 |
|---|---|
| 플레이어(효율 1.18)·짝(효율 1.0) 모두 `mid`, 장소 `medium`, 새끼 8 | 공급 `2.18`, 몫 `0.2725` → **0.545** |
| 같은 조건, 새끼 5 | **0.872** |
| 같은 조건, 새끼 3 | **1.0** |
| 플레이어 `high`, 짝 `mid`, 장소 `high`, 새끼 8 | **0.862** |

### 6.2 시작 스탯과 성장

```
시작 스탯[s] = 잠재력[s] × (silverSpoon.startStatBase + silverSpoon.startStatPerIndex × 은수저 지수) + 학습 보너스[s]
성장 배율   = silverSpoon.growthBase + silverSpoon.growthPerIndex × 은수저 지수   (나이 ≤ silverSpoon.growthUntilAge 동안)
```

- 학습 보너스는 육아 방침 7번 '학습 기회'(gdd 7.3)에서 온다. v0에서는 0. `04-breeding`(M1).
- 계승하지 않은 새끼(NPC)도 같은 식으로 만들지만, 플레이어가 보는 것은 계승 화면의 카드뿐이다.

### 6.3 첫 겨울

```
첫 겨울 보정 = species.firstWinterRiskMult − silverSpoon.firstWinterRelief × 은수저 지수
```

- 잘 먹고 자란 새끼일수록 첫 겨울을 잘 넘긴다(gdd 5.4 — 두루미 연구의 몸집과 첫 겨울 생존).

| 예시 입력 (잠재력 76.4, 은수저 0.545) | 출력 |
|---|---|
| 시작 스탯 | `76.4 × (0.2 + 0.3 × 0.545)` = **27.77** |
| 성장 배율 | **1.018** |
| 첫 겨울 보정 | `1.8 − 0.6 × 0.545` = **1.473** |
| 은수저 1.0이었다면 첫 겨울 보정 | **1.2** |

---

## 7. 화면 표시

### 7.1 사망 위험 · 둥지 손실 · 새끼 사망 (확률)

| 확률 p | 표시 | 예 |
|---|---|---|
| `p < display.riskMinShown` | "0.1% 미만" | 0.0004 → **0.1% 미만** |
| `p < display.riskDecimalsBelow` | 소수 첫째 자리 % | 0.004155 → **0.4%** / 0.010285 → **1.0%** |
| 그 이상 | 정수 % | 0.1234 → **12%** |

- 단계 위험은 대개 1% 아래라서 정수 %로는 비교할 수 없다. 그래서 10% 아래는 소수 첫째 자리까지 보여준다.
- 색 띠: `p < display.riskBands.low` **낮음**, `p < display.riskBands.high` **보통**, 그 이상 **높음**. 위 예에서 0.4% 낮음, 1.0% 보통.
- 반올림은 0.5 올림(절댓값 기준). 경계값(정확히 0.5)의 부동소수점 오차는 엔진이 처리 방법을 정하고 테스트 예시로는 쓰지 않는다.

### 7.2 에너지 변화

- v0의 섭취·소비에는 난수가 없다. 그래서 `Preview.energyDelta`는 `[x, x]`이고 화면에는 **부호 붙은 정수 하나**로 보여준다. 반올림은 절댓값 기준(예: `−1.504` → **−2**, `+8.496` → **+8**, `−0.4` → **0**).
- 이벤트가 끼어드는 몫은 미리보기에 넣지 않는다(이벤트는 미리 알 수 없다).

### 7.3 스탯 상승

- 예상 상승량은 소수 첫째 자리(예: **+1.7**). 등급이 바뀌면 "C → B"를 함께 보여준다.

### 7.4 짝 지시 수락률

| 수락률 | 표시 |
|---|---|
| `≥ mate.displayBands.high` | **높음** |
| `≥ mate.displayBands.mid` | **보통** |
| 그 아래 | **낮음** |
| 생물학적으로 불가능 | **불가** + 이유 (계산하지 않는다) |

- 숫자는 보여주지 않는다. 짝의 성격이 숨겨져 있어 플레이어가 아는 정보보다 정확한 값을 보여주면 안 되기 때문이다(gdd 7.2 '짝 성격 학습'). 성격이 '확인' 단계가 된 뒤 % 표시를 더할지는 `04-breeding`(M1).

---

## 8. 짝 지시 수락률

```
수락률 = clamp( 역할 × 성격 × 컨디션 × 유대 × 상호성 × 성 갈등 × 사회 , mate.acceptMin, mate.acceptMax )
```

| 요인 | 식 | gdd 7.2 |
|---|---|---|
| 역할 | `mate.roleFit[native | shared | unusual]`. 불가능한 지시는 계산하지 않고 '불가' | 종·성별 역할 |
| 성격 | `mate.personality[match | neutral | mismatch]` — 대담한 짝 × 위험한 지시 = match, 소심한 짝 × 위험한 지시 = mismatch | 성격 |
| 컨디션 | `mate.conditionBase + (1 − conditionBase) × min(1, 짝의 r / mate.conditionFullAt)` | 짝의 컨디션 |
| 유대 | `mate.bondBase + mate.bondPerPoint × 유대(0~100)` | 유대 |
| 상호성 | `mate.reciprocity[최근 mate.reciprocityWindowSteps 단계 안에 플레이어가 급이·도움 행동을 한 횟수(최대 2)]` | 상호성 |
| 성 갈등 | `mate.costConflict[지시 비용 small | medium | large]` | 성 갈등 |
| 사회 | `mate.socialBase + mate.socialPerStat × 플레이어 사회` | gdd 5.1 사회 스탯 |

- 어떤 지시가 어떤 역할·비용·위험 성격을 갖는지(지시 목록 표)는 `04-breeding`(M1)이 정한다.
- **거절** 시 짝은 대안 행동을 하고, 효과는 원래 지시의 `refusalEffectMin`~`refusalEffectMax` 사이(균등 난수)다. 거절로 둥지 포기·이혼은 일어나지 않는다(gdd 7.2 [확정], `00-core-loop` B-6).

| 예시 입력 | 출력 |
|---|---|
| 역할 native, 성격 neutral, 짝 r 0.6, 유대 30, 최근 도움 1회, 비용 medium, 사회 70 | `0.9 × 1 × 1 × 0.94 × 1 × 0.9 × 1.04` = **0.792 → 높음** |
| 역할 unusual, mismatch, 짝 r 0.2, 유대 0, 도움 0, 비용 large, 사회 46 | `0.45 × 0.7 × 0.76 × 0.85 × 0.9 × 0.8 × 0.992` = **0.145 → 낮음** |
| 모든 요인 최대 | 1.503 → **0.95** (상한 — 늘 거절 가능성이 남는다) |
| 거절, 원래 효과 먹이 공급 10, 난수 u 0.5 | 대안 행동 효과 **8** |

---

## 8.5 이벤트 계수

이벤트의 추첨·판정형 선택지 계수(`events.*`)와 판정 난이도 등급(`effects.checkDifficulty`)의 의미는 `03-events.md`가 정한다. 숫자만 여기 데이터 파일에 둔다.

## 9. 왜 이 크기인가 (v0 보정 근거)

봇이 아직 없으므로 v0 숫자는 **기획서 8.3의 목표에서 거꾸로** 잡았다. QA 리포트가 나오면 이 장을 실측으로 바꾼다.

| 목표 (`species.targets`) | v0가 노린 크기 |
|---|---|
| 박새 평균 런 4.5년 | 평범한 단계의 사망 위험 약 0.4%(3.1 첫 예시) × 연 38단계 → 판단 위험만으로 연 사망 약 14%. 이벤트(`events.chancePerStep` — 단계의 20%, 그중 일부가 `deathRisk`)로 수 %p 더해 연 약 20%. 3세부터 노화 보정이 붙어 4~5세에 런이 끝나기 쉽다 |
| 1차 번식 성공 약 0.55 | 둥지 손실(3.2) 9단계 생존 약 0.72 × 이벤트 `broodRisk` × 새끼 개별 사망 → 약 0.55 |
| 겨울이 힘들다 (gdd 8.4 '런을 끝내는 주된 위험') | 겨울 `basalPerStep`이 가장 크고, 보통 장소에서 채식해도 수지가 거의 0. 쉬거나 훈련하면 에너지가 준다 |
| 2차 번식의 대가 | 2차 번식 시작 시 `effects.energy.large` 손실 + 털갈이 2시기 지연 → 겨울 깃털 보정 |

- `species.targets.tolerance`(±10%)는 QA 지표 M-04(평균 런 길이)의 허용 범위다. QA가 #20에서 잠정으로 둔 ±10%를 디자인 목표로 확정한다.

---

## 10. 데이터 키와 계약

- 이 명세는 `03-contracts.md` 4.1의 예시 형식에서 출발했고, 다음을 바꾸거나 더했다. 스키마 v0(#2)에 반영해야 한다 — 엔진과의 데이터 필드 의미 합의 이슈에서 다룬다.

| 키 | 변경 | 이유 |
|---|---|---|
| `nestSuccessBase` | **삭제** → `targets.firstBroodSuccess`(목표)와 `nestLossPerStep`(규칙)으로 나눔 | 목표값과 공식 계수를 한 키에 두면 엔진이 무엇을 계산에 쓰는지 모호하다 |
| `targets.tolerance` `breedingYearRatio` `yearBreedingSuccess` `decisionsPerYear` | 추가 | 기획서 8.3·4.2 목표치. QA가 읽는다 |
| `runStart` `seasons` `basalPerStep` `predatorActivity` `flockPhases` `firstWinterRiskMult` | 추가 | 이 명세의 공식이 쓴다 |
| `secondBrood.layByPeriod` | 추가 | 2차 번식 관문이 열리는 마지막 시기 (`00-core-loop` B-5) |
| `secondBrood.energyCost` | 의미 확정 | `effects.energy`의 등급 이름. 2차 번식을 '한다'고 고른 순간 그만큼 에너지 손실 |
| `data/balance/formulas.json` | 신설 | 종 공통 계수 |

## 11. 남은 것

| 무엇 | 어디서 | 언제 |
|---|---|---|
| 스키마 v0 형식 맞춤 · 데이터 검증 명령 통과 | 이 데이터 파일들 | #2 머지 후 |
| 짝 지시 목록(역할·비용·위험 성격), 산란수 선택지, 육아 방침 7항목의 효과, 선천 특성의 효과 | `04-breeding.md` | M1 |
| 계절 방침의 보정치 | `04-breeding.md` 또는 별도 | M1 |
| 실측 보정 | QA 리포트 → 이 문서 9장 | M1~M2 |
