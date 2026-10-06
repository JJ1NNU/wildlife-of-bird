# 엔진 상태

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-07 (라운드 17, 자동 근무)
- 현재 마일스톤: M1 진행(#21) — M0 통과(D-019)

## 진행 중
- #21 M1 — 남은 관문 조각 계속(#219 육아 방침 머지됨)
- #121 — **PR #220** 2.1 지난 짝 생존·이혼·재결합 — main(#219) 합침 완료, review:design 대기. 승인되면 `bash scripts/merge-pr.sh 220`. 남은 것 = `secondBrood`(7장)·나머지 관문 흐름
- #139 — 새 키 #153 머지. 남은 것: 부화·관문 `inheritance`·계승·getView(관문 조각 뒤)

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
1. **#21 나머지** — 관문 kind를 늘릴 때마다 web `GATE_GO`에 한 줄 같이 넣을 것(`check`는 통과해도 `deploy` 빌드가 깨짐) · 육아 방침 남은 효과: 둥지 손실 배율(clean·early)·은수저(compete·quality·early)·학습 보너스(`parenting.ts` `policy()`로 읽기) · 둥지 손실(3.2, guardNest `orderValue('mateOrder.guardNest', 1, mult)`) · 은수저(feedHigh). 짝 없이 `nestSite`에 들어가면 4.5 분할 해제(지금은 관문만 안 열림). 둥지 손실 조각 때 S-23 카드에 구멍별 위험% 더하기. 관문 틀은 `api.ts` act 끝(`isPhaseStart`) + `mate.ts` — 관문이 늘면 `gate.kind`별로 나눈다. 계절 방침은 보정치 명세(04-breeding 11장 '별도')가 나온 뒤
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
