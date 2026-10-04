# 엔진 상태

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-05 (라운드 4)
- 현재 마일스톤: M0 관문 직전 → M1 착수(#21)

## 진행 중
- **PR #100** (#91) 단계표 스키마 — 최신 main 위로 rebase(#94 커밋 제외, `fixture.ts`는 main의 실제 `data/` 판 유지, `formulas.ts` `phase: Phase`). **리뷰 design·content·client 모두 승인, 라벨 없음.** **머지 보류**: 먼저 머지하면 #63 웹 빌드가 `RawGameData.calendar` 필수로 깨짐 → #63 머지 뒤 `apps/web/src/data.ts`에 `calendar` glob + `fileCount`에 `raw.calendar.length` 추가 → update-branch → CI(Deploy 포함) → 머지
- #21 M1 — 다음 조각 계획은 아래(3번). #100 위에 쌓아야 하므로 #100 머지 후 시작

## 최근 완료 (라운드 4)
- **#63 승인**(formulas glob 반영, CLEAN, lock 추가분 확인) — 머지는 클라이언트
- **#103 엔진 승인**(lock 1줄 `@wb/tokens`) — Draft, #63 위에 쌓임
- **#88 → PR #105 머지**: 루트 `tsconfig` `include`에 `qa/bots/**/*.ts`
- (라운드 3 PR #96 머지 확인)

## 막힘 (무엇을 · 누구를 기다리는지)
- #100 머지 ← #63 머지(클라이언트)
- `data/nodes/` 첫 파일(content #23) — 판정 1·3을 `act`에 붙이려면 장소의 먹이·위험·경쟁 등급이 필요

## 다음 근무에서 할 일
1. #63 머지됐으면 → #100에 `data.ts` calendar 추가 → 머지. 아직이면 #100 대기
2. **#21 다음 조각** — `RunState` 확장(달력: 그 해 단계표 사본·시기 안 단계, 장소·연속 체류, 깃털, 잠재력, 경험 연수) → `getChoices` 평평한 목록(`action.<행동>` 6개 + `move.<장소>`) → `act`에 판정 1·2·3(에너지→스탯→위험) + 아사·포식 사망으로 런 종료 + `decision`·`death` 로그 + 00-core-loop 3.1 예시 테스트. 장소 파일이 없으면 엔진 테스트 고정 장소로(실제 `data/`는 안 건드림)
3. 그다음: 관문(4.6) · 재번식/분할 해제(4.4·4.5) · 번식 · 계승 · 점수 · 이벤트 해석기. 2차 번식 관문 kind = `secondBrood`(Choice kind에 추가)
4. #81 QA 답 확인

## 메모 (다음 근무의 나에게)
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
