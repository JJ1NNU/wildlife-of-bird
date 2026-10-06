# 아트·UX 상태

> 이 파일은 아트·UX 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: **2026-10-07 새벽 (라운드 12 끝 뒤, 자동 근무)**
- 현재 마일스톤: M1 #25 진행 (와이어프레임 끝 · 박새 성조 암수·어린 새 완료 · 둥지 새끼 배치 03 프롬프트 머지 #178 · 루틴 와이어프레임 PR #193)

## 진행 중
- **#179 직접 생성(대표 결정)** — Gemini API 스크립트 `scripts/art/gen-image.py` 머지(#184). 이미지 모델 4종 무료 한도 0(429) → 결제 승인 요청 **#183**(`needs:ceo`)
- **#187 / PR #193** — 루틴용 S-10·S-12 `docs/ux/wireframes/mid/06-routine.html`(A 확인 / B 칸 고치기 / C 자동 재생 / D 이벤트 뒤). 결과 진행 = **이어서 자동 재생** 결정 → 디자인 5.4 재계산 요청. `review:design`·`review:client`
- **#95** — 배치 03 프롬프트 머지(#178). 생성은 #183 승인 뒤 아트가 직접. 등 전체 초록이면 탈락(콘텐츠)

## 최근 완료
- 라운드 12 뒤 자동: **#178 머지**(콘텐츠 승인) · #187 → PR #193
- 라운드 11 야간: **#149 머지** (디자인 승인, 잠정(#138) 표시 지움) → #140 닫힘. femaleShare(#153)는 화면 숫자에 영향 없음
- 라운드 11: **#146 머지** (콘텐츠 승인, asset-list 3장 `완료`)
- 라운드 10: 배치 02 후처리 스크립트 `scripts/art/process-bird.py`(표시 지우기·종이색·0.35·발끝 92%·WebP) · #146 · #149
- 라운드 8: #135 머지 → #129 닫힘 · #124 닫힘

## 막힘 (무엇을 · 누구를 기다리는지)
- PR #193 → 디자인·클라이언트 리뷰
- #183 → 대표 결제 승인(Gemini 유료 등급)

## 다음 근무에서 할 일
1. #183 승인되면: `PYTHONIOENCODING=utf-8 python scripts/art/gen-image.py <프롬프트.txt> C:/dev/wild-bird-originals/<배치>/<파일>.png` 로 박새 수컷 시험 1장(프롬프트는 batch-02 수컷 블록) → 배치 02와 비교 → PR(`review:content`) → 비교표·art.md 7장(PM 리뷰)·gdd 21번(디자인) 요청. 거절이면 Canva generate-image·SVG 대안 비교
2. PR #193 리뷰 반영·머지(`잠정(#187)` 위험 합 띠는 디자인 답 기다림). 머지 뒤 #187 닫기
3. 배치 03은 #183 승인 뒤 **아트가 직접 생성**(#179) — 프롬프트 `docs/art/prompts/batch-03-parus-minor-chick.md`
4. `review:art` PR 확인 · #25 M1 남은 것 점검

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
