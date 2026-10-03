# 엔진 상태

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-04 (라운드 3)
- 현재 마일스톤: M0 착수 → M1 착수(#21)

## 진행 중
- **PR #96** `01-formulas` v0 공식 1~8장 + 명세 예시 테스트(28) + 화면 표시 함수(`formatRisk` 등) + disabled 선택 거부(#47). 테스트 고정 데이터 → 실제 `data/`. update-branch 후 CI 통과 — **머지만 남음**(이 세션 `gh pr merge` 자동 승인 모드에 막힘 → PM/대표에게 부탁 댓글)
- **PR #100** (#91) 단계표 스키마 · 국면 열거 `Phase` · 교차 검증 · `phaseLastStep` · `moltDelayPeriods` 삭제. **#94(design) 위에 쌓음** → #94 머지 뒤 base를 main으로 바꾸고 머지. `review:design` `review:content` `review:client`
- #21 M1 — 다음 조각 계획은 아래

## 최근 완료 (라운드 3)
- 리뷰: **#77 승인**(lifespan 스키마, `UnresolvedFact`는 계약이라 남김) · **#78 승인**(`@wb/tokens`, #63과 lock 충돌 — 나중 머지 쪽이 `npm install`로) · **#63 재확인: 아직 `formulas` 미반영 → 수정 요청 유지** + #100 이후 `calendar` glob도 필요하다고 알림
- #8에 단계표 형식 제안 → 디자인 #94와 엇갈림 → **#94 형식 채택**(정정 댓글). #23에 장소 데이터 요구(계절별 먹이·위험·**경쟁** 등급, 양방향 links, 시작 장소)

## 막힘 (무엇을 · 누구를 기다리는지)
- 머지 권한: #96 머지 대기(PM/대표)
- `data/nodes/` 첫 파일(content #23) — 판정 1·3을 `act`에 붙이려면 장소의 먹이·위험·경쟁 등급이 필요

## 다음 근무에서 할 일
1. #96 · #100 머지 확인(#100은 #94 머지 후 base 변경 → update-branch → CI → 머지). 리뷰 의견 반영
2. #63 재확인 — `formulas` + `calendar` glob 들어왔으면 승인
3. **#21 다음 조각** — `RunState` 확장(달력: 그 해 단계표 사본·시기 안 단계, 장소·연속 체류, 깃털, 잠재력, 경험 연수) → `getChoices` 평평한 목록(`action.<행동>` 6개 + `move.<장소>`) → `act`에 판정 1·2·3(에너지→스탯→위험) + 아사·포식 사망으로 런 종료 + `decision`·`death` 로그 + 00-core-loop 3.1 예시 테스트. 장소 파일이 없으면 엔진 테스트 고정 장소로(실제 `data/`는 안 건드림)
4. 그다음: 관문(4.6) · 재번식/분할 해제(4.4·4.5) · 번식 · 계승 · 점수 · 이벤트 해석기. 2차 번식 관문 kind = `secondBrood`(Choice kind에 추가)
5. #81 QA 답 확인

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
