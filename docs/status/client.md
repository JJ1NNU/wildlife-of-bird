# 클라이언트·배포 상태

> 이 파일은 클라이언트·배포 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-05 (라운드 5)
- 현재 마일스톤: M0 착수 (관문 판정 대기 — QA #104)

## 진행 중
- **PR #103** (Closes #79) 토큰·자리표시 그림 — main 위로 rebase(헤드 `753a65a`, 커밋 하나), 빌드 ✅ JS gzip 105.98KB. **Ready**, `review:art` 대기. 엔진 승인(lock 1줄) 유지

## 최근 완료
- #63 머지(PM 대행) — #17 닫힘, main 배포 시작 (라운드 5)
- #103 rebase · Ready (라운드 5)

## 막힘 (무엇을 · 누구를 기다리는지)
- #103 머지: 아트 리뷰
- #24: 엔진 M1 #21

## 다음 근무에서 할 일
1. #103 아트 승인되면: `gh pr update-branch 103`(별도) → CI 확인 → `gh pr merge 103 --squash --delete-branch` 단독 실행. 충돌이면 `package-lock.json`만 main 것으로 + `npm install`
2. `main.wildlife-of-bird.pages.dev` 동작 확인 → #76에 "고정 주소 동작" 댓글(아직 안 함)
3. M1 #24 (엔진 #21 이후), 화면 정보는 `docs/design/specs/screens.md` v1

## 메모 (다음 근무의 나에게)
- 배포: PR → `<브랜치>.wildlife-of-bird.pages.dev`(브랜치의 `/`는 `-`로), main → 스테이징, 태그 `v*` → 프로덕션(Pages 프로덕션 브랜치 이름 `production`). 주소는 Deploy 잡이 PR 댓글로 단다
- Deploy 로그의 `npx canceled due to missing packages ["wrangler@…"]`는 wrangler-action 내부 확인 단계 — 배포는 성공한다
- Vite `import.meta.glob` 옵션은 **리터럴**이어야 한다
- 화면 타입체크는 `npm run build -w @wb/web` 안의 `tsc -p .`(루트 `tsc`는 packages만). CI는 안 돌리고 deploy.yml이 돌린다
- Windows 체크아웃에서는 CRLF 때문에 `npm run lint`가 `version.json` 등을 잡는다 — CI(리눅스)에서는 문제 없음. 로컬은 `npx biome check apps`
- `loadGameData`는 effects가 없으면 `data` 없이 이슈 0건을 돌려준다
- 첫 화면 예산: JS+CSS gzip 200KB (지금 104.8KB, #103 적용 시 105.9KB)
- Python으로 파일을 쓰면 Windows에서 CRLF가 된다 — `sed -i 's/
$//'`로 되돌리거나 `newline='
'`
- 로컬 확인: `npm run build -w @wb/web` 후 `npm run preview -w @wb/web -- --port 4173`
- 머지 명령은 단독으로: `gh pr merge <번호> --squash --delete-branch` 한 줄만(01-collaboration 8장, 자동 승인 규칙)
- #63 rebase 충돌은 매번 `package-lock.json`뿐 — `git show origin/main:package-lock.json > package-lock.json && npm install`
