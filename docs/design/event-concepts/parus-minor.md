# 박새 이벤트 컨셉 40

- 버전: v0 (2026-10-05, #22)
- 소유: 게임디자인 / 받는 곳: 생태·콘텐츠 #23(`data/events/parus-minor.json`)
- 기준: 이벤트 틀 `specs/03-events.md`, 배분 `specs/00-core-loop.md` 4.8, 지도·서식지 태그 `00-core-loop` 3.4(PR #106), 등급의 숫자 `data/balance/effects.json`

## 이 문서를 쓰는 법 (콘텐츠에게)

컨셉 하나 = **상황 + 선택의 긴장 + 의도한 효과 등급**. 디자인이 정하는 것은 *게임으로서의 모양*이고, 생태 근거·출처·글·포식자 id는 콘텐츠가 정한다.

- **생태가 맞지 않으면 상황을 바꿔도 된다.** 지킬 것은 "긴장"과 "등급의 크기"다. 컨셉을 버려야 하면 같은 국면에서 다른 상황으로 바꾸고 PR에 적는다(`review:design`).
- **효과 등급은 바꿔도 되지만** 03-events 8장의 리뷰 기준을 지킨다: 지배 선택지 없음, `deathRisk high`는 `rare`에만, 짝 갈등에 큰 `broodRisk` 없음.
- `when`의 성립 조건(03-events 6.2)은 컨셉에 이미 적었다: `bond` → `hasMate`, `broodRisk`·`chickLoss` → `hasBrood`, `fledgeEarly` → 육추 마지막 단계.
- id는 잠정이다(`ev.parus-minor.<컨셉 id>`). 포식자 id(`rat-snake` `sparrowhawk` `goshawk` `owl` `jay` `crow` `weasel`)도 잠정 — `data/predators/`에서 콘텐츠가 확정한다.
- 근거 단서의 SRC는 `docs/content/sources.md`의 것. "확인 필요"는 디자인이 근거를 모르는 것이다 — 근거가 없으면 `needs-review`로 두거나 상황을 바꾼다.
- 선택지 글은 예시다. 최종 글은 콘텐츠 문체 가이드로.

표기: **A/B/C** = 선택지, `chk 스탯 난이도` = 판정형(성공 / 실패), 효과는 `종류 등급 (부호)`.

## 배분 (00-core-loop 4.8)

| 국면 | 단계/년 | 컨셉 | common · uncommon · rare |
|---|---|---|---|
| `winter` | 6 | 5 (W1–W5) | 3 · 2 · 0 |
| `pairing` | 4 | 4 (P1–P4) | 3 · 1 · 0 |
| `nestSite` | 3 | 3 (N1–N3) | 1 · 2 · 0 |
| `laying` | 3 | 3 (L1–L3) | 2 · 1 · 0 |
| `incubation` | 3 | 3 (I1–I3) | 2 · 1 · 0 |
| `nestling` | 3 | 3 (H1–H3) | 2 · 1 · 0 |
| `postFledge` | 4 | 3 (F1–F3) | 2 · 1 · 0 |
| `molt` | 8 | 5 (M1–M5) | 4 · 1 · 0 |
| `autumnFlock` | 4 | 3 (A1–A3) | 1 · 1 · 1 |
| **단계 이벤트** | 38 | **32** | 20 · 11 · 1 |
| 환경 카드 (`periodStart`) | 시기 24 | **8** (E1–E8) | 3 · 4 · 1 |

- 단계 이벤트에서 성별 조건이 있는 것: 수컷 4(P1 P2 L3 I2), 암컷 3(L1 I1 I3). 어느 성별로 해도 국면마다 2개 이상이 남는다.
- 판정형 선택지에 쓰는 스탯이 박새 적성(채식 A · 경계 A · 사회 A · 과시 B · 비행 C · 체력 D)을 고루 건드리게 했다 — 적성이 낮은 스탯의 판정(비행·체력)은 "훈련하면 열리는 선택지"다.

---

## 1. 겨울 `winter` — 시기 1–4, 23–24

**W1 `mixed-flock-join` 혼성군이 지나간다** — common · `phaseAny: [winter]` `habitatAny: [forest]`
- 상황: 쇠박새·진박새·동고비가 섞인 무리가 나무 사이를 훑으며 지나간다.
- A 무리를 따라간다 → `foodMod small (gain)` + `energy small (loss)`
- B 지금 자리에서 마저 먹는다 → `energy small (gain)`
- 긴장: 그 시기 내내의 이득(무리의 먹이 찾기) vs 지금 당장의 몇 입. 시기 첫 단계에 나오면 A, 마지막 단계면 B가 낫다.
- 근거 단서: 겨울 혼성군 SRC-004(E). 혼성군 안의 먹이 이득은 확인 필요.

**W2 `flock-rank` 먹이 자리의 서열** — common · `phaseAny: [winter]`
- 상황: 무리 안에서 서열 높은 개체가 먹이 자리에서 밀어낸다.
- A 버틴다 — `chk social medium` → 성공 `energy medium (gain)` + `statGain social small` / 실패 `injury small` + `energy small (loss)`
- B 물러나 무리 가장자리에서 먹는다 → `energy small (gain)` + `riskMod low`
- 긴장: 사회 판정에 거는 큰 이득 vs 안전하지 않은 가장자리(gdd 10장 '서열 사다리', '가장자리 vs 중앙').
- 근거 단서: 겨울 무리 서열 — 확인 필요.

**W3 `long-cold-night` 긴 밤을 앞두고** — uncommon · `phaseAny: [winter]` `energyBelow: 0.5`
- 상황: 해가 지는데 몸에 지방이 넉넉하지 않다.
- A 어두워질 때까지 더 먹는다 → `energy medium (gain)` + `deathRisk low (predation, owl)`
- B 일찍 잠자리에 든다 → `energy small (loss)`
- 긴장: 굶주림 vs 밤 포식자. 에너지가 아주 낮으면 B가 아사로 이어질 수 있어 A를 고르게 된다 — 지방 다이얼(gdd 6.1)의 체감.
- 근거 단서: 소형 조류의 겨울밤 체온 유지, 올빼미류의 밤 사냥 — 확인 필요.

**W4 `first-winter-follow` 첫 겨울, 어른을 따라** — common · `phaseAny: [winter]` `ageMax: 0`
- 상황: 처음 맞는 겨울. 무리의 어른 새가 나무껍질 틈을 뒤지는 법을 보여 준다.
- A 바짝 따라다니며 배운다 → `statGain foraging medium` + `energy small (loss)`
- B 혼자 먹이를 뒤진다 → `statGain foraging small` + `energy small (gain)`
- 긴장: 계승 직후 겨울(00-core-loop B-4)의 어린 새가 성장과 생존 중 무엇을 먼저 챙기나.
- 근거 단서: 어린 새의 사회 학습(gdd 10장 '포식자 사회 학습'과 같은 결) — 확인 필요.

**W5 `sparrowhawk-ambush` 새매의 매복** — uncommon · `phaseAny: [winter]`
- 상황: 무리가 먹던 덤불 위로 새매가 낮게 미끄러져 들어온다.
- A 가장 가까운 덤불 속으로 뛰어든다 — `chk flight medium` → 성공 `statGain flight small` / 실패 `deathRisk medium (predation, sparrowhawk)`
- B 경보음을 내고 무리 속에 섞인다 → `deathRisk low (predation, sparrowhawk)` + `foodMod small (loss)`
- 긴장: 비행(박새 적성 C)에 거는 선택 vs 확실한 작은 손해. 비행을 키운 개체만 A가 낫다.
- 근거 단서: 포식자 상성 '새매·참매(매복) → 덤불'(gdd 10장) — 확인 필요.

## 2. 짝 맺기 `pairing` — 시기 5–6

**P1 `territory-song-duel` 경계의 노래** — common · `phaseAny: [pairing]` `sex: male`
- 상황: 이웃 수컷이 영역 경계에서 노래를 시작한다.
- A 노래로 맞받는다 — `chk display medium` → 성공 `statGain display small` / 실패 `energy small (loss)`
- B 날아가 쫓아낸다 — `chk flight medium` → 성공 `statGain display medium` / 실패 `injury small`
- C 경계를 조금 내준다 → `foodMod small (loss)`
- 긴장: 영역 분쟁 4단계(노래 → 과시 → 추격 → 몸싸움)의 앞 두 단계. 과시는 짝 수락에 쓰인다(`04-breeding`).
- 근거 단서: 박새 영역 노래 SRC-004(E), '친숙한 이웃' 효과 — 확인 필요.

**P2 `courtship-feeding` 구애 먹이** — common · `phaseAny: [pairing]` `sex: male` `hasMate: true`
- 상황: 짝이 날개를 떨며 먹이를 조른다.
- A 애벌레를 물어다 준다 → `energy small (loss)` + `bond medium (gain)`
- B 내 몫을 먼저 챙긴다 → `energy small (gain)` + `bond small (loss)`
- 긴장: 지금의 에너지 vs 짝 유대(짝 지시 수락률에 쓰인다). 유대가 낮아도 파국은 없다(gdd 7.2).
- 근거 단서: 구애 먹이 선물(gdd 10장 '구애 먹이 선물 (박새)') — 확인 필요.

**P3 `rival-near-mate` 짝 곁의 경쟁자** — uncommon · `phaseAny: [pairing]` `hasMate: true`
- 상황: 다른 개체가 짝 곁을 맴돈다.
- A 끼어들어 쫓는다 — `chk display medium` → 성공 `bond medium (gain)` / 실패 `injury small` + `bond small (loss)`
- B 상관하지 않고 먹이를 찾는다 → `energy small (gain)` + `bond small (loss)`
- 긴장: 과시 판정 vs 확실한 작은 유대 손실. 이별은 없다(03-events 8장 5번).
- 근거 단서: 확인 필요(번식기 짝 지키기 일반).

**P4 `late-frost-song` 꽃샘추위** — common · `phaseAny: [pairing]`
- 상황: 다시 추워진 아침. 노래를 하면 몸이 식는다.
- A 그래도 노래한다 → `energy medium (loss)` + `statGain display medium`
- B 볕 드는 곳에서 먹는다 → `energy small (gain)`
- 긴장: 짝 맺기 직전의 과시 vs 에너지. B의 대가는 과시가 늦게 오르는 것이다.
- 근거 단서: 3월 기온 변동 — 확인 필요.

## 3. 둥지 자리 `nestSite` — 시기 7 (재번식 때도)

**N1 `hole-competition` 같은 구멍을 노리는 새** — common · `phaseAny: [nestSite]` `habitatAny: [forest]`
- 상황: 봐 둔 나무구멍에 다른 구멍 둥지 새가 드나든다.
- A 구멍을 지킨다 — `chk display medium` → 성공 `statGain display small` / 실패 `injury small` + `energy small (loss)`
- B 다른 구멍을 찾는다 → `energy medium (loss)`
- 긴장: 과시 판정 vs 확실한 수색 비용. 노숙림(경쟁 높음)에서 자주 느끼도록 `forest`만.
- 근거 단서: 나무구멍 경쟁(gdd 8.4), 구멍 수는 노령목·딱따구리에 달림 — 경쟁 종은 콘텐츠가.

**N2 `nest-box` 사람이 단 새집** — uncommon · `phaseAny: [nestSite]` `habitatAny: [settlement]`
- 상황: 공원 나무에 걸린 새집이 비어 있다.
- A 새집을 쓴다 → `energy small (gain)` + `riskMod low`
- B 숲의 구멍을 고집한다 → `energy medium (loss)`
- 긴장: 찾기 쉬운 자리 vs 사람 곁의 다른 위험(그 시기 동안).
- 근거 단서: 인공새집 번식 SRC-024. 사람 곁의 위험 종류는 콘텐츠가.

**N3 `shallow-hole` 얕은 구멍** — uncommon · `phaseAny: [nestSite]` (#133에서 `scent-at-hole`을 바꿈)
- 상황: 쉽게 찾은 구멍이 얕고 입구가 넓다.
- A 그래도 이 구멍으로 → `riskMod medium`
- B 포기하고 다시 찾는다 → `energy medium (loss)`
- 긴장: 좋은 자리 + 그 시기의 위험 vs 수색 비용.
- 근거: 깊은 구멍이 포식에 안전하다(SRC-036, fact-check P-20). 처음 안 '족제비 흔적을 알아챈다'는 출처가 없어 바꿨다.

## 4. 산란 `laying` — 시기 8 (재번식 때 1단계)

**L1 `egg-making-hunger` 알을 낳는 배고픔** — common · `phaseAny: [laying]` `sex: female` `hasMate: true` `hasBrood: true`
- 상황: 하루에 알 하나씩. 몸이 먹이를 바란다.
- A 짝이 먹이를 가져오길 조른다 → `energy small (gain)` + `bond small (loss)`
- B 둥지를 비우고 직접 찾는다 → `energy medium (gain)` + `broodRisk low`
- 긴장: 유대 vs 알. 짝 지시 시스템의 조건부 협력(SRC-003)을 미리 맛본다.
- 근거 단서: 산란기 암컷의 에너지 요구 — 확인 필요.

**L2 `jay-watching` 둥지 근처의 어치** — uncommon · `phaseAny: [laying]` `hasBrood: true` `habitatAny: [forest]`
- 상황: 어치가 둥지 나무 근처 가지에서 두리번거린다.
- A 둥지 곁을 지킨다 → `energy medium (loss)`
- B 들키지 않게 멀리 떨어져 있는다 → `broodRisk low`
- C 경보음을 내며 쫓는다 — `chk vigilance medium` → 성공 `statGain vigilance small` / 실패 `injury small` + `broodRisk low`
- 긴장: 에너지 · 알 · 판정 중 무엇을 걸까.
- 근거 단서: 어치의 둥지 포식(gdd 8.4, 검수 필요). 둥지 위치를 숨기는 행동은 확인 필요.

**L3 `mate-guarding` 짝 곁 지키기** — common · `phaseAny: [laying]` `sex: male` `hasMate: true`
- 상황: 짝이 알을 낳는 동안 다른 수컷이 영역을 기웃거린다.
- A 짝 곁을 떠나지 않는다 → `energy small (loss)` + `bond small (gain)` + `foodMod small (loss)`
- B 먹이 찾기에 집중한다 → `energy small (gain)` + `bond small (loss)`
- 긴장: 유대 vs 그 시기의 먹이.
- 근거 단서: 박새류의 산란기 짝 지키기 — 확인 필요.

## 5. 포란 `incubation` — 시기 9 (박새는 암컷 단독 포란)

**I1 `snake-alarm-incubating` 포란 중의 뱀 경보** — uncommon · `phaseAny: [incubation]` `sex: female` `hasBrood: true`
- 상황: 알을 품는데 밖에서 짝이 뱀 경보음을 낸다.
- A 구멍 밖으로 빠져나간다 → `broodRisk medium`
- B 구멍 안에 머문다 — `chk vigilance high` → 성공 `broodRisk low` / 실패 `deathRisk medium (predation, rat-snake)` + `broodRisk high`
- 긴장: 내 몸 vs 알. 경계를 높게 키운 개체만 B를 고를 만하다.
- 근거 단서: 포란 중 암컷이 짝의 경보음 종류에 따라 다르게 반응 SRC-001.

**I2 `feeding-incubating-mate` 품는 짝에게 먹이** — common · `phaseAny: [incubation]` `sex: male` `hasMate: true` `hasBrood: true`
- 상황: 짝이 구멍 안에서 먹이를 조르는 소리를 낸다.
- A 자주 나른다 → `energy medium (loss)` + `bond medium (gain)`
- B 내 몸부터 챙긴다 → `energy small (gain)` + `bond small (loss)`
- 긴장: P2와 같은 축이지만 크기가 크다 — 포란기 수컷의 급이(gdd 8.4).
- 근거 단서: 수컷이 포란 중 암컷에게 먹이 공급(gdd 8.4) — 콘텐츠 출처 연결.

**I3 `leave-eggs-to-feed` 알을 두고 나갈까** — common · `phaseAny: [incubation]` `sex: female` `hasMate: true` `hasBrood: true`
- 상황: 짝이 오지 않는다. 배가 고프다.
- A 짝을 기다린다 → `energy small (loss)` + `bond small (gain)`
- B 잠깐 나가 먹는다 → `energy small (gain)` + `broodRisk low`
- 긴장: 알이 식는 위험 vs 내 에너지. 짝의 협력이 부족할 때의 감각.
- 근거 단서: 포란 중 암컷의 휴식·채식 외출 — 확인 필요.

## 6. 육추 `nestling` — 시기 10 (재번식 때 2단계)

**H1 `snake-at-nest` 둥지 아래의 소리** — uncommon · `phaseAny: [nestling]` `phaseLastStep: true` `habitatAny: [forest]` `hasBrood: true` `hasMate: true`
- **03-events 7.2의 작성 예시 그대로.** A 맞서기(`chk vigilance medium`) / B 새끼 탈출(`fledgeEarly` + `chickLoss small`) / C 지켜보기(`broodRisk high`).
- 근거 단서: SRC-001 · SRC-023(새끼의 뱀 경보 탈출).

**H2 `caterpillar-shortage` 애벌레가 모자라다** — common · `phaseAny: [nestling]` `hasBrood: true`
- 상황: 둥지 근처 나뭇잎의 애벌레가 바닥났다.
- A 먼 곳까지 나른다 → `energy medium (loss)` + `riskMod low`
- B 가까운 데서 작은 먹이로 때운다 → `chickLoss small`
- 긴장: 부모 몸 vs 새끼 수. 육아 방침(gdd 7.3)의 축과 같은 방향.
- 근거 단서: 새끼 먹이 애벌레, 피크 맞추기(gdd 8.4, 검수 확인 중).

**H3 `nest-cleaning` 둥지 청소** — common · `phaseAny: [nestling]` `hasBrood: true`
- 상황: 새끼의 배설물과 진드기가 둥지에 쌓인다.
- A 배설물 주머니를 물어내고 둥지를 청소한다 → `energy medium (loss)`
- B 급이에만 집중한다 → `energy small (gain)` + `chickLoss small`
- 긴장: H2와 같이 부모 몸 vs 새끼지만, 손실 원인이 질병·기생충.
- 근거 단서: 둥지 청소(gdd 10장 '둥지 청소 (박새)'), 외부기생충 — 확인 필요.

## 7. 이소 후 돌봄 `postFledge` — 시기 11–12

**F1 `scattered-fledglings` 흩어져 우는 새끼들** — common · `phaseAny: [postFledge]` `hasBrood: true`
- 상황: 둥지를 떠난 새끼들이 여기저기 나뭇가지에서 운다.
- A 하나하나 찾아가 먹인다 — `chk stamina medium` → 성공 `statGain stamina small` / 실패 `energy large (loss)`
- B 가까운 새끼만 챙긴다 → `chickLoss small`
- 긴장: 체력(박새 적성 D)에 거는 판정 vs 새끼 손실. 큰 에너지 손실은 2차 번식을 어렵게 한다.
- 근거 단서: 이소 후 돌봄 기간 — 확인 필요.

**F2 `crow-near-fledglings` 이소 새끼를 노리는 까마귀** — uncommon · `phaseAny: [postFledge]` `hasBrood: true`
- 상황: 큰부리까마귀가 새끼들이 앉은 가지 쪽으로 날아온다.
- A 혼성군과 함께 몰아낸다(모빙) — `chk social medium` → 성공 `statGain vigilance small` / 실패 `injury medium` + `chickLoss small`
- B 새끼들을 덤불 속으로 불러들인다 → `chickLoss small` + `energy small (loss)`
- 긴장: 여러 종 모빙의 판정 vs 확실한 작은 손해.
- 근거 단서: 경보음으로 여러 종이 함께 모빙 SRC-002. 까마귀의 이소 새끼 포식은 확인 필요.

**F3 `early-independence` 일찍 떼어 놓을까** — common · `phaseAny: [postFledge]` `hasBrood: true`
- 상황: 새끼들이 혼자 먹이를 쪼기 시작했다. 아직 서툴다.
- A 일찍 떼어 놓고 내 몸을 챙긴다 → `energy medium (gain)` + `chickLoss small`
- B 더 돌본다 → `energy medium (loss)`
- 긴장: 2차 번식·털갈이를 앞둔 부모 몸 vs 새끼. 계승할 새끼를 고르는 계승 #1 직전이라 새끼 수가 의미를 가진다.
- 근거 단서: 이소 후 독립 시기 — 확인 필요.

## 8. 털갈이 `molt` — 시기 13–18

**M1 `molt-sluggish` 깃이 빠져 둔하다** — common · `phaseAny: [molt]`
- 상황: 날개깃이 빠져 날갯짓이 무겁다.
- A 덤불 속에 숨어 지낸다 → `foodMod small (loss)`
- B 평소처럼 먹이를 찾아다닌다 → `riskMod low`
- 긴장: 그 시기의 먹이 vs 그 시기의 위험. 털갈이가 '쉬어 가는 시기'가 아니게.
- 근거 단서: 털갈이 중 비행 능력 저하 — 확인 필요.

**M2 `water-bath` 물웅덩이 목욕** — common · `phaseAny: [molt]`
- 상황: 계곡의 얕은 웅덩이. 새 깃을 손질하기 좋다.
- A 목욕한다 → `feather medium (gain)` + `deathRisk low (predation, sparrowhawk)`
- B 지나친다 → `feather small (loss)`
- 긴장: 깃털(겨울 대비, `01-formulas` 2.6) vs 물가에서 드러나는 몸.
- 근거 단서: 깃털 관리 물목욕(gdd 10장) — 확인 필요.

**M3 `song-tutor` 이웃 어른의 노래** — common · `phaseAny: [molt]` `ageMax: 0`
- 상황: 갓 독립한 여름. 이웃 수컷의 노래가 들린다.
- A 따라 부르며 배운다 → `statGain display medium` + `energy small (loss)`
- B 먹이에 집중한다 → `energy small (gain)`
- 긴장: 다음 봄 짝 맺기의 과시 vs 지금의 몸. 계승한 새끼에게만 나온다.
- 근거 단서: 노래 학습 시기(gdd 10장 '노래 학습 시기 (박새)') — 학습 시기·암컷 해당 여부 확인 필요(암컷이면 `sex: male`을 더한다).

**M4 `diet-switch` 곤충에서 씨앗으로** — common · `phaseAny: [molt]` `periodFrom: 16` `periodTo: 18`
- 상황: 곤충이 줄고 씨앗이 맺힌다. 껍질 까는 법이 서툴다.
- A 씨앗 까는 법을 익힌다 → `statGain foraging medium` + `energy small (loss)`
- B 남은 곤충을 쫓는다 → `energy small (gain)` + `foodMod small (loss)`
- 긴장: 가을·겨울을 위한 성장 vs 지금.
- 근거 단서: 식단 전환(gdd 10장), 겨울 종자 먹이 SRC-004(E).

**M5 `storm-night` 비바람 치는 밤** — uncommon · `phaseAny: [molt]`
- 상황: 비바람이 거세다. 깃이 덜 자란 몸이 젖는다.
- A 마른 나무구멍을 찾아 헤맨다 → `energy medium (loss)`
- B 덤불 속에서 버틴다 → `feather medium (loss)` + `deathRisk medium (accident)`
- 긴장: 에너지가 넉넉하면 A, 바닥이면 B밖에 없다 — 아사와 사고 사이.
- 근거 단서: 여름 태풍·폭우(gdd 10장 날씨) — 확인 필요.

## 9. 가을 혼성군 `autumnFlock` — 시기 19–22

**A1 `flock-size` 큰 무리, 작은 무리** — common · `phaseAny: [autumnFlock]`
- 상황: 큰 혼성군과 몇 마리뿐인 작은 무리가 근처에 있다.
- A 큰 무리에 낀다 → `foodMod small (loss)`
- B 작은 무리와 다닌다 → `riskMod low`
- 긴장: 무리의 눈(경계 분담) vs 먹이 경쟁(gdd 10장 '무리의 눈').
- 근거 단서: 혼성군 SRC-004(E). 무리 크기와 경계 효과는 확인 필요.

**A2 `owl-mobbing` 낮에 쉬는 올빼미** — uncommon · `phaseAny: [autumnFlock]` `habitatAny: [forest]`
- 상황: 나뭇가지에서 쉬는 올빼미를 무리가 발견했다.
- A 무리와 함께 몰아낸다 — `chk social medium` → 성공 `statGain vigilance medium` / 실패 `injury small`
- B 조용히 자리를 피한다 → `riskMod low`
- 긴장: 모빙의 학습(gdd 10장 '모빙') vs 포식자가 남은 숲.
- 근거 단서: 여러 종 모빙 SRC-002. 대상이 올빼미류인지 확인 필요.

**A3 `goshawk-chase` 참매의 추격** — **rare** · `phaseAny: [autumnFlock]`
- 상황: 참매가 무리 한가운데로 곧장 내리꽂는다.
- A 급선회해 덤불로 — `chk flight high` → 성공 `statGain flight medium` / 실패 `deathRisk high (predation, goshawk)`
- B 무리 한가운데로 파고든다 → `deathRisk medium (predation, goshawk)`
- 긴장: 이 컨셉의 유일한 `deathRisk high`. 비행 80이면 A의 실제 사망 확률 0.25 × 8% = 2%로 B(3%)보다 낮고, 비행 30이면 0.9 × 8% = 7.2%로 훨씬 높다 — **비행 훈련이 목숨값으로 돌아오는 순간.**
- 근거 단서: 포식자 상성 '새매·참매(매복) → 덤불'(gdd 10장) — 확인 필요.

## 10. 환경 카드 `draw: "periodStart"` — 8개

환경 카드는 국면이 아니라 **시기**로 건다(`periodFrom`·`periodTo`). 선택지 1개(알림)가 기본이고, E8만 선택이 있다(결정 1회).

| # | 잠정 id | 빈도 | 조건 | 효과 (그 시기 끝까지) | 근거 단서 |
|---|---|---|---|---|---|
| E1 | `cold-wave` 한파 | common | 시기 23–3 | `foodMod medium (loss)` | 한파·폭설(gdd 8.4 위험 요소) |
| E2 | `heavy-snow` 폭설 | uncommon | 시기 24–3 | `foodMod large (loss)` | 같음 |
| E3 | `pine-seed-year` 솔씨가 많은 해 | uncommon | 시기 19–4, `habitatAny: [forest]` | `foodMod medium (gain)` | 겨울 종자 SRC-004(E), 해거리(gdd 4.3) — 확인 필요 |
| E4 | `early-leaf-out` 이른 잎, 이른 애벌레 | uncommon | 시기 7–8 | `foodMod small (gain)` — 글로 "피크가 앞당겨졌다"를 알린다 | 산란 시작이 봄 기온에 따라 달라짐 SRC-004 · SRC-005 |
| E5 | `cold-rainy-spell` 장마 저온 | common | 시기 12–14 | `foodMod medium (loss)` | 장마 저온기 먹이 감소(gdd 8.4) |
| E6 | `hawk-settled-nearby` 새매가 자리 잡았다 | common | 시기 17–4 | `riskMod low` | 성조 포식 새매(gdd 8.4) |
| E7 | `logging` 숲 벌채 | **rare** | `habitatAny: [forest]` | `riskMod medium` + `foodMod small (loss)` | 드문 인공 위험 '숲 벌채'(gdd 8.4) |
| E8 | `typhoon-warning` 태풍이 온다 | uncommon | 시기 15–18 | 선택 2개 — A 숲 깊은 구멍으로 피한다: `riskMod low` + `foodMod small (loss)` / B 평소대로 지낸다: `riskMod medium` | 여름 태풍 — 확인 필요 |

- 환경 카드의 `habitatAny`는 뽑는 순간, 곧 **시기가 시작될 때 있는 장소**로 참·거짓이 정해진다(03-events 3.2 · 4장).
- E4는 산란 시기 결정(애벌레 피크 맞추기, gdd 8.4)의 단서다. 피크 엇갈림 자체의 규칙은 `04-breeding`이 정한다 — 이 카드는 그 규칙이 정해지기 전까지 먹이 보정만 한다.

---

## 디자인 리뷰가 볼 것 (콘텐츠 PR 때)

- 위 등급에서 **한 단계 이상** 바꾸면 PR에 이유를 적는다. `deathRisk`·`broodRisk`를 올리는 쪽은 특히.
- 컨셉을 다른 상황으로 바꾸면 국면 배분(4.8)이 유지되는지.
- 지배 선택지가 생기지 않았는지 — 위 "긴장" 줄이 기준이다.
- 균형은 QA 첫 리포트(#26)의 '이벤트별 사망 기여도'로 다시 본다. v0 등급은 감이 아니라 03-events 8장 크기 감각에 맞춘 것이고, 숫자 조정은 `effects.json` 한 곳에서 한다.
