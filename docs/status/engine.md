# 엔진 상태

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-05 (라운드 6)
- 현재 마일스톤: M0 대표 승인 대기(#115) · M1 진행(#21)

## 진행 중
- **PR #126** 장소 스키마 `MapNode` · 연결 양방향 검사 · `runStart.node`(= `forest-edge`, 박새 밸런스) — `review:design`(runStart.node) · `review:content`(형식). CI ✅. #110의 5개 파일로 `validate:data` 통과 확인. 승인되면 `bash scripts/merge-pr.sh 126`
- #21 M1 — 다음 조각(아래 2번) 아직 시작 안 함

## 최근 완료 (라운드 6)
- **#100 머지**(#91 닫힘) — `apps/web/src/data.ts` calendar glob, #114 이벤트 위에서 국면 교차 검증 통과
- **#110 승인**(engine) — 스키마는 #126으로 분리(#110이 main과 `fact-check.md` 충돌 — 콘텐츠 문서라 엔진이 안 풂). 순서: #126 → #110 main 반영·충돌 해결
- **#120 승인**(engine) — 판정 전 관문 흐름, `parentingPolicy` 형식 잠정(아래), `breeding.json` `species` 블록은 종 밸런스로 옮기자고 #121에서 제안
- **#124 답·닫음** — 훈련 = `action.train.<스탯>`(aptitude 스탯마다, 맨 `action.train` 없음), 스탯마다 preview

## 막힘 (무엇을 · 누구를 기다리는지)
- #121 breeding 스키마 ← #120 머지(디자인)
- #126 ← design·content 리뷰

## 다음 근무에서 할 일
1. #126 리뷰 결과 → 머지
2. **#21 다음 조각** — `RunState` 확장(달력: 그 해 단계표 사본·시기 안 단계, 장소·연속 체류, 깃털, 잠재력, 경험 연수) → `getChoices` 평평한 목록(`action.<행동>` · 훈련은 `action.train.<스탯>` · `move.<장소>`) → `act`에 판정 1·2·3(에너지→스탯→위험) + 아사·포식 사망 + `decision`·`death` 로그 + 00-core-loop 3.1 예시 테스트. 장소는 #126 이후 `GameData.nodes`(#110 머지 전이면 엔진 테스트 고정 장소). `03-contracts` 3장에 선택지 ID 형식(#124) 적기
3. #120 머지되면 #121: `breeding.json` 스키마, `Choice.kind`에 `nestSite` `secondBrood`, `parentingPolicy` 형식 확정 — 잠정안: Choice 하나 + `items: { item, options, current, locked? }[]`, `act(state, 'parentingPolicy?intensity=mid&allocation=compete')`(빠진 항목 = 현재값). 판정 전 관문(짝 지시·육아 방침)이 열려 있으면 `getChoices`는 관문만 → 같은 단계에서 행동
4. 그다음: 관문(4.6) · 재번식/분할 해제(4.4·4.5) · 번식 · 계승 · 점수 · 이벤트 해석기
5. #81 QA 답 확인

## 메모 (다음 근무의 나에게)
- 머지는 `bash scripts/merge-pr.sh <번호>`(리뷰·CI 확인 포함). 그 전에 `git -C C:/dev/wb-engine switch --detach origin/main`(#113)
- 남의 PR 브랜치에서 남의 문서 충돌을 풀지 않는다(자동 모드가 막음) — 엔진 몫은 별도 PR로
- **쌓인 PR의 아래 PR을 머지할 때 `--delete-branch` 금지** — base가 지워지면 GitHub가 위 PR을 닫는다(#42 사고). 머지 전 `gh pr list --base <브랜치>`
- Windows에서 python으로 파일을 쓰면 CRLF가 된다 → `npm run format`, `.md`는 `sed -i 's/\r$//'`
- 남의 PR 데이터로 시험할 때: `git fetch origin pull/N/head:prN && git checkout prN -- data/balance` → 끝나면 `git restore --staged data; git checkout -- data; git clean -fd data`
- 성능: 단계마다 로그 배열 전체 복사(`api.ts` act) — 판 길이의 제곱. #21에서 실제 로그가 붙은 뒤 측정(#47 QA 메모: 2400단계 41ms/판)
- `npm run check` = CI와 같은 검사. Windows Git Bash에서 `git show <ref>:<path>`가 경로 변환으로 깨지면 `MSYS_NO_PATHCONV=1`
- Node 타입 제거는 npm workspaces 심링크를 realpath로 풀어서 `@wb/*`가 된다. `erasableSyntaxOnly` → enum 금지
- `@wb/schema` 메인 입구는 브라우저용(fs 없음). fs는 `@wb/schema/cli/read-data`. `@wb/sim`은 Node 전용(node:crypto)
- 유전 정규분포 표본은 아직 없음 — 번식 구현 때 시드 난수로(Box–Muller 등) 만들고 ADR에 남긴다(01-formulas 5장)
- `packages/schema` `table()`은 `const` 타입 인자여야 키가 살아 있다(#96)
- `잠정(#5)` `잠정(#6)` — `grep -rn "잠정(#" packages docs/studio/03-contracts.md`
