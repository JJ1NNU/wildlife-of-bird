# 클라이언트·배포 상태

> 이 파일은 클라이언트·배포 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-04 (라운드 3)
- 현재 마일스톤: M0 착수

## 진행 중
- **PR #63** (Closes #17) — 엔진 수정 요청(`formulas.json` 로드) 반영 `50bfa14`, 최신 main 위로 rebase. CI ✅ Deploy ✅. 미리보기에서 엔진 ViewModel이 실제로 표시됨. **`review:engine` 재확인 대기**
- **#79** 토큰·자리표시 적용 — 글꼴 결정 댓글 남김(Pretendard subset 400·700 자체 호스팅, swap). 구현은 #78 · #63 머지 뒤

## 최근 완료
- #63 엔진 수정 요청 반영 (라운드 3)
- #60 #44 닫음, #76(PM)에 대표 폰 주소 전달 — 대표 폰 확인 ✅ (라운드 2)

## 막힘 (무엇을 · 누구를 기다리는지)
- #63 머지: 엔진 재확인
- #79 구현: 아트 PR #78 머지(리뷰 라벨은 없음, 머지 대기) + #63
- #24: 엔진 M1 #21 · #63

## 다음 근무에서 할 일
1. #63 승인되면: `gh pr update-branch 63` → CI 확인 → 스쿼시 머지 → `main.wildlife-of-bird.pages.dev` 동작 확인 → #76에 "고정 주소 동작" 댓글, #17 닫힘 확인
2. #78 머지됐으면 #79 PR(토큰 CSS, 자리표시 SVG, 글꼴 subset + OFL.txt, `review:art`)
3. M1 #24

## 메모 (다음 근무의 나에게)
- 배포: PR → `<브랜치>.wildlife-of-bird.pages.dev`(브랜치의 `/`는 `-`로), main → 스테이징, 태그 `v*` → 프로덕션(Pages 프로덕션 브랜치 이름 `production`). 주소는 Deploy 잡이 PR 댓글로 단다
- Deploy 로그의 `npx canceled due to missing packages ["wrangler@…"]`는 wrangler-action 내부 확인 단계 — 배포는 성공한다
- Vite `import.meta.glob` 옵션은 **리터럴**이어야 한다
- 화면 타입체크는 `npm run build -w @wb/web` 안의 `tsc -p .`(루트 `tsc`는 packages만). CI는 안 돌리고 deploy.yml이 돌린다
- Windows 체크아웃에서는 CRLF 때문에 `npm run lint`가 `version.json` 등을 잡는다 — CI(리눅스)에서는 문제 없음. 로컬은 `npx biome check apps`
- `loadGameData`는 effects가 없으면 `data` 없이 이슈 0건을 돌려준다
- 첫 화면 예산: JS+CSS gzip 200KB (지금 104.8KB)
- Python으로 파일을 쓰면 Windows에서 CRLF가 된다 — `sed -i 's/$//'`로 되돌리거나 `newline='
'`
- 로컬 확인: `npm run build -w @wb/web` 후 `npm run preview -w @wb/web -- --port 4173`
