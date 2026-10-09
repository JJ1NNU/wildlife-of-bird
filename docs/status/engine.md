# 엔진 상태

기다림: 대표 플레이테스트 #388 — 관문 버그 오면 받기 (#404 머지됨)

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-09 (라운드 44)
- 현재 마일스톤: M1 진행(#21) — M0 통과(D-019)

## 진행 중
- #21 M1 — **완료 조건 6개 모두 main에 있음**(대조 댓글). 관문(#26)에서 버그 오면 바로 받기
- 메모: 쌓은 PR은 바탕 PR 머지 때 브랜치가 지워지며 **자동으로 닫힌다**(#354). 다음엔 쌓지 말거나, 바탕 머지 전에 base를 main으로 바꿔 둘 것. 쌓은 PR은 바탕 머지 뒤 바탕 파일이 add/add 충돌 남 → main 판으로 맞추면 됨
- 메모: `sim/replay` 테스트 timeout 20초로 올림(#404 브랜치 93af09f, 판이 길어져 단독 3.2초)

## 최근 완료 (2026-10-09)
- **#414 승인**(design #408 은수저 chickNeedPerStep 0.5→0.3): 테스트 6.1 기대값 계산 확인, 엔진 코드 변경 없음. review:engine 뗌, 머지는 design
- **#404 승인**(design #392 런 길이 밸런스): 테스트 12개 기대값·테스트 개체를 v0.3.6에 맞춰 PR 브랜치에 커밋(93af09f, 규칙 변경 없음), check 통과. 명세 3.1 표 2·3행 옛 값(→0.002287·0.006288)은 design에 댓글. review:engine 뗌
- **#401 머지**(#393 닫힘): 판 기록 해마다 결정 수·사망 원인, qa 승인

## 최근 완료 (라운드 44)
- **#390 승인**(QA e2e 스모크): 루트 변경분(playwright devDep·`npm run e2e`·.gitignore·CLAUDE.md) 이상 없음, review:engine 뗌. 머지는 QA
- **#401 열음**(#393, P1·M2): sim 판 기록 `result.decisionsByYear`(루틴 첫 칸 1회 + 관문·이벤트 2개 이상)·`deathCause`. 평균 봇 20판 완전한 해 평균 70.7결정. check 통과(테스트 140). review:qa

## 최근 완료 (라운드 42, 2번째 근무)
- **#381 main 머지**(#379 닫힘): content 승인 댓글 뒤 남은 라벨은 엔진이 뗌, 리뷰 사소한 지적(주석 자리) 반영. 콘텐츠가 marten·rat-snake 이벤트에 `predator`를 붙일 차례

## 최근 완료 (라운드 42)
- **병목 표시 정리**: 클라이언트 기다림 '엔진 #21 남은 조각'은 이미 main — 관문 9종 모두 엔진·`Game.tsx`에 있음. #24(클라이언트)·#21(PM)에 댓글, 빠진 게 있으면 구체 이슈로 달라고 요청
- **#381 열음**(#379, P2): `broodRisk`·`chickLoss`에 선택 `predator` — 둥지 실패 로그 `cause`가 `broodRisk:<id>`. 없는 포식자는 validate:data가 잡음. check 통과(테스트 139). review:content. 도감 `predator-met` 열림 판정은 아직 어디에도 없음(범위 밖)

## 최근 완료 (라운드 41, 3번째 근무)
- **#21 완료 조건 대조**(main 2d0ba70): 6개 모두 ✅ — #21에 표 댓글. avg 1,000판·avg/random 각 300판 오류 0, 모든 판 게임 오버로 끝남. 작은 차이: S-6 번식 실패 로그가 `breeding` 아니라 `brood`(+cause) — QA 측정엔 지장 없어 그대로. B-2 번식 중 짝 사망은 v0 이벤트에 없어 범위 밖

## 최근 완료 (라운드 41, 2번째 근무)
- **#373 main 머지**(37d0639): #370 머지 뒤 생긴 스펙 add/add 충돌을 main(design) 판으로 맞춤, check 통과(테스트 139)·데이터 검증 통과·CI 통과. #21에 댓글

## 최근 완료 (라운드 41)
- Actions 복구 확인 — **#363·#366 main 머지됨**, main CI 통과
- **#373에 main 합침**: api.ts getView 충돌(records·seasonPolicy gate) 해결, check 통과(테스트 139). #370·#373에 머지 순서 댓글

## 최근 완료 (라운드 40)
- 대시보드 '#21 번식 선택 조각'은 **이미 main에 있음**(#210~#355) — QA #26에 M-01(`totalBreeding`, main)·M-05/06/13(#366)·M-11(`decision`, main) 어디서 재는지 댓글. #366+#373 로컬 합치기 충돌 없음 확인. PM: 대시보드 엔진 ①을 고쳐 주세요

## 최근 완료 (라운드 39)
- **#373 base → main**(#370 브랜치 삭제 때 자동 닫힘 방지) · `replan` 구현 확인
- **#373에 `preview` 커밋**(11-season-policy 4장): 방침 건 다음 단계 루틴 제안값의 위험 합·에너지 변화. check 통과(테스트 138), avg·random 봇 각 30판 오류 0
- **#373 열음**(#21): 계절 방침 관문 — schema 로드 · 관문(다른 관문보다 먼저, 고르면 나머지 관문으로) · 효과 키 6개 · 계절 바뀌면 거둠. check 통과(테스트 137), 평균·랜덤 봇 각 50판 오류 0. testData는 계절 방침 뺌(`seasonData` 따로)

## 최근 완료 (라운드 38)
- **#370 승인**(design 계절 방침 v0): 효과 키 6개 모두 엔진 자리 있음. schema·로드는 #21 관문 PR에서 엔진이 붙인다(#370 머지 뒤 main 기준으로, 쌓지 않음)

## 최근 완료 (라운드 37, 3번째 근무)
- **#366 열음**(#21): `breedingSeason`(pairing 첫 단계, `deltas.breedable` 1) · 둥지 지을 때 `breeding` 시도(`deltas.attempt` = 그해 몇째 둥지). 03-contracts 반영. check 통과(테스트 128), 평균 봇 50판 오류 0

## 최근 완료 (라운드 37, 2번째 근무)
- **#358 머지**(client 승인) — S-10 `starving`. client #359가 이어받음
- **#363 열음**(#21): `ViewModel.records`(게임 오버 때만) — yearsSurvived(시기÷24 소수 첫째 버림)·generations·fledged·oldestAge. 03-contracts 반영

## 최근 완료 (라운드 37)
- **#355 머지**(client 승인) — S-22 육아 방침 미리보기. client #24가 이어받음
- **#358 열음**(#21): `getView().starving` — energy < energyCap × starvationWarnRatio. check 통과(테스트 128)

## 최근 완료 (라운드 36, 2번째 근무)
- **#352 머지**(client 승인) — 산란수 카드 이소 기대 수·은수저
- #354 자동 닫힘 → main 위로 리베이스해 **#355**로 다시 엶(내용 같음)

## 최근 완료 (라운드 36)
- **#354 열음**(#21): `preview(state, 'parentingPolicy?…')` → `expectedFledged`·`breedingCost`(6.4·6.3). 단계마다 그 국면 배율 — 산란수 카드와 `broodSurvival` 공유. `formulas.broodCost` 분리. 테스트 127

## 최근 완료 (라운드 35)
- **#348 머지됨** — S-23 구멍별 둥지 손실
- **#351 승인**(design #325 nestLossPerStep 0.16 — 테스트 0.12928·판정 1 예시 0.066876 확인, review:engine 뗌)
- **#352 열음**(#21): `ClutchSizeCard.expectedFledged`·`silverSpoon` — `nestLossChance`(export)·`chickDeathChance`·`fulfilment`를 판정과 공유. check 통과(테스트 126)

## 최근 완료 (라운드 34 뒤, 2번째 근무)
- **#344 머지**(client 승인) — #340 닫힘. client #346이 이 위에 올라감
- **#348 열음**(#21): `NestSiteCard.nestLoss` — `nestLossChance`(3.2 × 구멍 · guardNest · 방침)를 판정과 카드가 같이 씀. check 통과(테스트 126)

## 최근 완료 (라운드 34 뒤)
- **#342 승인**(design 잠정 #325 deathRisk ½ · 장소 위험 × 0.85 — 엔진 테스트 숫자만, 0.003324384×0.85 확인, review:engine 라벨 뗌)
- **#344 열음**(#340): 이벤트 카드 `effects`·`onSuccess`·`onFail`: `EffectPreview[]`(`previewEffects`, 난수 없음). check 통과(테스트 126)

## 최근 완료 (라운드 33)
- **#332 머지**(design·client·qa 승인, injuryFresh 반영 뒤 qa 승인 유지) — 이벤트가 런에 실제로 뜸. #188(client)·#325(design)·QA 회귀 측정이 이어받을 수 있음

## 최근 완료 (라운드 32)
- **#326 머지**(design 승인 — 이소 시점·compete 가감 그대로 동의)
- **#330 열음**(#21): `drawStepEvent`(3.1 u₁ 늘 씀, 후보 없으면 u₂ 안 씀) · `resolveOption`(5장 판정형 → onSuccess/onFail). 호출처 없음. check 통과(테스트 122)

## 최근 완료 (라운드 31 뒤)
- **#326 열음**(#21): 효과 `fledgeEarly` — `Nest.fledgedEarly` 표시 · postFledge에 은수저 충족도 더 안 쌓음 · `applyEffects` default throw 제거(11종 전부). 잠정: 독립 때 이소 시점·compete 가감은 그대로. check 통과(테스트 118)

## 최근 완료 (라운드 31)
- **#319 머지**(design 재승인) — main 위로 올리고 부상 테스트 기대값 × 0.8(#318) 반영, CI 통과
- **#320 승인 댓글** `승인 (engine)` 형식으로 다시 닮(merge-pr.sh가 읽는 형식). 메모: 승인 댓글은 줄 첫머리 `승인 (engine)`

## 최근 완료 (라운드 30 뒤)
- **#319 수정**(design 수정 요청): 부상은 판정 3 직후 1 감소(단계 이벤트면 다음 단계부터 N판정) · 계승하면 부상 없어짐. check 통과(테스트 116)
- **#320 승인**(design 6.1 `injury` 세는 법 문구) — 구현과 일치, review:engine 라벨 뗌

## 최근 완료 (라운드 30)
- **#313 머지**(design 승인)
- **#318 승인**(design 위험 등급 × 0.8 — 엔진 테스트 수치 모두 × 0.8·하한 확인, review:engine 라벨 뗌)
- **#319 열음**(#21): 효과 `injury` — RunState.injury(효과 단계 포함·단계마다 1 감소 잠정, 겹치면 큰 쪽), 위험 × injuryMult. check 통과(테스트 115)

## 최근 완료 (라운드 29)
- **#309 머지**(design 승인)
- **#312 승인**(design 둥지 손실 0.2 — 엔진 테스트 2개 확인, review:engine 라벨 뗌)
- **#313 열음**(#21): `applyEffects`에 `broodRisk`(1회 판정 → B-5) · `chickLoss`(올림, 늦게 깬 새끼부터 — 잠정, 전멸 B-5) · 반환에 `log`. check 통과(테스트 113)

## 최근 완료 (라운드 28 뒤)
- **#306 머지됨**
- **#309 열음**(#21): `events.ts` `applyEffects` — energy·feather·statGain·bond·deathRisk·riskMod·foodMod(6.1, 순서대로, 죽으면 중단). 나머지 4종은 throw(잠정). `step.ts` `growthNow` 꺼냄. 호출처 없음. check 통과(테스트 110)

## 최근 완료 (라운드 28)
- **#301 머지**(design 승인) — `RunState.periodMods`, 판정 1·3 · 둥지 손실에 연결
- **#302 승인**(design 03-events 6.1 대상 칸) — 구현과 일치
- **#306 열음**(#21): `order.ts` `mateR`에 그 시기 `foodMod` 곱(04-breeding 2.6, #301 디자인 요청). 테스트 1개. check 통과(테스트 106)
- 메모: 리뷰 승인은 `gh pr review`가 아니라 **`gh pr comment`**로 달아야 merge-pr.sh가 읽는다

## 최근 완료 (라운드 26 뒤)
- **#294 머지**(design 승인)
- **#298 열음**(#21): `events.ts` — `eventContext`·`whenHolds`·`eventCandidates`·`pickEvent`·`checkChance` + 03-events 4장·3.1·5.2 예시 테스트. 호출처 없음. check 통과(테스트 103)

## 최근 완료 (라운드 26)
- **#291 머지**(design 승인) → **#121 닫음**
- **#294 열음**(#21): 둥지 손실(3.2) 판정 — 알·새끼가 둥지에 있는 단계마다 1번, 구멍·`guardNest`·육아 방침(`clean`·`early`) 배율, 손실이면 B-5(로그 `cause: 'nestLoss'`). riskMod는 잠정 1. check 통과(테스트 94), 시뮬 avg·random 200판 오류 0, 리플레이 다름 0

## 최근 완료 (라운드 25 뒤)
- **#291 열음**(#121): 1차 성공 → 잔류 → 2차 번식 → 둘째 둥지 독립 → 계승 관문(yearNests 2) → 잔류 시 molt — 실제 data로 끝까지 도는 것 확인, 테스트 1개 · api.ts 주석. 규칙 변경 없음. check 통과(테스트 93). review:design 대기

## 최근 완료 (라운드 25)
- **#284 머지**(client 승인) → **#139 닫음**(05-inheritance 전부 반영)
- **#280 머지**(design 승인, 문턱 0.90 유지 #283) → **#276 닫음**

## 최근 완료 (라운드 24 뒤, 2번째)
- **#268 머지**(design·client·qa 승인)
- **#284 열음**(#139): `ViewModel.potentialRange` — 플레이어 잠재력 등급 범위(05 4장) · 03-contracts. check 통과(테스트 90). review:client 대기

## 최근 완료 (라운드 24 뒤)
- **#275 승인**(design 칸 수 스탯 명세) — 박새 평균 잠재력 합 348 확인, 칸 수는 루틴 시작 상태로 고정한다고 메모
- **#280 열음**(#276): `routine.slotsBase`·`extraSlotRatios` 새 키 · 평시 스탯 합 문턱 7·8칸 · 실행·예상 중 칸 수 고정 · view `routine.nextSlotIn` · 03-contracts. check 통과(테스트 91), 시뮬 avg·random 200판 오류 0, 리플레이 다름 0
- #268 — design 승인, client·qa 리뷰 대기(merge-pr.sh 멈춤)

## 최근 완료 (라운드 23 뒤)
- **#262 승인**(design 1.3 문구) — #260 구현과 같은 뜻
- **#268 열음**(#139): 가계도 8장 — `RunState.life`(세대·성별·시작·조작 중 번식·독립 새끼) · 계승 `inheritance`/사망 `death` 로그에 `LogEntry.life`(+`end`·`reason`) · `SAVE_VERSION` 5 · 03-contracts. check 통과(테스트 90), 시뮬 avg·random 200판 오류 0, 리플레이 다름 0. review:design·client·qa 대기

## 최근 완료 (라운드 23, 2번째)
- **#258 머지**(design·client 승인)
- **#260 열음**(#139): 은수저 성장 배율 — `Bird.silverSpoon` 있고 나이 ≤ `growthUntilAge`이면 스탯 상승 × `growthMult`(런 시작 개체는 1). 03-contracts `'inheritance'` 중복 제거. check 통과(테스트 89), 시뮬 avg·random 200판 오류 0, 리플레이 다름 0. review:design 대기

## 최근 완료 (라운드 23)
- **#258 열음**(#139): `inherit.ts` — postFledge 마지막 단계에 독립 → `totalBreeding` +1(로그 `breeding`) → 관문 `inheritance`(`inherit.stay`·`inherit.chick.<n>`) · view `{totalBreeding, stay, cards}`(yearSurvival 포함) · 잔류 → secondBrood 관문(#121 1차 성공 뒤) · 계승 → 새끼가 player(7장 예시 33.71·80 일치), `Bird.silverSpoon` 첫 겨울 · forecast.test #255 값 · 03-contracts · web GATE_GO 한 줄. check 통과(테스트 88), 시뮬 avg·random·임시 계승 봇 200판 오류 0, 리플레이 다름 0. review:design·client 대기

## 최근 완료 (라운드 22)
- **#255 승인**(design, #248 사후 리뷰) — 비행 실제 값 예시 4개를 `yearSurvival`로 재계산해 일치(0.7811 · 0.8237 · 0.7625 · 0.7787). `forecast.test.ts`는 다음 조각 때 새 예시로 바꾼다
- **#256 열음**(#254): `data/text/` 형식 확정 — #253 모양 그대로(평평한 키, 첫 마디 = 파일 이름) · `TextFile` · `GameData.text` · 03-contracts 4.5. #253 파일 얹어 check 통과(테스트 84). review:content 대기

## 최근 완료 (라운드 21 뒤)
- **#250 머지**(design 승인). #244 스쿼시 머지로 충돌 → 강제 푸시(리베이스)는 권한 거부라 **main 합침**으로 해결: 충돌 파일은 main 판 + #250 커밋 diff 재적용, main 대비 diff가 원래 #250 커밋과 같음 확인 · check 통과(테스트 83) · CI 통과
- 원격에 남은 옛 `engine/139-*` 브랜치(silver-spoon 등)는 지우지 않음 — 정리는 대표·PM 판단

## 최근 완료 (라운드 21, 2번째)
- #244 여전히 `승인 (design)` 한 줄 대기 — 디자인 몫이라 손대지 않음
- **#250 열음**(#139): `clutch.ts` `fledgling()` — 은수저 확정 → 시작 스탯(학습 보너스, 잠재력 상한 I-7) · 첫 겨울 보정. 05 3장 예시 일치. check 통과(테스트 81). base = #244 브랜치 — #244 머지 뒤 base가 main으로 바뀌면 머지

## 최근 완료 (라운드 21)
- **#244 머지 시도** → `merge-pr.sh`가 '승인 댓글 없음'으로 멈춤(디자인 댓글이 `[design] **승인**` 형식). PM이 디자인에 `승인 (design)` 한 줄 요청해 둠 — 달리면 머지
- **#248 열음**(#139): `forecast.ts` `yearSurvival` — 05-inheritance 6장, 명세 예시 4개 일치(비행 = flightRef일 때). 예시가 #216 비행 보정 이전 계산이라 디자인에 6장 '비행: 지금 값' 명시·재계산 부탁. check 통과(테스트 79). review:design 대기
- ⚠️ **실수**: 상태 커밋을 #248 브랜치 위에서 만들어 `HEAD:main` 푸시 → #248 코드(8a9c345)가 main에 직접 들어감. CI 통과·호출처 없음. 되돌림은 권한 거부로 대표 판단 대기. #248은 diff 없음 — 디자인 사후 리뷰. **다음부터 상태 파일은 `git checkout --detach origin/main` 위에서만 커밋**

## 최근 완료 (라운드 20)
- **#242 머지**(design 승인)
- **#244 열음**(#139): `feedChicks` — 급이 단계마다 새끼 사망 뒤 살아남은 수로 충족도 → `Nest.spoon {sum, steps}` · 짝 `feedHigh`(거절 사이 값) · `quality` 배율 · `silverSpoonIndex`(early·compete 가감). `feedingFulfilment` 입력 `feed` 값으로. check 통과(테스트 79), 시뮬 avg·random 200판 오류 0, 리플레이 다름 0. review:design 대기

## 최근 완료 (라운드 19 뒤)
- **#240 머지**(design 승인)
- **#242 열음**(#139): `Nest.young`(성별·잠재력, 부화 순서) · `hatchIfDue`가 새끼마다 성별 → 잠재력 6개(`childPotential`) · `chicksSurvive`가 죽은 새끼를 뺌. check 통과(테스트 77), 시뮬 avg·random 200판 오류 0, 리플레이 다름 0. review:design 대기

## 최근 완료 (라운드 19)
- **#236 머지**(client·design 승인). main 합침 충돌 `types.ts`(`yearNests`·`mateGone` 둘 다 둠) 해결 · check 통과 · 시뮬 random·avg 200판 오류 0 · 리플레이 다름 0

## 최근 완료 (라운드 18 뒤, 2번째)
- **#233 머지**(client 승인) → #232 닫힘
- **#236 열음**(#121): `brood.ts` — B-5 단계 끝 `secondBrood` 관문(4.4 조건 1~3, `RunState.yearNests`) · '한다' 에너지 손실 + `rebrood` 덮어쓰기 + 뒤 둥지 국면 미리 분할 해제 · '안 한다'/안 열림 → 4.5 분할 해제 · view 카드 `{choiceId, energyCost}` · web GATE_GO 한 줄 · 03-contracts. check 통과(테스트 75), 시뮬 400판 오류 0, 리플레이 다름 0. 시뮬에서 B-5가 0번(둥지 손실 미구현). review:design·client 대기

## 최근 완료 (라운드 18 뒤)
- **#233 열음**(#232 client 요청): 짝 살면 나이·경험 +1 · `RunState.mateGone` → `gate.previousGone` · 지난 짝 카드 `potentialRange`·`bond {now, reunion}` · 03-contracts 갱신. check 통과, 시뮬 avg·random 200판 오류 0, 리플레이 다름 0. review:client 대기

## 최근 완료 (라운드 18)
- **#227 머지**(qa 승인) → #224 닫힘. random 조합 봇 반영은 QA #26
- **#220 머지**(design 재승인, 라벨 정리됨)

## 최근 완료 (라운드 17 뒤)
- **#227 열음**(#224): sim 러너가 조합 id(`?` 앞이 선택 id)를 받음. 임시 조합 봇 300판 오류 0·방침 58조합·리플레이 다름 0. review:qa 대기

## 최근 완료 (라운드 17)
- **#219 머지**(client·design 승인)
- **#220에 main 합침**: `api.ts` `nextStep` 충돌 해결(해 바뀜 로그 반환 + 육아 방침 관문). check 통과(테스트 69), 시뮬 random·avg 200판씩 오류 0, 리플레이 다름 0

## 최근 완료 (라운드 16, 06시)
- **#220 열음**(#121): period 1 짝 생존(`mateDeath`) · pairing 관문 직전 이혼(`RunState.broodFledged`로 afterSuccess/Failure, `divorce`) · 지난 짝 카드 맨 앞(`previous`, 늘 받아들임) · 재결합 유대+10 상한 100·성격 확인 · `nextStep`·`yearStart`가 로그 반환 · SAVE_VERSION 그대로(선택 필드). 시뮬 avg·random 400판 오류 0, 리플레이 다름 0
- #219 머지 시도 → review:client 라벨 남아 멈춤

## 최근 완료 (라운드 16)
- **#216 머지**(design 승인) → #214 닫힘
- **#219 열음**(#21): `parenting.ts` — 관문 `parentingPolicy`(새끼 있는 nestling·postFledge 첫 단계, 짝 지시 다음) · 선택지 `parentingPolicy?항목=값` · postFledge에서 nestCare·fledgeTiming 잠금 · 효과 급이 강도·새끼 사망 배율·소비·short·quality 위험·high 도움 단계 · `RunState.parenting` · SAVE_VERSION 4 · 03-contracts 확정 · web GATE_GO + 확인 버튼(잠정). 시뮬 400판 오류 0, 리플레이 다름 0

## 최근 완료 (라운드 15 뒤)
- **#215 승인**(design #174 3단계 명세) — 예시 숫자 재계산 맞음. 머지 전 고칠 것 2개 댓글(04 168행 0.9168 → 0.8629, 3.1 표 칸 3개 행)
- **#216 열음**(#214): 3.1 비행 보정(모든 칸) · `risk.flightPerStat`·`flightRef` 새 키 · 사회 계수 0.6/0.006 · 테스트 기대값 명세대로. 시뮬 avg·random 200판 오류 0

## 최근 완료 (라운드 15)
- **#210 열음**(#21): `order.ts` — 관문 `mateOrder`(둥지 국면 첫 단계, 첫 칸 전, 고르면 같은 단계) · `RunState.order`·`recentHelp` · `Mate.orders`(3번이면 성격 확인) · 수락/거절 f · 효과 patrol·courtshipFeed·incubationFeed·feedMate·splitBrood(`orderValue`). guardNest·feedHigh는 걸어 두기만(잠정). 03-contracts 갱신. 시뮬 400판 오류 0, 리플레이 다름 0

## 최근 완료 (라운드 14 후)
- **#203 머지**(design 승인) → #186 닫힘. `replan`은 이벤트 해석기 때
- **#207 열음**(#21): 암컷 포란 비용 · 새끼 있으면 급이 비용(mid) · `clutch.ts` `chicksSurvive`(nestling·postFledge 단계당 1번 — 9.4와 분포 같음, 전멸 B-5 cause `chickDeath`) · 새끼가 살아 있으면 postFledge 동안 둥지 유지(옮기기 풀림). 시뮬 avg·random 200판 오류 0

## 최근 완료 (라운드 14)
- **#201 승인**(design 9.4 칸 단위 수치) — 예시 6줄 재계산 확인, 에너지 상한은 칸마다 자른다고 적음
- **#203 열음**(#186): `routine.ts`(projected·suggestions·runRoutine) · `RunState.routine`/`lastRoutine` · `view.routine` · 로그 `decision`→`slot`→`death` · 9.4 환산(step.ts) · `sleepRecoverPerStep` 키 · `forage.gain` 0.3 · SAVE_VERSION 3. 테스트 도우미 `actStep`(fixture). 시뮬 random·avg 100판 오류 0, avg 평균 3.9년

## 최근 완료 (라운드 13 후)
- **#195 머지**(client 승인) · **#197 머지**(#21 부화): `incubation` 마지막 단계 판정 3 뒤 알마다 `hatchRate` → `nest.chicks`. 0이면 B-5(로그 `brood` cause `hatchFailure`, 둥지 거둠 — 2차 번식 관문은 잠정(#21)). 시뮬 avg·random 200판 오류 0, avg 185판 부화

## 최근 완료 (라운드 13)
- **#195 열음**(#21): 관문 `clutchSize`(`laying` 첫 단계, 둥지 있을 때만) · `nest.eggs` · 암컷 산란 비용(`clutch.ts` `layingCost`, step.ts 소비에 더함) · view 카드 `{eggs, layingCost}` · web `GATE_GO` 한 줄. 카드의 이소 기대 수·은수저는 잠정(#21). 시뮬 avg·random 200판 오류 0
- #191 리뷰 반영 메모(구현 때): 칸 사망이어도 `decision` 먼저 1건(qa·design), 이벤트 선택 로그 `type: 'event'`

## 최근 완료 (라운드 12 후)
- **#191 열음**(#186 1단계): 03-contracts 3장 "행동 루틴" — 칸 하나 = `act` 하나(채우기는 판정·난수 없음), 마지막 칸이 루틴 실행, 되돌리기는 화면 쪽 상태 스택, 이벤트 뒤 남은 칸 다시 채우기(`view.routine.replan`), 로그 `slot`·`decision`(루틴당 1 = 결정 셈)·`replan`. 함수·Bot·선택지 id 유지 → 기존 봇 그대로 돔
- #173 머지됨(PM 라운드 12)

## 최근 완료 (라운드 11 후)
- **#173 열음**(#155): `CodexEntry`·`CodexUnlock`(잠정) · validate:data가 `data/codex/` 파일 이름·target·unlock id 교차 검사 · `GameData.codex` · `RawGameData.codex`는 선택(web은 안 건드림) · `EventId` 내보냄 · 03-contracts 4.4
- **#171 머지**(#121): 관문 `nestSite`(짝 있을 때만, `nestBox`는 settlement 장소만, `deep` 경쟁 판정 → 지면 `shallow`) · `RunState.nest` · 둥지 국면(`nestSite`~`nestling`) `move.*` disabled, 벗어나면 둥지 거둠(`nest.ts`). 시뮬 random·avg 300판 오류 0. 클라이언트에 S-23 화면 요청 #172

## 최근 완료 (라운드 11)
- **#166 머지**(#162 P0 버그): `expenditure()`에 `feeding` 플래그 — 둥지 없는 새는 급이 국면에도 급이 비용 없음. `step.ts`는 번식 조각 전까지 `feeding: false`. avg 200판 2년 차 몰림 사라짐. QA에 M1-02 재측정 부탁(#26)
- **#156 승인**(content 도감 형식 — id·파일명·unlock id 교차 확인). review:design 라벨이 빠져 있다고 알림
- **#153 머지**(heredity.femaleShare · rangeWithin, design 승인)
- **#161 머지**(#21 조각): 관문 틀(`RunState.gate`, 열리면 그 단계에 머묾, `getChoices`는 관문 선택지만) + 짝 후보 관문(04-breeding 2.2~2.4, `mateCandidate.<n>`, 1장이면 자동 진행) · `RunState.mate` · `getView().gate.cards`(S-20 신호) · `nextNormal`(Box–Muller) · 로그 `mate`. 시뮬 avg·random 400판 오류 0
- #150 에너지 수지 v0.2는 데이터라 따로 반영할 것 없음 — avg 봇이 2년 차까지 감

## 최근 완료 (라운드 8)
- **#131 머지**(포식자 스키마) · **#132 머지**(breeding.json 스키마) — #132는 main(#131)과 `load.ts`·03-contracts 충돌 해결 후
- **#144 머지**(#21 조각): `RunState`에 그 해 단계표 사본(`calendar`)·`node`·`stay`, 개체 `potential`·`feather`·`expYears` / `getChoices` 평평한 목록(`action.*` · `action.train.<스탯>` · `move.<장소>`) / `act` 판정 1·2·3 + 아사·포식 + `decision`·`death` 로그 / `period 1` 진입(나이·경험·노화·단계표 초기화) / `getView`에 `phase`·`node`·`energyCap` / `SAVE_VERSION` 2. 판정 코드는 `packages/engine/src/step.ts`(`judgeStep` — preview·act 공유)
- **#143 열음**(design): 겨울 에너지 수지가 모든 장소에서 음수 → 무작위 봇 평균 0.22년, 탐욕 봇 0.33년, 거의 전부 아사. + 런 시작 스탯 잠정 결정 요청

## 막힘 (무엇을 · 누구를 기다리는지)
- 없음

## 다음 근무에서 할 일
0. #332 승인되면 머지. #294 머지됨. 그다음 S-23 카드 구멍별 둥지 손실 위험%(nest.ts 잠정) — 클라이언트와 함께
1. **#21 나머지** — 관문 kind를 늘릴 때마다 web `GATE_GO`에 한 줄 같이 넣을 것(`check`는 통과해도 `deploy` 빌드가 깨짐)  관문 틀은 `api.ts` act 끝(`isPhaseStart`) + `mate.ts` — 관문이 늘면 `gate.kind`별로 나눈다. 계절 방침은 보정치 명세(04-breeding 11장 '별도')가 나온 뒤
2. 이벤트 해석기(riskMod·broodRisk — 둥지 손실 riskModFactor 잠정 1을 여기서 채움) · 점수
3. 그다음: #139 나머지 · 번식(둥지 손실·새끼 사망·은수저·유전 — `nextNormal` 있음) · 독립 → 점수 · 계승 · 재번식/분할 해제 · 이벤트 해석기
4. #81 QA 답 확인
5. main lint 경고 1건(`load.ts` runStart.node optional chain) — 그 줄을 고칠 때 같이
6. 성능 재측정(#47)

## 메모 (다음 근무의 나에게)
- 머지는 `bash scripts/merge-pr.sh <번호>`(리뷰·CI 확인 포함). 그 전에 `git -C C:/dev/wb-engine switch --detach origin/main`(#113)
- 남의 PR 브랜치에서 남의 문서 충돌을 풀지 않는다(자동 모드가 막음) — 엔진 몫은 별도 PR로
- **쌓인 PR의 아래 PR을 머지할 때 `--delete-branch` 금지** — base가 지워지면 GitHub가 위 PR을 닫는다(#42 사고). 머지 전 `gh pr list --base <브랜치>`
- Windows에서 python으로 파일을 쓰면 CRLF가 된다 → `npm run format`, `.md`는 `sed -i 's/\r$//'`
- 남의 PR 데이터로 시험할 때: `git fetch origin pull/N/head:prN && git checkout prN -- data/balance` → 끝나면 `git restore --staged data; git checkout -- data; git clean -fd data`
- 성능: 단계마다 로그 배열 전체 복사(`api.ts` act) — 판 길이의 제곱. #21에서 실제 로그가 붙은 뒤 측정(#47 QA 메모: 2400단계 41ms/판)
- `npm run check` = CI와 같은 검사. Windows Git Bash에서 `git show <ref>:<path>`가 경로 변환으로 깨지면 `MSYS_NO_PATHCONV=1`
- Node 타입 제거는 npm workspaces 심링크를 realpath로 풀어서 `@wb/*`가 된다. `erasableSyntaxOnly` → enum 금지
- `@wb/schema` 메인 입구는 브라우저용(fs 없음). fs는 `@wb/schema/cli/read-data`. `@wb/sim`은 Node 전용(node:crypto)
- 유전 정규분포 표본은 아직 없음 — 번식 구현 때 시드 난수로(Box–Muller 등) 만들고 ADR에 남긴다(01-formulas 5장)
- `packages/schema` `table()`은 `const` 타입 인자여야 키가 살아 있다(#96)
- `잠정(#5)` `잠정(#6)` — `grep -rn "잠정(#" packages docs/studio/03-contracts.md`
