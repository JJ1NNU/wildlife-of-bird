# 클라이언트·배포 상태

> 이 파일은 클라이언트·배포 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-05 (라운드 8)
- 현재 마일스톤: M1 (#24) — M0 관문 대표 승인 대기 #115

## 진행 중
- **#24** M1 화면 — #125(S-10 · 자동 저장 · S-30) · #134(S-01 타이틀·이어하기) 머지. 엔진이 아직 자리표시 선택 2개뿐

## 최근 완료
- #134 머지 — S-01 타이틀·이어하기, 불러오기 실패 안내를 타이틀로 옮김 (라운드 8)
- #125 머지 — #24 첫 조각 (라운드 6)
- #123 리뷰 승인(client) — 구현 메모: zone sticky·min(550,100dvh), 시트는 zone 안 absolute, 아이콘은 `?url` import (라운드 6)

## 막힘 (무엇을 · 누구를 기다리는지)
- #24 나머지(이벤트·번식·계승·옮기기·훈련 스탯): 엔진 #21이 선택(kind)을 내야 함

## 다음 근무에서 할 일
1. 엔진 #21이 새 선택 kind를 내면 `Game.tsx`에 붙이기 — 옮기기 펼침(D-016, `move.<장소>`), 훈련 ▾, S-13 이벤트 시트(zone 안 absolute, 상태 바 아래)
2. 빨리 감기(QA 평균 봇) — QA #26 봇 v0이 나오면
3. 엔진과 무관한 M1 화면: S-40 설정(내용 명세 없음 — 디자인에 물을 것), S-15 개체 상세(스탯 명세 #5 대기)
4. 글꼴 싣는 방법 결정, 화면 문구를 `data/text/`로(콘텐츠가 만들면)

## 메모 (다음 근무의 나에게)
- 배포: PR → `<브랜치>.wildlife-of-bird.pages.dev`(브랜치의 `/`는 `-`로), main → 스테이징, 태그 `v*` → 프로덕션(Pages 프로덕션 브랜치 이름 `production`). 주소는 Deploy 잡이 PR 댓글로 단다
- Deploy 로그의 `npx canceled due to missing packages ["wrangler@…"]`는 wrangler-action 내부 확인 단계 — 배포는 성공한다
- Vite `import.meta.glob` 옵션은 **리터럴**이어야 한다
- 화면 타입체크는 `npm run build -w @wb/web` 안의 `tsc -p .`(루트 `tsc`는 packages만). CI는 안 돌리고 deploy.yml이 돌린다
- Windows 체크아웃에서는 CRLF 때문에 `npm run lint`가 `version.json` 등을 잡는다 — CI(리눅스)에서는 문제 없음. 로컬은 `npx biome check apps`
- `loadGameData`는 effects가 없으면 `data` 없이 이슈 0건을 돌려준다
- 첫 화면 예산: JS+CSS gzip 200KB (#125 후 ≈113KB)
- Python으로 파일을 쓰면 Windows에서 CRLF가 된다 — `sed -i 's/
$//'`로 되돌리거나 `newline='
'`
- 로컬 확인: `npm run build -w @wb/web` 후 `npm run preview -w @wb/web -- --port 4173`
- 머지는 `bash scripts/merge-pr.sh <번호>` 한 줄만 단독으로(01-collaboration 8장). `gh pr merge` 직접 금지
- #63 rebase 충돌은 매번 `package-lock.json`뿐 — `git show origin/main:package-lock.json > package-lock.json && npm install`
- 아이콘 mask: Vite가 작은 SVG를 작은따옴표 든 `data:` 주소로 인라인 → `url("…")` 큰따옴표 필수(안 그러면 style이 통째로 무시됨)
- 자동 저장 키 `wb.run`(localStorage). 저장 형식이 다르면 새 판 + 안내
- 브라우저 확인: 미리보기 서버는 Bash 백그라운드로 `npm run preview -w @wb/web -- --port 4173` → 브라우저 pane으로 localhost:4173 (preview_start는 다른 부서 폴더의 launch.json을 찾으니 쓰지 말 것)
