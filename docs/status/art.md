# 아트·UX 상태

> 이 파일은 아트·UX 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: **2026-10-04 (라운드 3)**
- 현재 마일스톤: M0 착수 (아트 몫의 M0 관문 '화풍 결정' 완료) → M1 #25 진행

## 진행 중
- **#25 (M1)** — 완료 조건 4개 중 2개 끝(style-guide v1, 아이콘 v0). 남은 둘은 다른 부서 대기:
  - 중충실도 와이어프레임 5장 ← **#22 `screens.md` v1**(디자인)
  - 박새 이미지 배치 ← **#11 `field-marks.md`**(콘텐츠). 식별 특징 없이 잠정 배치는 내지 않는다(대표 시간 낭비, R-002)

## 최근 완료
- **#13 닫힘** — `style-guide.md` v1 (PR #83): 화풍 A(D-015) 정의·팔레트·프롬프트 공통 블록 + 분류별 꼬리 블록·배치 01 교훈·금지 표현, 후처리 = **Pillow(오프라인, 저장소 의존성 아님)** + Chrome headless, 배경 처리 안 함(종이색 카드), 허용 라이선스 표
- **#15 닫힘** — PR #78 머지(엔진 승인 2회, update-branch 후). 토큰의 `잠정(#13)` 걷음
- **아이콘 v0 18개** — PR #90 (`assets/icon/`, README에 엔진 키 대응), asset-list 반영 PR #97
- 발행: **#85**(→qa 체크리스트에 생성 도구 이용 약관 항목). #79에 "새 그림은 투명 아님 → 종이색 카드 안에" 댓글. #63에 lock 충돌 안내 댓글

## 막힘 (무엇을 · 누구를 기다리는지)
- **#25 와이어프레임 → 디자인 #22**, **#25 박새 배치 → 콘텐츠 #11**

## 다음 근무에서 할 일
1. 내게 온 `review:art` PR — **#79(클라이언트 토큰 적용)** 와 #24·#63의 화면 변경이 올 것. 확인할 것: 하드코딩 색 없음, 44px, 새 그림을 종이색 카드 안에
2. **#11이 닫혔으면** → 박새 배치 02 `type:human` 이슈(`style-guide.md` 1.3 공통 블록 + `bird` 꼬리 + field-marks, 에셋당 후보 2장, 1:1, 저장 `assets/inbox/batch-02/<ID>__<n>.webp`). 대상은 `asset-list.md` 2장 P0의 새 4장(성조 수·암, 새끼, 어린 새) — 배경·뱀은 다음 배치
3. **#22가 닫혔으면** → 중충실도 와이어프레임 5장. 반영할 것: #53 클라이언트 제약(**결정 영역은 높이 550 안**, 넘치면 피드만 스크롤, 그림 172→550 이하에서 120), #38 결정 A(장소 줄 → 정보 줄, 행동 목록에 `옮기기`+목적지), 03 탭 38→44px, 아이콘 v0 사용, 새는 종이색 카드 안
4. #85 QA 답 확인(아트 할 일 없음)

## 메모 (다음 근무의 나에게)
- **Pillow(Python)가 대표 PC에 있다** — WebP 읽기·쓰기·크기 변환·시트 만들기 다 된다. ImageMagick·cwebp는 없다. **후처리 도구로 확정**(`style-guide.md` 5장). 스크립트는 첫 실제 에셋 처리 때 `scripts/art/`에.
- 배치 01 원본(2048px PNG)은 저장소 밖 `C:\dev\wild-bird-originals\batch-01\`. inbox의 9장은 비교 시트(`docs/art/style-test/`)로 기록이 남았으니 박새 배치 02를 처리할 때 함께 정리해도 된다.
- Gemini는 **비율 지시를 무시한다**(4:5 → 1:1). 그리고 **박새를 유럽 박새처럼 노란 배로 그린다**. 다음 프롬프트에 부정어를 넣을 것.
- Chrome headless: `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --allow-file-access-from-files --window-size=W,H "--screenshot=<스크래치패드>/x.png" "file:///…"`. 출력은 스크래치패드로.
- 이 worktree에서 `npm run lint`가 `version.json` CRLF로 실패한다 — 로컬 줄바꿈 문제, main CI는 초록. 내 파일만 `npx biome check <경로>`로 확인.
- SVG는 Write 도구로(heredoc 금지). 와이어프레임·실루엣은 반드시 렌더해서 볼 것.
- 03 번식 패널 탭 버튼 38px — 44px 미달, #25에서 고칠 것.
