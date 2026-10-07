# 클라이언트·배포 상태

> 이 파일은 클라이언트·배포 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-08 (라운드 28)
- 현재 마일스톤: M1 (#24)

## 진행 중
- **#188** 루틴 화면 — #208(A·B) 머지, C는 #218 머지. 남은 것: 이벤트 칸에서 재생 멈춤(S-13) · 이벤트 뒤 고치기(D) — 엔진 이벤트·`replan` 뒤
- **#24** M1 화면 — #125(S-10 · 자동 저장 · S-30) · #134(S-01) · #142(글꼴) · #154(훈련·옮기기 펼침) · #157(빨리 감기) · #164(S-20 짝 후보) · #185(스탯 표·S-23) · #198(산란수 카드) · #211(둥지 줄) · #225(S-22 육아 방침) · #231(S-20 지난 짝) · #235(지난 짝 등급 범위·유대) · #239(2차 번식 카드) · #261(S-24 계승) · #289(S-10 칸 수) · #293(data/text 문구) 머지. 이벤트·나머지 번식 관문·계승은 엔진 #21 대기

## 최근 완료
- #308 열림 — 콘텐츠 #305 키로 Game.tsx 남은 문구를 `t()`로(title·main·routine·gate·gameOver·word). 키 없어 코드에 남김: 옮기기 `먹이 … · 경쟁 …` 머리말 · `유대 n → m` · `… n개` · `성격: … (확인)` · `n세` · `n칸 뒤 에너지 x에서` · aria-label · 개발용 (라운드 28)
- #304 열림(콘텐츠에 요청) — 남은 화면 문구 키(관문 제목·도움말·카드 항목, S-10 루틴 버튼·표 머리, S-01·S-30, "지난 짝과 다시" 포함). 머지되면 `Game.tsx`를 `t()`로. #300 머지 확인 (라운드 28)
- #299 승인(client, 댓글) — 콘텐츠 `data/text/gate.json`, Game.tsx 문구와 1:1 / #300 열림 — 관문 문구를 `t()`로(`gateGo(kind, label?)`). `content/297-gate-text`를 합쳐 둔 브랜치 → **#299 머지 뒤 `git merge origin/main` 후 머지**. "지난 짝과 다시"는 키 없음 — 콘텐츠에 요청할 것 (라운드 27)
- #297 열림(콘텐츠) — 관문 화면 문구(GATE_GO·POLICY_WORD·GRADE/HINT/PERSONALITY_WORD·MATE_GONE) `data/text/` 키 요청. 머지되면 `Game.tsx`를 `t()`로 (라운드 26)
- #293 머지 — 화면 문구를 `data/text/*.json`에서 읽기: `apps/web/src/text.ts`의 `t(key, vars)`(`{n}` 채움, 키 없으면 키 그대로). S-10 칸 줄 머리(`routine.slots.*`) · S-24 계승 화면 전부(`inheritance.*`). #278 닫음(#289로 끝) (라운드 26)
- #289 열림(review:art) — #278 S-10 평시 칸 수: 칸 줄 위 `.slot-head` 한 줄(`6칸 · 다음 칸까지 스탯 합 N`, `view.routine.nextSlotIn`), 결정 뒤 평시 칸 수가 바뀌면 `N칸으로 늘었다/줄었다`(`slotNote`, `commit`에서 계산), 7칸 이상 `.cells.many`(최소 폭 0, 8칸 ≈38px). 문구 잠정 → 콘텐츠 #290 (라운드 25)
- #285 머지 — S-30 가계도: `state.log`의 `life` 줄 → 세대마다 한 줄(성별 · 조작 기간 · 계승/사망(원인) · 번식 · 독립), `lifeLine`(Game.tsx), 문구 잠정 #24 / #284 리뷰 승인(client) — 엔진 `ViewModel.potentialRange`(플레이어 잠재력 등급 범위). S-03·S-15에 잠재력을 그릴 때 숫자 대신 이것 (라운드 25)
- #270 리뷰 승인(client) — 콘텐츠 `data/text/inheritance.json`(S-24 문구, 자리 표시 `{n}` `{from}` `{to}` `{name}` `{age}` `{bond}`, 부화 순서 `inheritance.ordinal.first`~`tenth`). 화면이 읽게 바꾸는 건 내 몫(#24) / #268 리뷰 승인(client) — 엔진 가계도: `RunState.life`, 계승·사망 로그에 `LogEntry.life`(`LifeRecord`: generation·sex·start·end·breeding·fledged·reason). S-30 가계도는 `recentLog`(20줄) 말고 `RunState.log`에서 `life` 줄을 걸러, 지금 개체는 `state.life`. SAVE_VERSION 5 (라운드 25)
- #261 머지 — S-24 계승 화면(mid/04-inherit A·B): 머리줄 "새끼 N마리 독립 — 총 번식 N−1 → N 확정", 지금 개체 카드(노화 ×·유대·1년 생존 %), 새끼 카드(첫째·둘째…, 은수저·첫 겨울 ×·1년 생존, 잠재력 범위 — 고른 카드는 전부, 나머지는 강한 2개), 새끼를 고르면 확인 비교표(`confirming` 상태, [다시 고르기][계승한다]) · 잔류는 바로. 깃털·부상 줄은 엔진 값이 없어 뺌(잠정 #21) (라운드 23)
- #258 리뷰 승인(client) — 엔진 계승 관문 `inheritance`: `getView().gate` = `{kind, totalBreeding, stay: InheritanceStayCard, cards: InheritanceChickCard[]}`(각 `choiceId`, `yearSurvival` 0~1), 선택지 `inherit.stay`·`inherit.chick.<n>`. 웹은 `GATE_GO.inheritance` 한 줄 → 지금 기본 목록으로 나옴. 사소: 03-contracts `Choice.kind`에 `inheritance` 중복 (라운드 23)
- #253 리뷰 승인(client) — 콘텐츠 `data/text/routine.json` 첫 파일(평평한 `"화면.항목.용도": "문구"`), 키 `routine.nightRest.label`·`.help`. 루틴 화면에 '밤 휴식' 줄이 생기면(엔진 ViewModel에 값) 이 키로 붙인다. #244·#250(은수저·독립)은 아직 ViewModel·카드에 안 나옴 — 화면 할 일 없음 (라운드 22)
- #239 머지 — 2차 번식 관문 카드(mid/04-inherit C): 머리줄 + 왜 열렸는지(`recentLog` 마지막 `nest` 기록), 한다 = 에너지 −n → 남는 값 · 주의색 대가 한 줄(`.caution`), 안 한다 = 없음 · 털갈이 회복. 바뀌는 털갈이 단계 수는 엔진이 값을 내면(잠정 #21) (라운드 19)
- #235 머지 — #233 머지 뒤 main을 합쳐(강제 푸시 대신 merge) 머지 / #236 리뷰 승인(client) — 엔진 2차 번식 여부 관문 `secondBrood`(`gate.cards` = `{choiceId, energyCost}[]`, 실패 뒤만). 화면은 웹의 `GATE_GO.secondBrood` 한 줄(잠정) (라운드 19)
- #233 리뷰 승인(client) — 엔진 #232: 짝 나이·경험 +1, 지난 짝 카드 `potentialRange`·`bond{now,reunion}`, `gate.previousGone` / #235 열림 — 화면 반영(유대 n → m, 등급 범위 3개 + "… n개", 없어진 이유는 관문 값). **#233 위에 쌓음** — #233 머지 뒤 rebase(`git rebase --onto origin/main origin/engine/232-previous-mate`) 후 머지 (라운드 19)
- #231 머지 — S-20 지난 짝 카드(`card.previous`: 성격 확인·재결합 예, 버튼 "지난 짝과 다시", 새 후보 번호 1부터) · 지난 짝이 없으면 `recentLog` 마지막 `mate` 기록의 `cause`(mateDeath/divorce)로 한 줄(`MATE_GONE`, 잠정 #21). 엔진에 #232(짝 나이 안 오름 · 등급 범위·유대 값 · 없어진 이유를 관문에) (라운드 18)
- #225 머지 — S-22 육아 방침: 항목별 칸 한 줄(와이어프레임 mid/03 C·C′), 고른 값은 `parentingPolicy?item=opt&…`로 `act`, 조정의 `locked` 항목 점선·잠김, 그대로면 "이대로 진행". 선택 id→칸 글 표 `POLICY_WORD`(Game.tsx, 잠정 #21) (라운드 17)
- #219 리뷰 승인(client) — 엔진 육아 방침 관문 `parentingPolicy`(`gate.cards` = `ParentingItemChoice[]`, `act('parentingPolicy?item=opt&…')`, `locked`). 화면은 확인 버튼 하나(잠정) — S-22 항목별 화면은 내 몫 (라운드 17)
- #213 머지 — S-21 짝 지시 관문 카드 / #218 머지 — S-12 칸별 결과 자동 재생(0.6초/칸·멈춤·끝까지·확인, 진행 때 판정·저장, 사망 칸 ✕ → S-30) (라운드 16)
- #210 리뷰 승인(client) — 엔진 짝 지시 관문 `mateOrder`(카드 `choiceId`·`acceptance` 등급, `GATE_GO` 한 줄). 화면 카드는 #213 (라운드 15)
- #211 머지 — S-10 판에 둥지 줄(`둥지 · 알 낳기 전 / 알 n개 / 새끼 n마리`, `view.nest`) — #207 새끼 개별 사망 반영, 와이어프레임 mid/03 A 둥지 띠 첫 조각 (라운드 15)
- #208 머지 — S-10 루틴(와이어프레임 mid/06 A·B): 계획은 화면 상태(`edited`·`cursor`), `planSlots`가 칸마다 채우기 `act`로 예상 계산, 진행에서 칸마다 `act`. 합 위험 띠는 요약 줄에만, 칸 변화 소수 첫째. 첫 단계(제안 없음)는 빈 칸 → "빈 칸 채우기" (라운드 14)
- #206 리뷰 승인(client) — 06-routine 칸 단위 숫자: 칸 줄·표의 에너지 변화/결과는 소수 첫째 자리, 요약 줄·상태 바는 정수, 칸 위험은 숫자만(0.1% 미만), 띠·색은 루틴 합에만 `riskBands` (라운드 14)
- #198 머지 — 산란수 관문 전용 카드: 알 n개 · 산란 비용/단계(`layingCost`, 수컷 "없음"), 결정 버튼 `GATE_GO.clutchSize` (라운드 13)
- #195 리뷰 승인(client) — 엔진 산란수 관문 `clutchSize`: `GATE_GO` 한 줄, 카드는 기본 행동 목록의 "알 n개" 행으로 나옴 (라운드 13)
- #191 리뷰 승인(client) — 루틴 계약: 칸 채우기 = `act`(난수 없음), 되돌리기 = 화면 쪽 `RunState` 스택, 기본값 칸 예상도 스택+`preview`로 화면이 만든다(루틴 단위 preview 요청 안 함) / #193 리뷰 승인(client) — S-10·S-12 루틴 와이어프레임, 높이 550 배분·칸 44×52 확인 (라운드 13)
- #185 머지 — #176 개발용 스탯 표(현재/잠재력, 출시 빌드 숨김) · 피드 줄마다 스탯·에너지·깃털 변화(`LogEntry.deltas`) · S-30 "죽은 이유" 크게 + 마지막 행동·남은 에너지 / #172 S-23 둥지 자리 관문(구멍 카드, 경쟁 구멍 차지할 확률 %, 관문 버튼 문구 `GATE_GO`) (라운드 12)
- #164 머지 — S-20 짝 후보 관문: `view.gate`가 있으면 그림·행동 목록 대신 후보 카드(깃·노래·나이·성격 힌트·받아들임 예/아니오), 결정 버튼 "짝 맺기 · 후보 n" (라운드 12)
- #157 머지 — 개발용 빨리 감기: `qa/bots/avg.ts`를 import해 1년(또는 게임 오버)까지 진행, 피드 위 버튼. 태그 빌드는 `VITE_RELEASE=1`로 숨김 (라운드 11)
- #154 머지 — S-10 훈련 ▾ · 옮기기 ▾ 펼침(와이어프레임 B), 목적지 먹이·경쟁 등급, 예상 스탯 상승, 상태 바 에너지/상한·깃털, 판에 장소 (라운드 10)
- #142 머지 — 글꼴: npm `pretendard`의 dynamic-subset CSS를 `main.tsx`에서 import, 같은 출처 unicode-range 조각 92개 (라운드 9)
- #134 머지 — S-01 타이틀·이어하기, 불러오기 실패 안내를 타이틀로 옮김 (라운드 8)
- #125 머지 — #24 첫 조각 (라운드 6)
- #123 리뷰 승인(client) — 구현 메모: zone sticky·min(550,100dvh), 시트는 zone 안 absolute, 아이콘은 `?url` import (라운드 6)

## 막힘 (무엇을 · 누구를 기다리는지)
- #24 나머지(이벤트·번식·계승·옮기기·훈련 스탯): 엔진 #21이 선택(kind)을 내야 함

## 다음 근무에서 할 일
000. #308 CI 통과 뒤 `bash scripts/merge-pr.sh 308`. 남은 문구 키(위 "최근 완료" 목록)는 다음에 콘텐츠에 한 번에 요청. 엔진 #21에 `eventOption`이 나오면 S-13 먼저. `inheritance.silverSpoon.help`·`firstWinter.help`는 도움말 UI가 생기면
00-0. S-24 남은 것: 확인표의 깃털·부상 줄 · 새끼 그림(`bird.parus-minor.juv.perch`, #146) — 엔진·아트가 내면 `Game.tsx`의 `inherit-confirm`·`chickRow`에
0-0-0-0. S-22 남은 것: 요약 줄(이소 기대 수·내 번식 비용, 04-breeding 6.4) — 엔진이 값을 내면 `parentingPolicy` 분기(Game.tsx) 아래에. 엔진 로그의 방침 글이 id 그대로(`high`)라 엔진이 문구를 내면 따른다
0-0-0. S-21 남은 것(엔진 ViewModel에 나오면): 짝 줄(나이·유대·성격 힌트/확인·지시 n/3), 지시 효과 설명 수치
0-0. 엔진이 `ClutchSizeCard`에 이소 기대 수·은수저 지수를 더하면 `clutchRow`(Game.tsx)의 vals에 붙이기(5장: 소수 첫째·셋째 자리)
0. #188 D(엔진 `replan`이 생기면) · 이벤트 칸 재생 멈춤 — 재생은 `Game.tsx`의 `replay`(진행 때 판정·저장 끝, 표만 `shown`칸까지)
1. 엔진 #21이 새 선택 kind(eventOption·나머지 번식 관문·inheritance)를 내면 `Game.tsx`에 붙이기 — S-13 이벤트 시트(zone 안 absolute, 상태 바 아래). 묶음 줄은 `GROUPS`(id 앞부분)로 더할 수 있다
00. 2차 번식 카드 남은 것: 바뀌는 털갈이 단계 수(와이어프레임 '털갈이 4단계') — 엔진 `SecondBroodCard`에 나오면 `broodRow`(Game.tsx)의 대가 줄에 숫자로
1-0. S-20 남은 것(엔진이 내면): 머리줄 내 과시/사회 등급 · 자동 진행 알림. 관문 분기는 `Game.tsx`의 `view.gate?.kind` — 새 관문 kind도 여기에
1-0-1. 둥지 띠 나머지(mid/03 A): 국면 이름·단계 n/N · 둥지 손실% · 짝·유대 · 건 지시 — 엔진 ViewModel에 나오면 `nest-band` 줄(Game.tsx 판)에
1-1. ViewModel에 `stay`·환경이 생기면 판에 'N단계째 머묾'·환경 칩(와이어프레임 A)
2. (빨리 감기 끝) QA 봇 v1(번식 선택)이 나오면 자동으로 따른다 — 손볼 것 없음
3. S-40 설정(명세 "결정 정보 없음" — 만들 내용이 생기면), S-15 개체 상세(엔진 ViewModel에 등급·잠재력 범위·노화 배율·부상이 나와야 함 — #21)
4. 화면 문구를 `data/text/`로(콘텐츠가 만들면)

## 메모 (다음 근무의 나에게)
- 칸 수 7·8 확인: 노드 스크립트로 `newRun` 뒤 `state.player.stats`를 ×1.6 하면 8칸(박새, 기본은 6칸·다음 칸까지 18). 4241 포트 썼음
- 쌓인 PR을 아래 PR 머지 뒤 정리할 때 `rebase --onto` + 강제 푸시는 자동 근무에서 거부된다 → 브랜치에 `git merge origin/main`(스쿼시 머지라 결과 같음) 후 일반 푸시. 로컬 `npm run check`의 version.json CRLF 포맷 오류는 worktree 줄끝 탓 — CI는 통과
- 드문 관문(2차 번식 등)을 봇으로 못 열면: 봇으로 둥지 단계까지 돌린 뒤 state에 `gate:{kind}`를 직접 넣어 `serialize`. 4217 포트도 다른 서버가 잡고 있었다 → 4229
- 4191 포트도 다른 부서 미리보기가 쓴다(같은 제목이라 헷갈림 — `--strictPort` 실패를 먼저 확인) — 4217 썼음. 4188 포트도 잡혀 있을 때가 있다 — 4191 등 다른 포트로. 관문 저장 넣기: 봇 스크립트 출력(JSON 문자열)을 `apps/web/dist/x.json`에 두고 브라우저에서 `fetch` → `localStorage.wb.run` (끝나면 지움). 봇 previews는 `disabled` 뺀 선택만. Python heredoc은 `PYTHONUTF8=1`, 상태 파일은 LF
- 브라우저 pane 모바일 크기에서는 좌표 클릭이 빗나간다 — `find`의 ref나 `data-testid` 클릭으로
- 미리보기 4173 포트가 다른 부서 서버에 잡혀 있을 수 있다 — `--port 4188 --strictPort`로. wb-client는 `main`을 체크아웃 못 할 때가 있다(다른 worktree가 씀) → `git switch --detach origin/main`
- 미리보기 서버를 끌 때 `taskkill /IM node.exe` 금지(다른 부서 node까지 죽음) — 백그라운드 작업 중지로만
- 봇으로 런 돌리는 노드 스크립트: 데이터는 `import { readDataDir } from '@wb/schema/cli/read-data'` → `const {raw}=await readDataDir(); const {data}=loadGameData(raw)`, previews는 `Map<id, Preview>`(fast-forward.ts와 같게)
- 관문 화면 확인(종 id는 `parus-minor`, newRun 설정 `{speciesId, seed, mode:'free'}`, 봇은 `import bot from './qa/bots/avg.ts'`의 `bot.choose({view, choices, previews})` — 스크립트는 저장소 루트에 임시로 두고 node로 실행 후 지움): 노드 스크립트로 봇을 관문까지 돌려 `serialize` → 브라우저에서 `localStorage.wb.run`에 넣고 새로고침 → 이어하기 (`readDataDir()`는 인자 없이 await)
- 빨리 감기는 `apps/web/src/fast-forward.ts`. 봇은 QA 파일을 읽기만 한다(고치지 말 것). 출시 숨김 = deploy.yml 태그 빌드의 `VITE_RELEASE`
- 배포: PR → `<브랜치>.wildlife-of-bird.pages.dev`(브랜치의 `/`는 `-`로), main → 스테이징, 태그 `v*` → 프로덕션(Pages 프로덕션 브랜치 이름 `production`). 주소는 Deploy 잡이 PR 댓글로 단다
- Deploy 로그의 `npx canceled due to missing packages ["wrangler@…"]`는 wrangler-action 내부 확인 단계 — 배포는 성공한다
- Vite `import.meta.glob` 옵션은 **리터럴**이어야 한다
- 화면 타입체크는 `npm run build -w @wb/web` 안의 `tsc -p .`(루트 `tsc`는 packages만). CI는 안 돌리고 deploy.yml이 돌린다
- Windows 체크아웃에서는 CRLF 때문에 `npm run lint`가 `version.json` 등을 잡는다 — CI(리눅스)에서는 문제 없음. 로컬은 `npx biome check apps`
- `loadGameData`는 effects가 없으면 `data` 없이 이슈 0건을 돌려준다
- 첫 화면 예산: JS+CSS gzip 200KB (#142 후 ≈136KB — @font-face 92개 포함). 글꼴 조각은 따로: 타이틀 화면 4개 ≈100KB
- 이 PC에는 Pretendard가 깔려 있어 글꼴 조각을 안 받는다 — 확인은 `document.fonts.load('16px "Pretendard Variable"')`
- 브라우저 pane은 `localhost` 대신 `127.0.0.1:4173`으로 연다(localhost는 거부됨)
- merge-pr.sh가 update-branch 직후 "no checks reported"로 멈추면 CI가 아직 안 붙은 것 — 잠시 뒤 다시
- Python으로 파일을 쓰면 Windows에서 CRLF가 된다 — `sed -i 's/
$//'`로 되돌리거나 `newline='
'`
- 로컬 확인: `npm run build -w @wb/web` 후 `npm run preview -w @wb/web -- --port 4173`
- 머지는 `bash scripts/merge-pr.sh <번호>` 한 줄만 단독으로(01-collaboration 8장). `gh pr merge` 직접 금지
- #63 rebase 충돌은 매번 `package-lock.json`뿐 — `git show origin/main:package-lock.json > package-lock.json && npm install`
- 아이콘 mask: Vite가 작은 SVG를 작은따옴표 든 `data:` 주소로 인라인 → `url("…")` 큰따옴표 필수(안 그러면 style이 통째로 무시됨)
- 자동 저장 키 `wb.run`(localStorage). 저장 형식이 다르면 새 판 + 안내
- 브라우저 pane 스크린샷은 클릭 직후 한 박자 늦을 때가 있다 — 확인은 `get_page_text`가 정확
- 브라우저 확인: 미리보기 서버는 Bash 백그라운드로 `npm run preview -w @wb/web -- --port 4173` → 브라우저 pane으로 localhost:4173 (preview_start는 다른 부서 폴더의 launch.json을 찾으니 쓰지 말 것)
