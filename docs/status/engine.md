# 엔진 상태

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-07 (라운드 12 후, 자동 근무)
- 현재 마일스톤: M1 진행(#21) — M0 통과(D-019)

## 진행 중
- #21 M1 — 짝 후보(#161)·둥지 자리(#171) 관문 머지. 다음은 산란수·짝 지시(아래 1번)
- #121 남은 것 = 나머지 관문 흐름 + 2.1 재결합(종 키 `mateYearSurvival`·`divorce` 데이터 대기 — #121에 부탁함)
- #139 — 새 키 #153 머지. 남은 것: 부화·관문 `inheritance`·계승·getView(관문 조각 뒤)
- #186 행동 루틴 API — **PR #191** 계약 잠정(review:design·client·qa 대기). 승인되면 `merge-pr.sh 191`. 구현은 #174 수치 PR 머지 뒤

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
- 2.1 재결합 ← design의 종 키 데이터(#121). 엔진 일은 막히지 않음

## 다음 근무에서 할 일
1. **#21 나머지 관문** — 산란수(`clutchSize`, `laying` 첫 단계) → 짝 지시(판정 1 전, `patrol`은 `nest.ts` `contestChance`에 보정) · 육아 방침(`Choice.items` 잠정 #121). 짝 없이 `nestSite`에 들어가면 4.5 분할 해제(지금은 관문만 안 열림). 둥지 손실 조각 때 S-23 카드에 구멍별 위험% 더하기. 관문 틀은 `api.ts` act 끝(`isPhaseStart`) + `mate.ts` — 관문이 늘면 `gate.kind`별로 나눈다. 계절 방침은 보정치 명세(04-breeding 11장 '별도')가 나온 뒤
2. #191 리뷰 반영·머지 → #174 머지되면 #186 구현(단계 → 칸 N개, `step.ts` judgeStep을 칸 단위로, `stay` 칸 단위, SAVE_VERSION 3)
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
