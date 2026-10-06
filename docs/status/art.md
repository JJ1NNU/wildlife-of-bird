# 아트·UX 상태

> 이 파일은 아트·UX 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: **2026-10-06 (라운드 10)**
- 현재 마일스톤: M1 #25 진행 (와이어프레임 끝 · 박새 이미지 생태 검토 대기 #146)

## 진행 중
- **#146** 박새 배치 02 3장 후처리(`assets/bird/`) + batch-01 inbox 정리 → `review:content`. 아트 사전 검수: 2(세로줄 끝)·4(등 초록) **경계**
- **#149** S-24 계승 · S-03 런 시작 와이어프레임(#140) → `review:design`. **잠정(#138)** — 05가 바뀌면 따라 고침
- **#95 (열어 둠)** — 둥지 새끼 특징 콘텐츠 답 대기 → 배치 03

## 최근 완료
- 라운드 10: 배치 02 후처리 스크립트 `scripts/art/process-bird.py`(표시 지우기·종이색·0.35·발끝 92%·WebP) · #146 · #149
- 라운드 8: #135 머지 → #129 닫힘 · #124 닫힘

## 막힘 (무엇을 · 누구를 기다리는지)
- 박새 그림 생태 검토 → **콘텐츠 #146** · 둥지 새끼 특징 → **콘텐츠 #95** · 05-inheritance → **엔진 리뷰 #138**

## 다음 근무에서 할 일
1. **#146 리뷰** — 승인 → 머지, asset-list 상태 `완료`. 거부된 장은 배치 02b 요청(프롬프트에 "belly stripe visible to undertail", 등 초록 더 줄이기)
2. **#149 리뷰** 반영 → 머지. #138이 바뀌면 숫자·행 맞추기
3. #95에 둥지 새끼 특징이 오면 → 배치 03(`chick.nest`)
4. `review:art` PR 확인

## 메모 (다음 근무의 나에게)
- **후처리**: `PYTHONIOENCODING=utf-8 python scripts/art/process-bird.py <원본.png> <출력.webp> --toe-y <발끝 y> --watermark`. 발끝 y는 원본에서 직접 확대해 잰다(배치 02: 수 1480 · 암 1470 · 어린 1490). 결과 약 6KB.
- `assets/inbox/batch-02/` PNG 3장은 **추적 안 된 채** wb-art에 남아 있다(원본은 `C:\dev\wild-bird-originalsbatch-02\`). 커밋하지 말 것 — #146 머지 뒤 대표에게 지워도 된다고 알리거나 그대로 둔다.

- **머지는 `bash scripts/merge-pr.sh <번호>` 단독**(01-collaboration 8장). 그 전에 worktree를 브랜치에서 뗄 것: `git -C C:/dev/wb-art switch --detach origin/main` (별도 명령). 라운드 5에 이걸 안 해서 gh가 **wb-art worktree를 통째로 지웠다**(#113). 복구는 `git worktree prune` → `git worktree add --detach C:/dev/wb-art origin/main`. 복구한 worktree에는 **node_modules가 없다** — 필요하면 `npm install`.
- 토큰 `paper`·`sage-strong` 값을 바꾸면 `apps/web/index.html` theme-color와 `manifest.webmanifest`도 같이 바뀌어야 한다(CSS 변수를 못 쓰는 곳, #103).
- **Pillow(Python)가 대표 PC에 있다** — WebP 읽기·쓰기·크기 변환·시트 만들기 다 된다. ImageMagick·cwebp는 없다. **후처리 도구로 확정**(`style-guide.md` 5장). 스크립트는 첫 실제 에셋 처리 때 `scripts/art/`에.
- 배치 01 원본(2048px PNG)은 저장소 밖 `C:\dev\wild-bird-originals\batch-01\`. inbox의 9장은 비교 시트(`docs/art/style-test/`)로 기록이 남았으니 박새 배치 02를 처리할 때 함께 정리해도 된다.
- Gemini는 **비율 지시를 무시한다**(4:5 → 1:1). 그리고 **박새를 유럽 박새처럼 노란 배로 그린다**. 다음 프롬프트에 부정어를 넣을 것.
- Chrome headless: `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --allow-file-access-from-files --window-size=W,H "--screenshot=<스크래치패드>/x.png" "file:///…"`. 출력은 스크래치패드로.
- 이 worktree에서 `npm run lint`가 `version.json` CRLF로 실패한다 — 로컬 줄바꿈 문제, main CI는 초록. 내 파일만 `npx biome check <경로>`로 확인.
- SVG는 Write 도구로(heredoc 금지). 와이어프레임·실루엣은 반드시 렌더해서 볼 것.
- 중충실도 와이어프레임: `wf.css` 공통, 화면 안은 토큰만. 렌더는 창 1600×1100 정도, `--allow-file-access-from-files` 필수(아이콘 mask·토큰 @import).
