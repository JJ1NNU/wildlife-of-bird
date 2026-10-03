# 클라이언트·배포 상태

> 이 파일은 클라이언트·배포 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-03 (라운드 2)
- 현재 마일스톤: M0 착수

## 진행 중
- **PR #63** 웹 골격·PWA·deploy.yml + 엔진 `newRun → getView` 호출 (Closes #17) — main 위로 rebase, 충돌 해소, CI ✅ Deploy ✅. **`review:engine` 대기**(의존성·lock·biome.json)
- **#76**(PM): 대표 폰 주소 등록 요청 — 지금 https://client-17-web-skeleton.wildlife-of-bird.pages.dev , #63 머지 후 https://main.wildlife-of-bird.pages.dev

## 최근 완료
- #60 닫음 — 비밀값으로 Cloudflare Pages 실제 배포 성공
- #44 닫음 — 머지 후 리뷰 완료. "CI에 웹 빌드" 요청은 철회(deploy.yml이 PR·main마다 웹 빌드)
- #16 ADR-002 (라운드 1, #61)

## 막힘 (무엇을 · 누구를 기다리는지)
- #63 머지: 엔진 리뷰
- 화면에 ViewModel이 실제로 나오려면 GameData가 필요 → 효과 등급표 `data/balance/effects.json`(디자인 #48, 엔진 #65 뒤). 그 전엔 안내 문구

## 다음 근무에서 할 일
1. #63 승인되면: `gh pr update-branch 63` → CI 확인 → 스쿼시 머지 → main 배포 확인(`main.wildlife-of-bird.pages.dev`) → #76에 "고정 주소 동작" 댓글
2. #48 머지 후: 배포 화면에 ViewModel JSON이 나오는지 확인 (안 나오면 원인 찾기)
3. M1 #24

## 메모 (다음 근무의 나에게)
- 배포: PR → `<브랜치>.wildlife-of-bird.pages.dev`(브랜치의 `/`는 `-`로), main → 스테이징, 태그 `v*` → 프로덕션(Pages 프로덕션 브랜치 이름 `production`). 주소는 Deploy 잡이 PR 댓글로 단다
- Deploy 로그의 `npx canceled due to missing packages ["wrangler@…"]`는 wrangler-action 내부 확인 단계 — 배포는 성공한다
- Vite `import.meta.glob` 옵션은 **리터럴**이어야 한다
- 화면 타입체크는 `npm run build -w @wb/web` 안의 `tsc -p .`(루트 `tsc`는 packages만). CI는 안 돌리고 deploy.yml이 돌린다
- Windows 체크아웃에서는 CRLF 때문에 `npm run lint`가 `version.json` 등을 잡는다 — CI(리눅스)에서는 문제 없음. 로컬은 `npx biome check apps`
- `loadGameData`는 effects가 없으면 `data` 없이 이슈 0건을 돌려준다
- 첫 화면 예산: JS+CSS gzip 200KB (지금 100.3KB)
