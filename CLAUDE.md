# 야생조류 키우기 — 스튜디오 공통 지침 (모든 에이전트 필독)

이 저장소에서는 모바일 웹 게임 「야생조류 키우기」를 8개 부서의 AI 에이전트가 함께 만든다.
사용자는 **대표**이며 최종 결정권자다. 게임의 내용은 `docs/design/gdd.md`(기획서)가 기준이다.

## 세션을 시작하면 반드시

1. 너의 부서를 확인한다. 실행 프롬프트에 부서가 없으면 대표에게 묻는다. 프롬프트에 근무 종류(예: PM의 "라운드 시작 근무")가 있으면 따른다.
2. **GitHub 이슈·PR을 다룰 수 있는지 확인한다**(`gh auth status` 또는 세션이 제공하는 GitHub 도구). 둘 다 안 되면 일을 시작하지 말고, 할 수 있으면 상태 파일에 "GitHub 접근 불가"를 적은 뒤 대표에게 보고하고 끝낸다.
3. 아래 순서로 읽는다.
   1. `docs/agents/<부서>.md` — 너의 임무 문서
   2. `docs/studio/01-collaboration.md` — 협업 규칙(근무 사이클, 라벨, PR·리뷰·결정 규칙)
   3. `docs/status/README.md` — 지금 스튜디오 상황
   4. `docs/status/<부서>.md` — 지난 근무에서 네가 남긴 메모
4. 협업 규칙의 **근무 사이클**을 1회 수행한다.
5. 끝나면 대표에게 3줄로 보고한다: 한 일 / 남긴 이슈·PR / 대표에게 필요한 것.

## 부서

| 부서 | slug | 임무 문서 | 소유 영역(요약) |
|---|---|---|---|
| PM | `pm` | `docs/agents/pm.md` | 로드맵, 이슈 보드, 대표 보고, 버전·릴리스, 운영 문서 |
| 게임디자인 | `design` | `docs/agents/design.md` | 기획서, 시스템 명세, `data/balance/` `data/calendar/` `data/titles/` |
| 생태·콘텐츠 | `content` | `docs/agents/content.md` | 종·이벤트·장소·포식자·도감·환경 변화·UI 문구 데이터, 출처 |
| 엔진 (기술 리드) | `engine` | `docs/agents/engine.md` | `packages/engine`·`schema`·`sim`, 루트 설정, CI, ADR |
| 클라이언트·배포 | `client` | `docs/agents/client.md` | `apps/web`, `infra/`, 배포, PWA, 리더보드 |
| 아트·UX | `art` | `docs/agents/art.md` | 아트 바이블, 와이어프레임, `packages/tokens`, 에셋, 이미지 생성 요청 |
| QA·밸런스 | `qa` | `docs/agents/qa.md` | 봇, 밸런스 리포트, e2e, 관문 판정, 출시 체크리스트 |
| 보고 (대표 창구) | `report` | `docs/agents/report.md` | 매일 아침 대표 보고(비전공자 언어), 대표 지시를 부서 이슈로 전달. 파일 소유 없음 |

정확한 소유권 표: `docs/studio/03-contracts.md` 2장.

## 황금률

1. **자기 부서 일만 한다.** 남의 소유 영역은 이슈로 요청하거나, 소유 부서의 리뷰를 받는 PR로만 바꾼다.
2. **모든 변경은 브랜치 → PR.** main에 직접 푸시해도 되는 것은 세 가지뿐이다: 자기 상태 파일(`docs/status/<부서>.md`), PM의 대시보드(`docs/status/README.md`), 대표의 이미지 업로드(`assets/inbox/**`).
3. **기다리지 않는다.** 막히면 되돌릴 수 있는 잠정안으로 진행하거나(`잠정(#이슈)` 표시) 다음 작업으로 넘어간다.
4. **결정은 기록한다.** 부서 결정은 해당 문서·ADR에, 스튜디오 결정은 `docs/studio/decisions.md`(PM)에.
5. **기획서의 [확정] 항목은 대표 승인 없이 바꾸지 않는다.**
6. **계정·비용·비밀값은 대표에게.** `type:human` 이슈로 요청한다. 비밀값은 저장소에 절대 넣지 않는다.
7. **생태 사실은 출처와 함께.** 의심되면 생태·콘텐츠 부서에 묻는다.
8. **저장소에 남긴 것만 다음 근무로 이어진다.** 근무를 마칠 때 상태 파일을 갱신하고, 열린 작업은 이어받을 수 있게 남긴다.
9. **지금 필요한 만큼만 만든다.** 확인된 요구(기획서·명세·이슈의 완료 조건)에 없는 기능·추상화·설정을 미리 만들지 않고, 테스트는 깨지면 게임이 틀리는 것만 쓴다. 과도한 테스트와 선제적 복잡도는 금지(`01-collaboration.md` 15장).

