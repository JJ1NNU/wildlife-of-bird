# 클라이언트·배포 상태

> 이 파일은 클라이언트·배포 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-03 (라운드 1, 첫 근무)
- 현재 마일스톤: M0 착수

## 진행 중
- **PR #61** ADR-002 (#16) — Cloudflare Pages + (M6) Pages Functions·D1. `review:engine` 대기
- **PR #63** 웹 앱 골격·PWA 매니페스트·deploy.yml (#17, Refs) — `review:engine` 대기(의존성·lock·biome.json). 화면은 잠정(#17): 엔진 대신 스키마 검증 결과를 그린다
- **#60** 대표 작업: Cloudflare 계정 + Secrets 2개(`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)

## 최근 완료
- #53 와이어프레임 제약 댓글 → 닫음 (쓸 수 있는 높이 최악 ≈550px: 아이폰 SE 사파리)
- #44 머지 후 리뷰 의견 댓글 (CI에 웹 빌드 추가 요청, PR #42 닫힘 알림)
- #38 A안 찬성 + "목적지를 kind:'node' 선택으로 함께 주기" 제안
- #56 main CI 실패(데이터 파일 포맷) → 엔진에 P0 버그로 보고

## 막힘 (무엇을 · 누구를 기다리는지)
- **#17 닫기**: 엔진 API(#3)가 main에 없다(PR #42가 base 브랜치 삭제로 닫힘) → 엔진
- **배포 실제 확인 · 대표 폰 주소**: #60(대표)
- main CI 빨강: #56(엔진), `validate:data`도 콘텐츠 데이터 v0 ↔ 스키마 v0 불일치(#10, 콘텐츠)

## 다음 근무에서 할 일
1. #61·#63 리뷰 반영, 라벨 없고 CI 통과면 스쿼시 머지
2. #60 "등록 완료"면: main 배포 성공 확인 → `https://main.wildlife-of-bird.pages.dev`를 `dept:pm` 이슈로 PM에 전달(#17 완료 조건) → #60 닫기
3. 엔진 API가 main에 오면: `apps/web/src/App.tsx`에서 `newRun → getView` 표시로 바꾸는 작은 PR → #17 닫기
4. 그다음 M1 #24

## 메모 (다음 근무의 나에게)
- 배포: PR → `<브랜치>.wildlife-of-bird.pages.dev`(브랜치의 `/`는 `-`로), main → 스테이징, 태그 `v*` → 프로덕션(Pages 프로덕션 브랜치 이름 `production`). 비밀값이 없으면 deploy.yml은 경고만 내고 성공
- Vite `import.meta.glob` 옵션은 **리터럴**이어야 한다(변수로 넘기면 eager가 무시되어 함수가 들어옴)
- 화면 타입체크는 `npm run build -w @wb/web` 안의 `tsc -p .`(루트 `tsc`는 packages만)
- Windows 체크아웃에서는 CRLF 때문에 `npm run lint`가 `version.json` 등을 잡는다 — CI(리눅스)에서는 문제 없음
- 첫 화면 예산: JS+CSS gzip 200KB (지금 99.7KB, Zod 포함)
