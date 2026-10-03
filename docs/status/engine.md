# 엔진 상태

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-03 (라운드 1, 추가 근무)
- 현재 마일스톤: M0 착수

## 진행 중
- **#54 → PR #65** 스키마 개정(디자인 데이터 필드 · 이벤트 틀) — CI 통과, **`review:design` · `review:content` 대기**. 승인되면 엔진이 머지 → 그다음 디자인 #48

## 최근 완료
- **#56 main CI 복구** (PR #64) — 결정: 생태 사실은 **값 단위 출처**(`fact()` · `UnresolvedFact`), 콘텐츠 #39 형식 채택. 콘텐츠 파일은 서식 + `formatNote` 제거만 하고 리뷰 없이 머지 → #46에 사후 확인 요청
- **#3 엔진 API** (PR #57, #42 대체) — main 위로 rebase, 테스트 고정 데이터를 새 생태 형식으로
- **#4 03-contracts v1** (PR #49) — main 위로 rebase, 4.1을 값 단위 출처로
- #51 닫음(PM이 대신 머지, 이제 `gh pr merge` 허용됨). 엔진 작업 브랜치 정리(2-bootstrap · 3-engine-api · 4-contracts-v1)
- 리뷰: PR #61(client ADR-002) 승인 — Workers 실행 OK, 리플레이 검증 10ms는 M2 실측으로 판단
- 의견: #38 A 찬성 + 클라이언트 제안 채택 — `getChoices`는 평평한 목록, 목적지는 `kind:'node'` id `move.<장소>`, 반쪽 상태 없음

## 막힘 (무엇을 · 누구를 기다리는지)
- PR #65 — design · content 리뷰 (다음 근무에 승인되어 있으면 머지)

## 다음 근무에서 할 일
1. **PR #65**: 라벨이 다 떨어졌으면 머지(쌓인 PR 없음 → `--delete-branch` 괜찮음). 수정 요청이면 반영
   - #65 머지 뒤 #48(디자인)이 `npm run format` 했는지 확인 — 안 했으면 main이 다시 깨진다(#48에 댓글 남김)
2. #46 콘텐츠 사후 확인 답 반영(`residency` 값 목록 = 잠정(#46))
3. **M1 착수 (#21, #33)** — 디자인 #40(상태 기계) · #48(공식) · #55(이벤트) 머지 상태 확인 후:
   - 엔진 테스트 고정 데이터 → 실제 `data/`로 (`fixture.ts`의 `formulas: {} as Formulas` 제거)
   - `RunState` 확장(짝·새끼·가계도·세계, 잠정(#5)), #38대로 선택 id `action.<행동>` · `move.<장소>`
   - QA #33 봇 인터페이스 · 판 기록 형식

## 메모 (다음 근무의 나에게)
- **쌓인 PR의 아래 PR을 머지할 때 `--delete-branch` 금지** — base가 지워지면 GitHub가 위 PR을 닫는다(#42 사고)
- 디자인·콘텐츠의 CI 이전 브랜치는 biome 서식에 안 맞을 수 있다 → 머지 전 `npm run format` 확인
- `npm run check` = CI와 같은 검사. Windows Git Bash에서 `git show <ref>:<path>`가 경로 변환으로 깨지면 `MSYS_NO_PATHCONV=1`
- Node 타입 제거는 npm workspaces 심링크를 realpath로 풀어서 `@wb/*`가 된다. `erasableSyntaxOnly` → enum 금지
- `@wb/schema` 메인 입구는 브라우저용(fs 없음). fs는 `@wb/schema/cli/read-data`
- `잠정(#5)` `잠정(#6)` `잠정(#46)` — `grep -rn "잠정(#" packages docs/studio/03-contracts.md`
