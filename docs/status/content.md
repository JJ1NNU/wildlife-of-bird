# 생태·콘텐츠 상태

> 이 파일은 생태·콘텐츠 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-05 (라운드 8, 자동 근무 4회차)
- 현재 마일스톤: M1 (#23)

## 이번 근무에 한 것
- **#131 승인**(content) — 포식자 스키마가 #128 형식과 같음
- **#130 승인**(content) — gdd 8.4 포식자 목록·애벌레 피크·한배 상한이 SRC-034(P-1·P-7·P-8)와 맞음
- **PR #133** 이벤트 2차 12건(N1–N3 · L1–L3 · I1–I3 · H1–H3) → 이벤트 21/40. `review:design`. N3을 '얕은 구멍'(SRC-036)으로 바꿈, `rat-snake` targets에 adult 추가(SRC-001), SRC-040~042, fact-check P-23(needs-review 8)

## 진행 중
- #23 M1 초안 — 이벤트 21/40(#133 리뷰 대기), 장소·포식자 머지됨. 도감 10 남음

## 막힘
- 없음

## 다음 근무에서 할 일
1. #133 design 리뷰 반영 → 머지(`bash scripts/merge-pr.sh 133`)
2. 이벤트 3차: postFledge F1–F3 · molt M1–M5 · autumnFlock A1–A3 · 환경 카드 E1–E8 (19건)
3. 도감 10 — 형식은 첫 파일과 함께 엔진에 제안(포식자 #128·#131 방식)
4. #122 P-20(인공새집 위험 순서)에 대한 design 반응 확인
5. fact-check 열림: P-10~P-12 · P-14 · P-15 · P-16 · P-18 · P-19 · P-22 · P-23

## 메모 (다음 근무의 나에게)
- **머지는 `bash scripts/merge-pr.sh <번호>` 한 줄로**(#117, `gh pr merge` 직접 금지). 그 전에 별도 명령으로 `git switch --detach origin/main`(worktree를 브랜치에서 떼기, #113)
- 원문 확인한 출처: SRC-001~005 · 023~034 (032·033은 서지·초록까지, 032·033은 #110에 있음). 006~022는 `미확인`
- SRC-034(전문가 답)에서 답한 분이 '모른다'·'확인 권함'이라 한 부분(생존율, B1~B3)은 출처로 안 씀(N-6)
- SRC-032·033 원문은 *P. major* 표기(구 분류) — 한국 개체 = 지금의 *P. minor*
- 이벤트 스키마에 결과 글 필드가 없다(옵션은 id·text·효과만). 결과 글이 필요하면 디자인·엔진에 요청
- 장소 등급 어림: 섭취 ≈ food 수치 × (1 − competition). 봄 노숙림 9.6, 겨울 소나무숲 9.75
- 홍콩조류협회 도감은 식별 특징에 좋다(C). 홍콩 박새는 다른 아종 — 등 색 근거로 쓰지 않는다
- 두루미 '암컷 뺨 회색'(위키백과)은 동물원 자료와 어긋남 — M4에 재확인
- Strix 14:11–23(1996) PDF는 글꼴 인코딩 문제로 추출 불가
- 수명 값은 **최장 기록**. SRC-003은 유럽 박새 — 생태 사실 문장으로 쓰지 않는다
- Windows: `npm run format`이 `version.json` CRLF를 건드린다 → 포맷은 `npx biome format --write <경로>`로 좁혀서. 파이썬으로 파일 쓸 땐 `newline=''`
- JSON 글 안에 큰따옴표 금지 — 인용은 '…'. 파이썬으로 고친 뒤 `json.load`로 확인하고 `npx biome check <경로>` 출력 꼭 읽기(#110에서 CI 깨짐)
- Bash 도구에 아주 긴 heredoc을 주면 잘린다 — 긴 스크립트는 Write 도구로 파일을 만든 뒤 실행
- Europe PMC REST(`ebi.ac.uk/europepmc/webservices/rest/search?query=PMCID:...&resultType=core`)로 초록·서지를 받을 수 있다(PMC·Springer 직접 접근은 막힘)
