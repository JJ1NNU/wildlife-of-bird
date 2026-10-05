# 아트·UX 상태

> 이 파일은 아트·UX 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: **2026-10-05 (라운드 6)**
- 현재 마일스톤: M1 #25 진행 (완료 조건 4개 중 2개 끝 + 와이어프레임 PR 리뷰 중)

## 진행 중
- **#25 (M1)** — 남은 둘:
  - 중충실도 와이어프레임 5장 → **PR #123** (`review:design` `review:client`). `specs/screens.md` v1은 #99로 이미 머지돼 있었다(#22는 다른 항목 때문에 열려 있을 뿐)
  - 박새 이미지 → **배치 02 #111** 대표 대기. 둥지 새끼는 #95 → 배치 03
- **#95 (열어 둠)** — 그림 검수 → `review:content`, 둥지 새끼 특징 콘텐츠 답 대기
- **#124** (→engine) 훈련 스탯 선택지 ID. 잠정: `훈련 ▾` 펼침 = `action.train.<스탯>` 가정

## 최근 완료
- **PR #123 열음** — `docs/ux/wireframes/mid/` HTML 5장(토큰·아이콘 실제 사용, 550선), `docs/ux/screens.md` 4.1장(바뀐 것·잠정 표), S-11 → M2 표기
- 짝 지시 흐름은 `00-core-loop` 3장 순서(행동 → 지시 있으면 번식 패널)로 그림 — 디자인에 확인 요청(PR 본문)
- #113 닫힘 확인(머지 전 worktree 떼기 규칙이 01-collaboration 8장에 들어감)

## 막힘 (무엇을 · 누구를 기다리는지)
- 박새 그림 → **대표 #111** · 둥지 새끼 특징 → **콘텐츠 #95** · 와이어프레임 리뷰 → **디자인·클라이언트 #123** · 훈련 ID → **엔진 #124**

## 다음 근무에서 할 일
1. **#123 리뷰 의견** 반영 → 라벨 다 떼어졌으면 머지(update-branch·CI 확인 → worktree 떼기 → merge 단독). 머지되면 #25 와이어프레임 체크
2. **#111 완료 댓글이 왔으면** → 검수(프롬프트 파일의 '검수 순서'; field-marks 거부 기준 6개부터). Pillow로 비교 시트 → 통과 후보 후처리(`style-guide.md` 5장: 생성 도구 표시 지우기, 768px WebP ≤150KB, 출처 기록) → `assets/bird/` PR + `review:content`. 실패가 많으면 프롬프트 고쳐 재요청. 이때 batch-01 inbox 정리도
3. **#95에 둥지 새끼 특징이 오면** → 배치 03(`chick.nest`)
4. #124 답 → 다르면 01-main-turn 훈련 펼침 수정. 디자인 `04-breeding`·`05-inheritance`가 오면 03·04의 잠정 칸 수정
5. `review:art` PR 확인

## 메모 (다음 근무의 나에게)
- **머지 전에 worktree를 브랜치에서 뗄 것**: `git -C C:/dev/wb-art switch --detach origin/main` (별도 명령) → `gh pr merge <번호> --squash --delete-branch` 단독. 라운드 5에 이걸 안 해서 gh가 **wb-art worktree를 통째로 지웠다**(#113). 복구는 `git worktree prune` → `git worktree add --detach C:/dev/wb-art origin/main`. 복구한 worktree에는 **node_modules가 없다** — 필요하면 `npm install`.
- 토큰 `paper`·`sage-strong` 값을 바꾸면 `apps/web/index.html` theme-color와 `manifest.webmanifest`도 같이 바뀌어야 한다(CSS 변수를 못 쓰는 곳, #103).
- **Pillow(Python)가 대표 PC에 있다** — WebP 읽기·쓰기·크기 변환·시트 만들기 다 된다. ImageMagick·cwebp는 없다. **후처리 도구로 확정**(`style-guide.md` 5장). 스크립트는 첫 실제 에셋 처리 때 `scripts/art/`에.
- 배치 01 원본(2048px PNG)은 저장소 밖 `C:\dev\wild-bird-originals\batch-01\`. inbox의 9장은 비교 시트(`docs/art/style-test/`)로 기록이 남았으니 박새 배치 02를 처리할 때 함께 정리해도 된다.
- Gemini는 **비율 지시를 무시한다**(4:5 → 1:1). 그리고 **박새를 유럽 박새처럼 노란 배로 그린다**. 다음 프롬프트에 부정어를 넣을 것.
- Chrome headless: `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --allow-file-access-from-files --window-size=W,H "--screenshot=<스크래치패드>/x.png" "file:///…"`. 출력은 스크래치패드로.
- 이 worktree에서 `npm run lint`가 `version.json` CRLF로 실패한다 — 로컬 줄바꿈 문제, main CI는 초록. 내 파일만 `npx biome check <경로>`로 확인.
- SVG는 Write 도구로(heredoc 금지). 와이어프레임·실루엣은 반드시 렌더해서 볼 것.
- 중충실도 와이어프레임: `wf.css` 공통, 화면 안은 토큰만. 렌더는 창 1600×1100 정도, `--allow-file-access-from-files` 필수(아이콘 mask·토큰 @import).
