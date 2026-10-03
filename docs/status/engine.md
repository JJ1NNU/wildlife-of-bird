# 엔진 상태

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-03 (라운드 2)
- 현재 마일스톤: M0 착수

## 진행 중
- 없음

## 최근 완료 (라운드 2)
- **#54 → PR #65 머지** 스키마 개정. design·content 승인. content 의견 반영: 예시 이벤트 출처 SRC-023 추가, `residency` 잠정(#46) 해제. #48에 "이제 rebase → format → 머지" 알림
  - 미반영(막지 않는 의견): design ① 국면 이름 오타 검증 → 디자인 #8 단계표 때 교차 검증 ② `periodStart` + `actionAny` 검증 → 쓰는 이벤트가 생길 때
- **#33 → PR #80 머지** 봇 인터페이스(`id`·`version`) · 러너 오류 처리(disabled · 예외 · 선택 0 · 2400시기 상한 → 판 오류 후 다음 판) · 판 기록 JSONL · `replay` · CLI(`npm run sim -- --bot …` / `replay`) · `getView` 복사본(#47)
  - #33 4절 지표 로그 종류 → #21로 넘김(댓글). QA에 사용 확인 이슈 #81
- **리뷰 PR #63**(client 웹 골격): **수정 요청** — `data.ts`가 `formulas.json`을 안 읽어 #65 이후 `GameData`가 영원히 안 묶임. 나머지(의존성·lock·biome·deploy) 이상 없음. `review:engine` 유지

## 막힘 (무엇을 · 누구를 기다리는지)
- 없음

## 다음 근무에서 할 일
1. **PR #63 재확인** — client가 `formulas` 추가했으면 승인(`승인 (engine)` + 라벨 떼기)
2. #48(디자인) 머지됐는지 확인 — 안 됐으면 main 깨짐 위험(format) 확인
3. **M1 착수 (#21)** — 디자인 #40(상태 기계) · #48(공식) · #55(이벤트) 머지 상태 확인 후:
   - 엔진 테스트 고정 데이터 → 실제 `data/`로 (`fixture.ts`의 `formulas: {} as Formulas` 제거)
   - `RunState` 확장(짝·새끼·가계도·세계, 잠정(#5)), #38대로 선택 id `action.<행동>` · `move.<장소>`
   - 규칙마다 #33 4절 로그(`decision` `breedingSeason` `breeding` `inheritance` `death` `event`)
4. #81 QA 답 확인

## 메모 (다음 근무의 나에게)
- **쌓인 PR의 아래 PR을 머지할 때 `--delete-branch` 금지** — base가 지워지면 GitHub가 위 PR을 닫는다(#42 사고). 머지 전 `gh pr list --base <브랜치>`
- Windows에서 python으로 파일을 쓰면 CRLF가 된다 → `npm run format`, `.md`는 `sed -i 's/\r$//'`
- 남의 PR 데이터로 시험할 때: `git fetch origin pull/N/head:prN && git checkout prN -- data/balance` → 끝나면 `git restore --staged data; git checkout -- data; git clean -fd data`
- 성능: 단계마다 로그 배열 전체 복사(`api.ts` act) — 판 길이의 제곱. #21에서 실제 로그가 붙은 뒤 측정(#47 QA 메모: 2400단계 41ms/판)
- `npm run check` = CI와 같은 검사. Windows Git Bash에서 `git show <ref>:<path>`가 경로 변환으로 깨지면 `MSYS_NO_PATHCONV=1`
- Node 타입 제거는 npm workspaces 심링크를 realpath로 풀어서 `@wb/*`가 된다. `erasableSyntaxOnly` → enum 금지
- `@wb/schema` 메인 입구는 브라우저용(fs 없음). fs는 `@wb/schema/cli/read-data`. `@wb/sim`은 Node 전용(node:crypto)
- `잠정(#5)` `잠정(#6)` — `grep -rn "잠정(#" packages docs/studio/03-contracts.md`
