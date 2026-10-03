# 아트·UX 상태

> 이 파일은 아트·UX 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: **2026-10-03 (라운드 2)**
- 현재 마일스톤: M0 착수

## 진행 중
- **#13 화풍 결정** — 비교표 완료(PR #70 머지, `style-options.md` 6장). **대표 선택 대기 #71**(`needs:ceo`, 추천 A). 선택되면 `style-guide.md` v1 → #13 닫기.
- **#15** — PR #78 (`review:engine` 대기: 새 워크스페이스 패키지 → lock 8줄). 머지하면 #15 자동 닫힘.

## 최근 완료
- **#13 비교표** PR #70 — 9장 시트·작은 크기(48/96/160px)·숲 위 글자 대비(AA 통과 픽셀 A 91% / B 68% / C 84%)·용량. 추천 A 유지
- **#32 닫음** — 대표 9장 반영 완료
- **#15** PR #78 — `packages/tokens/` v0(CSS 변수만, Pretendard OFL), `assets/placeholder/` 실루엣 4종, `docs/art/asset-list.md` v0
- 발행: **#71**(대표 화풍 선택), **#79**(→client 토큰·자리표시 적용, 글꼴 방법), #11에 박새 식별 실패 댓글

## 막힘 (무엇을 · 누구를 기다리는지)
- **#13 → 대표 (#71)**: 화풍 선택. M0 관문 조건.
- **#78 → 엔진 리뷰**.
- 박새 배치(#25)의 프롬프트는 **#11(콘텐츠 field-marks)** 을 기다린다.

## 다음 근무에서 할 일
1. **#71에 답이 달렸나.** 달렸으면 → `style-guide.md` 1장 v1(화풍 설명·팔레트·공통 블록·금지) + 6.3의 교훈 반영(1:1로 받아 자르기, 오른쪽 아래 생성 도구 표시 잘라내기, A면 배경에 `fewer fine details in the lower half`) → 토큰의 `잠정(#13)` 걷기 → #13 닫기. A가 아니면 토큰 그림 계열 색도 바꿀 것.
2. **#78**: 엔진 승인되면 `gh pr update-branch 78` → CI → 스쿼시 머지.
3. 내게 온 `review:art` PR (이번엔 없었다). #63이 머지되면 #79 PR이 올 것.
4. **#25 (M1)**: 중충실도 와이어프레임 · 아이콘 v0 · 박새 배치. 배치는 #11과 화풍 선택 뒤.
5. 지난 근무에서 남은 것: #38이 A로 닫혔으면 S-10 와이어프레임 수정, #52·#53 답 반영.

## 메모 (다음 근무의 나에게)
- **Pillow(Python)가 대표 PC에 있다** — WebP 읽기·쓰기·크기 변환·시트 만들기 다 된다. ImageMagick·cwebp는 없다. 후처리 도구 후보 1순위(결정은 M3, `style-guide.md` 5장).
- 배치 01 원본(2048px PNG)은 저장소 밖 `C:\dev\wild-bird-originals\batch-01\`. inbox의 9장은 화풍 결정 기록이므로 v1 확정 전에는 지우지 말 것.
- Gemini는 **비율 지시를 무시한다**(4:5 → 1:1). 그리고 **박새를 유럽 박새처럼 노란 배로 그린다**. 다음 프롬프트에 부정어를 넣을 것.
- Chrome headless: `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --allow-file-access-from-files --window-size=W,H "--screenshot=<스크래치패드>/x.png" "file:///…"`. 출력은 스크래치패드로.
- 이 worktree에서 `npm run lint`가 `version.json` CRLF로 실패한다 — 로컬 줄바꿈 문제, main CI는 초록. 내 파일만 `npx biome check <경로>`로 확인.
- SVG는 Write 도구로(heredoc 금지). 와이어프레임·실루엣은 반드시 렌더해서 볼 것.
- 03 번식 패널 탭 버튼 38px — 44px 미달, #25에서 고칠 것.
