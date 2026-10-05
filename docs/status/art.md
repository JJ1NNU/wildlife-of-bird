# 아트·UX 상태

> 이 파일은 아트·UX 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: **2026-10-05 (라운드 5)**
- 현재 마일스톤: M1 #25 진행 (M0 관문 4/4 통과, #104)

## 진행 중
- **#25 (M1)** — 완료 조건 4개 중 2개 끝(style-guide v1, 아이콘 v0). 남은 둘:
  - 박새 이미지 → **배치 02 요청 #111**(`type:human`, 성조 수·암, 어린 새 × 후보 2). 프롬프트 `docs/art/prompts/batch-02-parus-minor.md`. 둥지 새끼는 출처 대기(#95) → 배치 03
  - 중충실도 와이어프레임 5장 ← **#22 `screens.md` v1**(디자인)
- **#95 (열어 둠)** — 프롬프트·두루미 실루엣 반영 끝(PR #109 머지). 남은 것: 그림 검수 → `review:content`, 콘텐츠에 둥지 새끼 특징 요청 댓글

## 최근 완료
- **PR #103 리뷰 승인**(댓글 `승인 (art)`, 라벨 뗌) — 하드코딩 색 없음, 토큰 15개 존재, theme/background 값 = 토큰. 아직 Draft·충돌 → 클라이언트 rebase 대기
- **PR #109 머지** — 박새 배치 02 프롬프트, asset-list 박새 비고(겨울깃 P2 생략, chick → 배치 03), 두루미 자리표시 뒤 덩어리 = 늘어진 접힌 날개깃
- 발행: **#111**(→대표 배치 02), **#113**(→pm: `gh pr merge --delete-branch`가 worktree를 지우는 위험)

## 막힘 (무엇을 · 누구를 기다리는지)
- 박새 그림 → **대표 #111** · 둥지 새끼 특징 → **콘텐츠 #95** · 와이어프레임 → **디자인 #22**

## 다음 근무에서 할 일
1. `review:art` PR — #103이 rebase 뒤 바뀌었으면 다시 볼 것(내용 같으면 볼 필요 없음)
2. **#111 완료 댓글이 왔으면** → 검수(프롬프트 파일의 '검수 순서'; field-marks 거부 기준 6개부터). Pillow로 비교 시트 → 통과 후보 후처리(`style-guide.md` 5장: 생성 도구 표시 지우기, 768px WebP ≤150KB, 출처 기록) → `assets/bird/` PR + `review:content`. 실패가 많으면 프롬프트 고쳐 재요청. 이때 batch-01 inbox 정리도
3. **#95에 둥지 새끼 특징이 오면** → 배치 03(`chick.nest`)
4. **#22가 닫혔으면** → 중충실도 와이어프레임 5장. 반영할 것: #53 클라이언트 제약(**결정 영역은 높이 550 안**, 넘치면 피드만 스크롤, 그림 172→550 이하에서 120), #38 결정 A(장소 줄 → 정보 줄, 행동 목록에 `옮기기`+목적지), 03 탭 38→44px, 아이콘 v0 사용, 새는 종이색 카드 안
5. #113 PM 반영 확인

## 메모 (다음 근무의 나에게)
- **머지 전에 worktree를 브랜치에서 뗄 것**: `git -C C:/dev/wb-art switch --detach origin/main` (별도 명령) → `gh pr merge <번호> --squash --delete-branch` 단독. 라운드 5에 이걸 안 해서 gh가 **wb-art worktree를 통째로 지웠다**(#113). 복구는 `git worktree prune` → `git worktree add --detach C:/dev/wb-art origin/main`. 복구한 worktree에는 **node_modules가 없다** — 필요하면 `npm install`.
- 토큰 `paper`·`sage-strong` 값을 바꾸면 `apps/web/index.html` theme-color와 `manifest.webmanifest`도 같이 바뀌어야 한다(CSS 변수를 못 쓰는 곳, #103).
- **Pillow(Python)가 대표 PC에 있다** — WebP 읽기·쓰기·크기 변환·시트 만들기 다 된다. ImageMagick·cwebp는 없다. **후처리 도구로 확정**(`style-guide.md` 5장). 스크립트는 첫 실제 에셋 처리 때 `scripts/art/`에.
- 배치 01 원본(2048px PNG)은 저장소 밖 `C:\dev\wild-bird-originals\batch-01\`. inbox의 9장은 비교 시트(`docs/art/style-test/`)로 기록이 남았으니 박새 배치 02를 처리할 때 함께 정리해도 된다.
- Gemini는 **비율 지시를 무시한다**(4:5 → 1:1). 그리고 **박새를 유럽 박새처럼 노란 배로 그린다**. 다음 프롬프트에 부정어를 넣을 것.
- Chrome headless: `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --allow-file-access-from-files --window-size=W,H "--screenshot=<스크래치패드>/x.png" "file:///…"`. 출력은 스크래치패드로.
- 이 worktree에서 `npm run lint`가 `version.json` CRLF로 실패한다 — 로컬 줄바꿈 문제, main CI는 초록. 내 파일만 `npx biome check <경로>`로 확인.
- SVG는 Write 도구로(heredoc 금지). 와이어프레임·실루엣은 반드시 렌더해서 볼 것.
- 03 번식 패널 탭 버튼 38px — 44px 미달, #25에서 고칠 것.
