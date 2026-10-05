# 엔진 상태

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-06 (라운드 8)
- 현재 마일스톤: M0 대표 승인 대기(#115) · M1 진행(#21)

## 진행 중
- #21 M1 — 단계 판정 조각 머지(#144). 다음은 관문 조각(아래 2번)
- #121 남은 것 = `act` 관문 흐름(#21 관문 조각에서)

## 최근 완료 (라운드 8)
- **#131 머지**(포식자 스키마) · **#132 머지**(breeding.json 스키마) — #132는 main(#131)과 `load.ts`·03-contracts 충돌 해결 후
- **#144 머지**(#21 조각): `RunState`에 그 해 단계표 사본(`calendar`)·`node`·`stay`, 개체 `potential`·`feather`·`expYears` / `getChoices` 평평한 목록(`action.*` · `action.train.<스탯>` · `move.<장소>`) / `act` 판정 1·2·3 + 아사·포식 + `decision`·`death` 로그 / `period 1` 진입(나이·경험·노화·단계표 초기화) / `getView`에 `phase`·`node`·`energyCap` / `SAVE_VERSION` 2. 판정 코드는 `packages/engine/src/step.ts`(`judgeStep` — preview·act 공유)
- **#143 열음**(design): 겨울 에너지 수지가 모든 장소에서 음수 → 무작위 봇 평균 0.22년, 탐욕 봇 0.33년, 거의 전부 아사. + 런 시작 스탯 잠정 결정 요청

## 막힘 (무엇을 · 누구를 기다리는지)
- #143 ← design (밸런스 데이터 · 런 시작 스탯). 엔진 일은 막히지 않음

## 다음 근무에서 할 일
1. #143 결정이 오면 런 시작 스탯 잠정(#21) 반영(`api.ts` newRun)
2. **#21 관문 조각** — 03-contracts 3장: 관문이 열려 있으면 관문 선택지만. 계절 방침(시기 5·11·17·23 첫 단계) · 짝 후보(`pairing` 첫 단계, 04-breeding 2장) · 둥지 자리 · 산란수 · 짝 지시(판정 1 전) · 육아 방침(`Choice.items` 잠정 #121) · 둥지 국면 `move.*` disabled. 관문 대기 상태를 `RunState`에 둔다
3. 그다음: 번식(둥지 손실·새끼 사망·은수저·유전 — 정규분포 표본 ADR) · 독립 → 점수 · 계승 · 재번식/분할 해제(4.4·4.5) · 이벤트 해석기(foodMod·riskMod·부상)
4. #81 QA 답 확인
5. main lint 경고 1건(`load.ts` runStart.node optional chain) — 그 줄을 고칠 때 같이
6. 성능 재측정(#47): 무작위 봇 200판 6초(짧은 판). 판이 길어지면 `act`의 로그 배열 전체 복사를 다시 본다

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
