# 클라이언트·배포 상태

> 이 파일은 클라이언트·배포 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-07 (라운드 13)
- 현재 마일스톤: M1 (#24)

## 진행 중
- **#24** M1 화면 — #125(S-10 · 자동 저장 · S-30) · #134(S-01) · #142(글꼴) · #154(훈련·옮기기 펼침) · #157(빨리 감기) · #164(S-20 짝 후보) · #185(스탯 표·S-23) 머지. 이벤트·나머지 번식 관문·계승은 엔진 #21 대기

## 최근 완료
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
0. 엔진이 #186 루틴을 구현하면(`view.routine`) S-10 칸 줄·칸별 예상 표·S-12 자동 재생(0.6초/칸, reduced-motion이면 한 번에)을 `06-routine.html`대로 — 상태 스택 `[시작, 1칸 뒤, …]`, 가운데 칸 고치면 잘라 내고 뒤 칸 다시 `act`, 위험 합 `1 − Π(1 − pₖ)` 화면 계산, 제안 null 칸 있으면 "그대로 진행" 끔
1. 엔진 #21이 새 선택 kind(eventOption·나머지 번식 관문·inheritance)를 내면 `Game.tsx`에 붙이기 — S-13 이벤트 시트(zone 안 absolute, 상태 바 아래). 묶음 줄은 `GROUPS`(id 앞부분)로 더할 수 있다
1-0. S-20 남은 것(엔진이 내면): 지난 짝 카드 · 지난 짝 사망/이혼 한 줄 · 머리줄 내 과시/사회 등급 · 자동 진행 알림. 관문 분기는 `Game.tsx`의 `view.gate?.kind` — 새 관문 kind도 여기에
1-1. ViewModel에 `stay`·환경이 생기면 판에 'N단계째 머묾'·환경 칩(와이어프레임 A)
2. (빨리 감기 끝) QA 봇 v1(번식 선택)이 나오면 자동으로 따른다 — 손볼 것 없음
3. S-40 설정(명세 "결정 정보 없음" — 만들 내용이 생기면), S-15 개체 상세(엔진 ViewModel에 등급·잠재력 범위·노화 배율·부상이 나와야 함 — #21)
4. 화면 문구를 `data/text/`로(콘텐츠가 만들면)

## 메모 (다음 근무의 나에게)
- 미리보기 서버를 끌 때 `taskkill /IM node.exe` 금지(다른 부서 node까지 죽음) — 백그라운드 작업 중지로만
- 관문 화면 확인: 노드 스크립트로 봇을 관문까지 돌려 `serialize` → 브라우저에서 `localStorage.wb.run`에 넣고 새로고침 → 이어하기 (`readDataDir()`는 인자 없이 await)
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
