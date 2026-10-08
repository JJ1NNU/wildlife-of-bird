# 아트·UX 상태

> 이 파일은 아트·UX 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

기다림: 대표 #274(배치 03 그림) · 클라이언트 리뷰 #399(UI 키트)

- 마지막 근무: **2026-10-09 (라운드 43 자동)**
- 현재 마일스톤: M1 #25 — 완료 조건 4개 충족 댓글 남김, 닫기는 PM 판단
- **이미지 생성 = 대표**(D-025, #264). 아트는 프롬프트(`type:human` 이슈)·선별·후처리·통합 — `docs/agents/art.md` 7장

## 진행 중
- **#396 UI 키트** — PR #399 `docs/art/ui-kit.md`(review:client). 4장 차이 표(.step 32px 등)는 M3 때 클라이언트가
- **#274 배치 03**(둥지 안 새끼 2장) — 대표 생성 대기(`type:human`). 올라오면 검수(#95 N1~N3)

## 최근 완료
- 라운드 44 자동: **#399 PR**(#396 UI 키트 — 지금 있는 컴포넌트만)
- 라운드 43 자동: **#383 승인**(S-13 잠정 장면 — scene 규칙 맞음. 참고: ev-art 96px, 최종 bird webp는 알파 없음 → 띠에는 scene.*만)
- 라운드 38 뒤 자동: **#367 승인**(S-13 시트 겹침 — mid/02와 맞음, `ev-art`는 그림 온 뒤)
- 라운드 25 뒤 자동: **#289 승인**(평시 7·8칸 — 8칸 ≈38×52px, 터치 44 폭 예외 허용·두 줄보다 나음)
- 라운드 24 뒤 자동: **#95 닫음**(프롬프트·실루엣이 field-marks 따름 확인) · #25에 완료 조건 충족 댓글
- 라운드 24 자동: **#264** — 배치 03 대표용 이슈 #274 · #183·#179 닫음 · **#279 머지**(gen-image.py 삭제, style-guide 5.1 대표 생성으로) → #264 닫힘
- 라운드 14 끝 뒤 자동 2: **#206 머지**(06-routine 칸 단위 숫자)
- 라운드 13 뒤 자동 2: **#193 머지** → #187 닫힘
- 라운드 12 뒤 자동: **#178 머지**(배치 03 프롬프트)
- 라운드 11: #146 · #149 머지 / 라운드 10: `scripts/art/process-bird.py`

## 막힘 (무엇을 · 누구를 기다리는지)
- #274 → 대표가 배치 03 그림 올리기

## 다음 근무에서 할 일
1. `assets/inbox/batch-03/`에 그림이 왔는지 확인(#274 `완료` 댓글) → 검수(`prompts/batch-03-parus-minor-chick.md` 검수 순서) → `process-bird.py`로 후처리(둥지 단면은 발끝 대신 단면 아래 여백 8% — 스크립트 옵션 확인) → PR `review:content`
2. #399 리뷰 오면 반영 → `bash scripts/merge-pr.sh 399`
3. `review:art` PR 확인 · #25 M1 남은 것 점검(아이콘 v0 등 완료 조건 체크)

## 메모 (다음 근무의 나에게)
- **후처리**: `PYTHONIOENCODING=utf-8 python scripts/art/process-bird.py <원본.png> <출력.webp> --toe-y <발끝 y> --watermark`. 발끝 y는 원본에서 직접 확대해 잰다(배치 02: 수 1480 · 암 1470 · 어린 1490). 결과 약 6KB.
- 아래꼬리덮깃이 보이는 자세(먹이 찾기·매달리기)를 그릴 땐 프롬프트에 "black stripe reaching undertail coverts" (콘텐츠, #146)
- `assets/inbox/batch-02/` PNG 3장은 **추적 안 된 채** wb-art에 남아 있다(원본은 `C:\dev\wild-bird-originals\batch-02\`). 커밋하지 말 것 — #146 머지됨(라운드 11), 지우는 일은 자동 근무에서 권한이 거부됨(라운드 11 야간) → 대표가 직접 지우거나 그대로 둔다. 커밋만 하지 말 것.

- **머지는 `bash scripts/merge-pr.sh <번호>` 단독**(01-collaboration 8장). 그 전에 worktree를 브랜치에서 뗄 것: `git -C C:/dev/wb-art switch --detach origin/main` (별도 명령). 라운드 5에 이걸 안 해서 gh가 **wb-art worktree를 통째로 지웠다**(#113). 복구는 `git worktree prune` → `git worktree add --detach C:/dev/wb-art origin/main`. 복구한 worktree에는 **node_modules가 없다** — 필요하면 `npm install`.
- 토큰 `paper`·`sage-strong` 값을 바꾸면 `apps/web/index.html` theme-color와 `manifest.webmanifest`도 같이 바뀌어야 한다(CSS 변수를 못 쓰는 곳, #103).
- **Pillow(Python)가 대표 PC에 있다** — WebP 읽기·쓰기·크기 변환·시트 만들기 다 된다. ImageMagick·cwebp는 없다. **후처리 도구로 확정**(`style-guide.md` 5장). 스크립트는 첫 실제 에셋 처리 때 `scripts/art/`에.
- 배치 01 원본(2048px PNG)은 저장소 밖 `C:\dev\wild-bird-originals\batch-01\`. inbox의 9장은 비교 시트(`docs/art/style-test/`)로 기록이 남았으니 박새 배치 02를 처리할 때 함께 정리해도 된다.
- Gemini는 **비율 지시를 무시한다**(4:5 → 1:1). 그리고 **박새를 유럽 박새처럼 노란 배로 그린다**. 다음 프롬프트에 부정어를 넣을 것.
- Chrome headless: `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --allow-file-access-from-files --window-size=W,H "--screenshot=<스크래치패드>/x.png" "file:///…"`. 출력은 스크래치패드로.
- 이 worktree에서 `npm run lint`가 `version.json` CRLF로 실패한다 — 로컬 줄바꿈 문제, main CI는 초록. 내 파일만 `npx biome check <경로>`로 확인.
- SVG는 Write 도구로(heredoc 금지). 와이어프레임·실루엣은 반드시 렌더해서 볼 것.
- 중충실도 와이어프레임: `wf.css` 공통, 화면 안은 토큰만. 렌더는 창 1600×1100 정도, `--allow-file-access-from-files` 필수(아이콘 mask·토큰 @import).
