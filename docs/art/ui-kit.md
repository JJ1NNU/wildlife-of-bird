# UI 키트 — 컴포넌트 규칙

> 소유: 아트·UX. 바꾸려면 `review:art` PR. 값은 모두 `packages/tokens/src/tokens.css`(`--wb-*`)를 가리킨다 — 여기에 숫자를 새로 정하지 않는다.
> 상위 규칙: `packages/tokens/README.md`(색·대비) · `docs/art/style-guide.md` 3장(글자·터치) · 배치: `docs/ux/wireframes/mid/`.
> 범위: **지금 `apps/web`에 있는 컴포넌트만**(#396, 01-collaboration 15장). 새 컴포넌트는 화면에 들어올 때 이 문서에 한 줄씩 더한다.
> 클래스 이름은 `apps/web/src/style.css` 기준(2026-10-09). M3 아트 스타일 적용 때 이 규칙을 지키는 한 생김새는 바뀔 수 있다.

## 0. 모든 컴포넌트 공통

| 무엇 | 규칙 |
|---|---|
| 터치 | 누를 수 있는 것은 가로·세로 `--wb-touch-min`(44px) 이상, 서로 `--wb-space-2`(8px) 이상 떨어짐. 예외는 아래 표에 적힌 것만 |
| 모서리 | 카드·시트·장면 띠 `--wb-radius-l` · 버튼·선택 카드·칸 `--wb-radius-m` |
| 여백 | 화면 좌우 `--wb-space-4`. 목록 사이 `--wb-space-2` |
| 상태 표시 | 선택됨 = **2px `sage-strong` 테두리 + `paper` 바탕** · 못 누름 = **점선 테두리 + `ink-muted` 글자** · 켜짐(세그먼트) = `slate-strong` 바탕 + `on-strong` 글자. 색만 바꾸지 않고 테두리 모양·굵기도 바꾼다 |
| 숫자 | 확률·에너지·수치는 `tabular-nums`(body에 이미 걸림) |
| 위험 | 색 + 아이콘 + 숫자 + 낱말(2장 위험 표시). 색 하나로 전하지 않는다 |

## 1. 화면 틀

| 컴포넌트 | 클래스 | 규칙 |
|---|---|---|
| 결정 영역 | `.zone` | 상태 바 ~ 결정 버튼이 높이 `min(550px, 100dvh)` 안(#53). 그 아래 피드만 스크롤과 함께 흐른다 |
| 상태 바 | `.status` | 바탕 `card`, 아래 `line` 1px. 높이 56 이상, 위는 safe-area |
| 그림 판 | `.art` + `.plate` | 바탕 `card`. 높이 120(키 551 이상이면 172, 루틴 화면 `.short`는 120). 그림 위 글자는 반드시 `.plate`(paper 0.92) 위에 |
| 겹침 시트 | `.zone.ov` > `.sheet` | 상태 바는 그대로, 나머지는 `ink` 55% 어둡게. 시트는 `paper` 바탕 + 위 모서리 `radius-l` (mid/02) |
| 장면 띠 | `.scene` | 높이 88, `card` 위 `ink` 35%. 긴장은 배경 명도로만, 위험 아이콘은 `danger`. 새 그림은 `scene.*`(알파 있는 것)만 |
| 피드 | `.feed` · `.feed-list` | 접힘 아래. `small` + `ink-muted` — 지난 일 기록이라 결정에 꼭 필요한 정보는 두지 않는다 |

## 2. 정보 표시

| 컴포넌트 | 클래스 | 규칙 |
|---|---|---|
| 아이콘 | `.ico`(20px) · `.ico.s`(16px) | SVG를 mask로 — **글자색을 따른다**. 아이콘 색을 따로 칠하지 않고 부모 글자색을 바꾼다. 카드·칸 안에서는 `slate-strong` |
| 위험 표시 | `.risk.low` · `.risk.mid` · `.risk.high` | 각각 `sage-strong` · `ochre-strong` · `danger` + 아이콘 + 숫자 + `.w` 낱말(caption 굵게). 낱말이 빠지면 안 된다 |
| 주의 글 | `.caution` | `ochre-strong`. 잃는 것을 알리는 한 줄(계승 비교표, 이벤트 효과) |
| 위험 글 | `.danger` | `danger` + 굵게. 새끼·둥지 손실, 사망 위험 칸 |
| 경고 줄 | `.notice` | 결정 영역 안 한 줄, `danger` 글자. 아이콘 또는 낱말과 함께 |
| 보조 글 | `.muted` · `.small` · `.cap` | `ink-muted` · `small` · `caption`. `caption`은 없어도 되는 정보만 |
| 표 | `.slot-table` · `.compare` | 줄마다 아래 `line` 1px. 머리 칸은 `ink-muted` 보통 굵기. 잃는 칸은 `.caution` + 낱말 |

## 3. 누르는 것

| 컴포넌트 | 클래스 | 규칙 |
|---|---|---|
| 선택 카드 | `.opt` | 높이 44 이상, 바탕 `card`, 테두리 `line`, `radius-m`. 왼쪽 아이콘 · 가운데 `.main`(이름·`.fx` 효과) · 오른쪽 `.vals`(숫자, 줄바꿈 안 함). 선택됨 `.sel`, 못 고름 `:disabled`(0장 공통 규칙). 하위 선택은 `.sub`로 `space-4` 들여쓰기 |
| 결정 버튼 | `.btn` | 높이 44 이상, 굵게, `radius-m`. 보조 = `paper` 바탕 + `slate-strong` 1.5px 테두리·글자. 주 버튼 `.prim` = `sage-strong` 바탕 + `on-strong`. **한 화면에 `.prim`은 하나**. 버튼 둘이면 사이 `space-2` |
| 칸 | `.cell` | 루틴 칸(mid/06). 44×52 이상, 바탕 `card`. 지금 칸 `.cur` = 선택됨 규칙, 빈 칸 `.empty` = 점선. 7·8칸(`.cells.many`)은 최소 폭을 풀어 ≈37px(#289에서 허용한 예외 — 높이 52는 지킨다). 칸 사이 4px도 예외(8칸이 한 줄에 들어가야 하고, 잘못 누르면 다시 고르면 된다) |
| 세그먼트 | `.pol .seg` | 육아 방침(mid/03 C). 칸마다 44 높이, 테두리 `slate`(의미 있는 경계). 켜짐 `.on`, 잠김 `.pol.lock` = 점선 + `card` 바탕. 칸 사이 4px는 예외(붙은 한 묶음 — 칸마다 테두리로 경계가 보인다) |
| 칸 넘기기 | `.step` | ◂ ▸. 글자 대신 `aria-label` 필수 |

## 4. 지금 화면과 이 규칙의 차이 (클라이언트에 넘김)

M1 화면은 그대로 둔다(M1 관문 중). M3 아트 스타일 적용(클라이언트) 때 함께 고친다.

| 어디 | 지금 | 규칙 |
|---|---|---|
| `.step` | 높이 32px | 터치 44 — 칸 줄 머리 높이를 44로 늘리거나 버튼을 칸 줄 양옆으로 |
| `.cell .pl` | 글자 10px | 최소 `caption`(12px) — 칸이 좁으면 장소 이름을 줄여 쓰거나 표에만 |
| `.pol .seg button` | 선택지 이름이 `caption`(12px) | 고르는 데 꼭 필요한 글이라 `small`(14px) 이상 — 넘치면 두 줄 허용 |
| 몇몇 `padding`(`.opt` 3px 10px, `.status` 6px 등) | 토큰 밖 값 | 가능한 `--wb-space-*`로. 와이어프레임 높이 예산(550)을 맞추느라 쓴 값은 그대로 둬도 된다 |
