# 아트·UX 상태

> 이 파일은 아트·UX 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: **2026-10-05 (라운드 8, 2회째)**
- 현재 마일스톤: M1 #25 진행 (와이어프레임 끝 · 남은 것은 박새 이미지 #111)

## 진행 중
- **#25 (M1)** — 와이어프레임 끝(#123 · #135 머지). 남은 것: 박새 이미지 → **배치 02 #111** 대표 대기. 둥지 새끼는 #95 → 배치 03
- **#95 (열어 둠)** — 그림 검수 → `review:content`, 둥지 새끼 특징 콘텐츠 답 대기

## 최근 완료
- 라운드 8: **#135 머지**(design 승인 댓글, 확인 4개 모두 채택) → #129 닫힘
- #124 엔진 답: 잠정 가정 `action.train.<스탯>` 그대로 맞음 → 01-main-turn 수정 불필요, 이슈 닫힘
- #123 머지됨(PM 대행, 라운드 7)

## 막힘 (무엇을 · 누구를 기다리는지)
- 박새 그림 → **대표 #111** · 둥지 새끼 특징 → **콘텐츠 #95**

## 다음 근무에서 할 일
1. **#111 완료 댓글이 왔으면** → 검수(프롬프트 파일의 '검수 순서'; field-marks 거부 기준 6개부터). Pillow로 비교 시트 → 후처리(`style-guide.md` 5장) → `assets/bird/` PR + `review:content`. batch-01 inbox 정리도
2. **#95에 둥지 새끼 특징이 오면** → 배치 03(`chick.nest`)
3. `05-inheritance`가 오면 04-inherit의 잠정 칸 수정
4. `review:art` PR 확인

## 메모 (다음 근무의 나에게)
- **머지는 `bash scripts/merge-pr.sh <번호>` 단독**(01-collaboration 8장). 그 전에 worktree를 브랜치에서 뗄 것: `git -C C:/dev/wb-art switch --detach origin/main` (별도 명령). 라운드 5에 이걸 안 해서 gh가 **wb-art worktree를 통째로 지웠다**(#113). 복구는 `git worktree prune` → `git worktree add --detach C:/dev/wb-art origin/main`. 복구한 worktree에는 **node_modules가 없다** — 필요하면 `npm install`.
- 토큰 `paper`·`sage-strong` 값을 바꾸면 `apps/web/index.html` theme-color와 `manifest.webmanifest`도 같이 바뀌어야 한다(CSS 변수를 못 쓰는 곳, #103).
- **Pillow(Python)가 대표 PC에 있다** — WebP 읽기·쓰기·크기 변환·시트 만들기 다 된다. ImageMagick·cwebp는 없다. **후처리 도구로 확정**(`style-guide.md` 5장). 스크립트는 첫 실제 에셋 처리 때 `scripts/art/`에.
- 배치 01 원본(2048px PNG)은 저장소 밖 `C:\dev\wild-bird-originals\batch-01\`. inbox의 9장은 비교 시트(`docs/art/style-test/`)로 기록이 남았으니 박새 배치 02를 처리할 때 함께 정리해도 된다.
- Gemini는 **비율 지시를 무시한다**(4:5 → 1:1). 그리고 **박새를 유럽 박새처럼 노란 배로 그린다**. 다음 프롬프트에 부정어를 넣을 것.
- Chrome headless: `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --allow-file-access-from-files --window-size=W,H "--screenshot=<스크래치패드>/x.png" "file:///…"`. 출력은 스크래치패드로.
- 이 worktree에서 `npm run lint`가 `version.json` CRLF로 실패한다 — 로컬 줄바꿈 문제, main CI는 초록. 내 파일만 `npx biome check <경로>`로 확인.
- SVG는 Write 도구로(heredoc 금지). 와이어프레임·실루엣은 반드시 렌더해서 볼 것.
- 중충실도 와이어프레임: `wf.css` 공통, 화면 안은 토큰만. 렌더는 창 1600×1100 정도, `--allow-file-access-from-files` 필수(아이콘 mask·토큰 @import).
