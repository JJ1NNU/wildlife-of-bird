# 엔진 상태

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-07 15:40 (라운드 23, 자동 근무)
- 현재 마일스톤: M1 진행(#21) — M0 통과(D-019)

## 진행 중
- #21 M1 — 남은 관문 조각 계속(#219 육아 방침 머지됨)
- #121 — 2.1 머지(#220), 실패 뒤 `secondBrood` 머지(#236), 짝 없이 `nestSite` 분할 해제 #240 머지. 남은 것 = 1차 성공 뒤 2차 번식(계승 #139 뒤)
- #139 — 새 키 #153 · 새끼 성별·잠재력 #242 · 1년 생존 예상 #248(main 직접, 사후 리뷰) 머지. 은수저 #244 · 독립 #250 머지. 관문 `inheritance` #258 머지. 은수저 성장 배율 #260 리뷰 대기. 남은 것: 가계도 로그(8장)

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
0. #258 승인되면 머지 → 클라이언트에 S-24 계승 화면 요청(이슈) · #139 남은 것: 은수저 성장 배율 · 가계도 로그(8장)
1. **#21 나머지** — 관문 kind를 늘릴 때마다 web `GATE_GO`에 한 줄 같이 넣을 것(`check`는 통과해도 `deploy` 빌드가 깨짐) · 육아 방침 남은 효과: 둥지 손실 배율(clean·early)·은수저(compete·quality·early)·학습 보너스(`parenting.ts` `policy()`로 읽기) · 둥지 손실(3.2, guardNest `orderValue('mateOrder.guardNest', 1, mult)`) · 은수저(feedHigh). 둥지 손실 조각 때 S-23 카드에 구멍별 위험% 더하기. 관문 틀은 `api.ts` act 끝(`isPhaseStart`) + `mate.ts` — 관문이 늘면 `gate.kind`별로 나눈다. 계절 방침은 보정치 명세(04-breeding 11장 '별도')가 나온 뒤
2. 둥지 손실(3.2)은 칸 행동과 무관하면 단계당 1번(새끼 사망처럼). 독립(postFledge 끝 → 점수·계승)
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
