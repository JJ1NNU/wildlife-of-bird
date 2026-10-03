# 엔진 상태

> 이 파일은 엔진 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-03 (라운드 1, 첫 근무)
- 현재 마일스톤: M0 착수

## 진행 중
- **#2 → PR #41** ADR-001 · 저장소 뼈대 · CI · 스키마 v0 — CI 통과, **머지 대기**
- **#3 → PR #42** 엔진 API 골격 · 시드 난수 · sim 러너 — #41 위에 쌓임, CI 통과, 머지 대기
- **#4 → PR #49** 03-contracts v1 · CLAUDE.md 저장소 지도 — #42 위에 쌓임, CI 통과, 머지 대기

## 최근 완료
- ADR-001 결정: TS + npm workspaces + 빌드 없는 실행(Node 22.18+), React + Vite, Biome · Vitest · Zod
- `.github/workflows/ci.yml` — GitHub Actions에서 실제로 통과 확인(17초)
- 머지 후 리뷰 이슈: #44 client · #45 design · #46 content · #47 qa
- 디자인 질문: #37 이벤트 효과의 방향(gain/loss) 표기

## 막힘 (무엇을 · 누구를 기다리는지)
- **PR 머지 권한** — 이 세션의 자동 승인 모드가 `gh pr merge`를 막았다(PM #28과 같은 원인). 대표에게 요청: **#51**. 우회하지 않는다.

## 다음 근무에서 할 일
1. **#51 확인** — 머지됐으면 #2 #3 #4가 자동으로 닫혔는지 보고, 안 닫혔으면 닫는다. #51은 결과 확인 후 닫는다(type:human은 요청 부서가 닫음)
   - #42·#49는 쌓인 PR이다. #41이 **스쿼시** 머지되면 #42 브랜치에 원래 커밋이 남아 diff가 지저분해질 수 있다 → 필요하면 `git rebase --onto origin/main engine/2-bootstrap engine/3-engine-api` 후 force-push(작업 브랜치이므로 괜찮다), #49도 같은 방식
2. 머지 후 리뷰 반영: #44~#47 댓글, #37(design), `잠정(#46)`(residency 값)
3. M1 #21 착수 준비 — 디자인 #5(상태 기계) · #6(공식) 명세가 나왔는지 확인. 나왔으면 `RunState` 확장부터

## 메모 (다음 근무의 나에게)
- 명령은 `npm run check` 하나로 CI와 같은 검사. Windows에서도 통과(`.gitattributes`로 LF 고정)
- Node 타입 제거는 **node_modules 안의 .ts는 안 읽지만**, npm workspaces 심링크는 realpath로 풀려서 `@wb/*` 가져오기가 된다(실험으로 확인). `erasableSyntaxOnly` 켜져 있음 → enum 금지
- `@wb/schema`의 메인 입구는 브라우저용(fs 없음). fs가 필요한 건 `@wb/schema/cli/read-data` 서브패스로만
- Zod 메시지는 `locale.ts`에서 한국어로. 새 스키마 진입점이 생기면 `import './locale.ts'`
- `잠정(#5)` `잠정(#6)` `잠정(#37)` `잠정(#46)` — `grep -rn "잠정(#" packages docs/studio/03-contracts.md`로 찾는다
- 자리표시 엔진은 사망이 없어 sim이 maxSteps(2000)까지 돈다 — M0 예상 동작
