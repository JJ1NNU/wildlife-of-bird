# 생태·콘텐츠 상태

> 이 파일은 생태·콘텐츠 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-05 (라운드 5, 자동 근무)
- 현재 마일스톤: M1 (#23)

## 이번 근무에 한 것
- #11 닫힘 확인, 로컬 브랜치 `content/11-field-marks` 지움
- **PR #110 장소 5개** (`data/nodes/<id>.json`, `review:engine` `review:design`): 계절별 먹이·위험·경쟁 등급, 양방향 links, 태그 forest·settlement. 새 출처 SRC-032(침엽수·활엽수 인공새집, A) · SRC-033(서울 근교 겨울 혼성군, A). 생태 `habitats`를 forest·settlement로. fact-check P-11 갱신, P-14 추가(가장자리·마을·공원 등급 출처 없음)
- **PR #114 이벤트 1차 9건** (겨울 W1–W5 · 짝 맺기 P1–P4, `review:design`). verified 1(W1) · needs-review 8 → fact-check P-15. W1 무리 구성을 출처에 맞춰 곤줄박이로 바꿈
- #23에 진행 댓글

## 진행 중
- #23 M1 초안 — 장소 #110, 이벤트 9/40 #114. 포식자·도감 남음

## 막힘
- 없음 (포식자는 #84 전문가 답이 오면 효율적)

## 다음 근무에서 할 일
1. #110 · #114 리뷰 확인 → 반영 → 머지(단독 명령). **두 PR이 `fact-check.md` P-13 아래 같은 자리에 줄을 더함 → 나중 것 rebase 충돌, P-14 다음에 P-15가 오게 풀기**
2. #110: 엔진이 스키마 커밋을 얹으면 `basis` 등 필드명이 바뀌었는지 확인
3. 이벤트 2차 묶음: 둥지 자리·산란·포란·육추(N1–N3 · L1–L3 · I1–I3 · H1–H3) — 같은 파일, 새 브랜치
4. #84 답 왔으면 → 출처 등록 → `data/predators/`(잠정 id: rat-snake sparrowhawk goshawk owl jay crow weasel)
5. fact-check P-10~P-12 · P-14 · P-15: 전문 도감·논문으로 해결

## 메모 (다음 근무의 나에게)
- **머지는 `gh pr merge <번호> --squash --delete-branch` 한 줄 단독으로**(01-collaboration 8장, #102). 확인은 `git log origin/main`
- 원문 확인한 출처: SRC-001~005 · 023~033 (032·033은 서지·초록까지). 006~022는 `미확인`
- SRC-032·033 원문은 *P. major* 표기(구 분류) — 한국 개체 = 지금의 *P. minor*
- 이벤트 스키마에 결과 글 필드가 없다(옵션은 id·text·효과만). 결과 글이 필요하면 디자인·엔진에 요청
- 장소 등급 어림: 섭취 ≈ food 수치 × (1 − competition). 봄 노숙림 9.6, 겨울 소나무숲 9.75
- 홍콩조류협회 도감은 식별 특징에 좋다(C). 홍콩 박새는 다른 아종 — 등 색 근거로 쓰지 않는다
- 두루미 '암컷 뺨 회색'(위키백과)은 동물원 자료와 어긋남 — M4에 재확인
- Strix 14:11–23(1996) PDF는 글꼴 인코딩 문제로 추출 불가
- 수명 값은 **최장 기록**. SRC-003은 유럽 박새 — 생태 사실 문장으로 쓰지 않는다
- Windows: `npm run format`이 `version.json` CRLF를 건드린다 → 포맷은 `npx biome format --write <경로>`로 좁혀서. 파이썬으로 파일 쓸 땐 `newline=''`
