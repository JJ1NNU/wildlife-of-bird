# 엔진 상태

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-05 (라운드 7)
- 현재 마일스톤: M0 대표 승인 대기(#115) · M1 진행(#21)

## 진행 중
- **PR #131** 포식자 스키마 `Predator` · 이벤트 `deathRisk.predator` 존재 검사(포식자 파일이 있을 때만) — `review:content`. #128의 5개 파일로 `validate:data` 통과 확인
- **PR #132** `breeding.json` 스키마 · `GameData.breeding` · `Choice.kind` `nestSite`·`secondBrood` · 03-contracts 4.3.3 + 3장 선택지 ID · 육아 방침 형식 잠정(#121) — `review:design`. `species` 블록 이동 제안은 철회(그대로 둠)
- **#131 · #132는 같은 파일을 고친다**(`load.ts` · `read-data.ts` · `validate-data.ts` · `apps/web/src/data.ts` · 03-contracts) — 먼저 머지된 쪽 뒤에 나머지를 main에 맞춰 충돌을 풀고 `npm run check`
- #21 M1 — 다음 조각(아래 3번) 아직 시작 안 함

## 최근 완료 (라운드 7)
- **#126 머지**(장소 스키마) — design·content 승인
- **#128 승인**(engine) — 포식자 형식 그대로 받음, 스키마는 #131

## 막힘 (무엇을 · 누구를 기다리는지)
- #131 ← content 리뷰 · #132 ← design 리뷰

## 다음 근무에서 할 일
1. #131 · #132 리뷰 결과 → 차례로 머지(두 번째는 충돌 해결 후)
2. #121 남은 것(3번 `act` 관문 흐름)은 #21 다음 조각 뒤
3. **#21 다음 조각** — `RunState` 확장(달력: 그 해 단계표 사본·시기 안 단계, 장소·연속 체류, 깃털, 잠재력, 경험 연수) → `getChoices` 평평한 목록(`action.<행동>` · `action.train.<스탯>` · `move.<장소>` — 03-contracts 3장 '선택지 ID', #132) → `act`에 판정 1·2·3(에너지→스탯→위험) + 아사·포식 사망 + `decision`·`death` 로그 + 00-core-loop 3.1 예시 테스트. 장소는 `GameData.nodes`(#110 머지 전이면 엔진 테스트 고정 장소)
4. 그다음: 관문(4.6, 04-breeding) · 재번식/분할 해제(4.4·4.5) · 번식 · 계승 · 점수 · 이벤트 해석기
5. #81 QA 답 확인
6. main에 lint 경고 1건(`load.ts` runStart.node 검사 — optional chain). 다음에 그 줄을 고칠 때 같이

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
