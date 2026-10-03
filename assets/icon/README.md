# 아이콘 v0 (#25)

> 소유: 아트·UX. 직접 만든 SVG(출처 기록 = 아트 제작, 2026-10-04). 바꾸려면 `review:art` PR.

## 규칙
- 24×24 격자, 선 2px, 끝·모서리 둥글게, 채움 없음. 파일당 1KB 이하(예산 4KB, `style-guide.md` 4장).
- 색은 `currentColor` — 인라인 SVG나 CSS `mask`로 쓰면 글자색(`--wb-color-ink` 등)을 따른다. `<img>`로 쓰면 검정으로 보인다.
- 위험·확률은 아이콘만으로 전하지 않는다 — **아이콘 + 숫자 + 색**(`style-guide.md` 3장).
- 표시 크기 24px 이상. 터치 영역은 아이콘이 아니라 버튼이 44px을 채운다.

## 목록 (ID = 파일 이름, ID 규칙은 `03-contracts.md` 5장)

| ID | 뜻 | 엔진 키 |
|---|---|---|
| `icon.action.forage` | 채식 (행동 · 채식 스탯 겸용) | `action.forage` / 스탯 `forage` |
| `icon.action.rest` | 휴식 | `action.rest` |
| `icon.action.train` | 훈련 | `action.train` |
| `icon.action.social` | 사회 (행동 · 사회 스탯 겸용) | `action.social` / 스탯 `social` |
| `icon.action.explore` | 탐색 | `action.explore` |
| `icon.action.move` | 옮기기 | `move.<장소>` |
| `icon.stat.flight` | 비행 | `flight` |
| `icon.stat.vigilance` | 경계 | `vigilance` |
| `icon.stat.stamina` | 체력 | `stamina` |
| `icon.stat.display` | 과시 | `display` |
| `icon.res.energy` | 에너지(체지방) | `energy` |
| `icon.res.feather` | 깃털 상태 | `feather` |
| `icon.res.injury` | 부상 | |
| `icon.risk` | 위험 | |
| `icon.season.spring` · `summer` · `autumn` · `winter` | 계절 | |

키는 `data/balance/formulas.json`(2026-10-04)에서 가져왔다. 항법(철새 전용)·종 고유 행동·날씨 아이콘은 쓰이는 마일스톤에 만든다(M4·중충실도 와이어프레임 이후).

## 검수
Chrome headless로 48px·24px 렌더해 눈으로 확인(`docs/status/art.md` 메모의 명령).