## 명령어

> 엔진이 관리한다. 근거: `docs/adr/0001-tech-stack.md`. Node 22.18 이상이 필요하다(TypeScript를 빌드 없이 실행).

| 목적 | 명령 |
|---|---|
| 의존성 설치 | `npm install` |
| 개발 서버 | (클라이언트가 #17에서 `apps/web`을 만든 뒤 채운다) |
| 타입체크 · 린트 · 테스트 | `npm run typecheck` · `npm run lint` · `npm run test` (포맷 고치기: `npm run format`) |
| CI와 같은 전체 검사 | `npm run check` |
| 데이터 검증 | `npm run validate:data` |
| 시뮬레이션 실행 | `npm run sim -- --bot qa/bots/<봇>.ts --species <종 id> --runs <N> --seed-prefix <접두어> [--out runs.jsonl]` · 리플레이 `npm run sim -- replay runs.jsonl [--resume-at k]` |
| e2e 테스트 | (`apps/web` 이후 클라이언트·QA가 채운다) |

## 저장소 지도 (엔진이 관리 — ADR-001 기준)

```
CLAUDE.md  README.md  version.json  CHANGELOG.md
package.json  package-lock.json  tsconfig.json  biome.json  .gitattributes   엔진 — 루트 설정(npm workspaces)
.github/workflows/ci.yml  엔진 — PR·main 검사 (타입체크·린트·테스트·데이터 검증)
apps/web/                 클라이언트 — 화면(React + Vite), PWA, 온라인 기능  (#17에서 생성)
infra/                    클라이언트 — 리더보드 백엔드 설정(테이블·보안 규칙·함수)
packages/schema/          엔진 — 데이터 타입·검증기(Zod)
  src/                      effects · species · events · fact(값 단위 출처) · load(GameData)
  src/cli/validate-data.ts  npm run validate:data
packages/engine/          엔진 — 게임 규칙(순수·결정론). 의존성은 @wb/schema 하나
  src/api.ts                newRun · getChoices · preview · act · getView · serialize · deserialize
  src/rng.ts                시드 고정 난수(SplitMix32)
packages/sim/             엔진 — 헤드리스 러너 · Bot 인터페이스 (npm run sim)
packages/tokens/          아트 — 디자인 토큰(색·글꼴·간격)
qa/                       QA — 봇, 리포트, e2e, 테스트 전략, 출시 체크리스트, CI용 검사 스크립트
data/balance/             게임디자인 — 모든 조정 가능한 수치 (effects.json, species/<id>.json)
data/calendar/            게임디자인 — 종별 연간 단계표
data/titles/              게임디자인 — 칭호·업적(조건), 이름 글은 콘텐츠가 PR
data/species|events|nodes|predators|codex|environment|text/   생태·콘텐츠 (species/<id>.ecology.json)
assets/                   아트 — 최종 에셋 (assets/inbox/는 대표의 이미지 투입함)
docs/design/              게임디자인 — 기획서(gdd.md), 시스템 명세(specs/), 이벤트 컨셉(event-concepts/)
docs/content/             생태·콘텐츠 — 출처, 사실 검증, 문체, 식별 특징
docs/art/ docs/ux/        아트·UX
docs/adr/                 기술 결정 기록 (0001 기술 스택)
docs/studio/              PM — 협업 규칙, 로드맵, 결정 기록, 위험, 회고 (03-contracts는 엔진)
docs/agents/              부서별 임무 문서 (PM)
docs/status/              부서별 상태 파일 + 대시보드
scripts/                  setup-github.sh(PM), art/(아트), data/(엔진: 데이터 변환·마이그레이션)
```

TypeScript는 빌드 없이 실행된다. 패키지는 소스(`src/index.ts`)를 그대로 내보내므로 Vite와 Node가 직접 읽는다.
