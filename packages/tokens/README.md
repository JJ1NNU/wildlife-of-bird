# @wb/tokens — 디자인 토큰 v0

> 소유: 아트·UX. 바꾸려면 `review:art` PR. 상위 규칙: `docs/art/style-guide.md` 3장.
> **잠정(#13)**: 그림 계열 색(sage·ochre·slate)은 화풍 A 팔레트에서 뽑았다. 화풍이 정해지면 확정한다.

## 쓰는 법

```ts
import '@wb/tokens/tokens.css'; // :root에 --wb-* CSS 변수가 생긴다
```

```css
.card { background: var(--wb-color-card); padding: var(--wb-space-4); border-radius: var(--wb-radius-l); }
.prob { font-size: var(--wb-font-size-display); font-variant-numeric: var(--wb-font-numeric); }
button { min-height: var(--wb-touch-min); }
```

CSS 하나뿐이다. TS에서 값이 필요해지면 그때 추가한다.

## 규칙

| 무엇 | 규칙 |
|---|---|
| 글자색 | `ink` `ink-muted` `*-strong` `danger`만. 그림 계열 색(`sage` `ochre` `slate`)은 글자로 쓰지 않는다(대비 부족) |
| 버튼·배지 바탕 | `*-strong` `danger` + 글자 `on-strong`(흰색) |
| 경계 | 의미 있는 경계(게이지 틀, 입력 칸)는 `slate`(3:1 이상). `line`은 장식용 구분선만 |
| 위험·확률 | 색만으로 전하지 않는다 — 색 + 아이콘 + 숫자 |
| 그림 위 글자 | 판(`card` 또는 `paper`, 불투명도 0.85 이상) 위에만. 배치 01 측정에서 세 화풍 모두 판 없이는 1~2:1까지 떨어졌다(`docs/art/style-options.md` 6.2) |
| 글자 크기 | 본문 16px. 12px(`caption`)은 없어도 되는 보조 정보에만 |
| 숫자 | 확률·수치는 `tabular-nums` — 바뀔 때 자리가 흔들리지 않게 |
| 터치 | 44×44px 이상, 이웃과 8px 이상 |

## 대비 (WCAG 2.x 상대 휘도로 계산)

| 글자 / 바탕 | `paper` #FAF8F2 | `card` #F1EDE3 |
|---|---|---|
| `ink` #1F2421 | 14.8 | 13.5 |
| `ink-muted` #5A5D57 | 6.3 | 5.7 |
| `sage-strong` #3F6B4A | 5.8 | 5.3 |
| `ochre-strong` #7E5410 | 6.3 | 5.7 |
| `slate-strong` #3E4A54 | 8.6 | 7.8 |
| `danger` #A33A27 | 6.2 | 5.6 |
| `slate` #7A8894 (경계만) | 3.4 | 3.1 |

흰 글자 on `sage-strong` 6.2 · `danger` 6.6 · `slate-strong` 9.1 · `ink` 15.8. 모두 AA(4.5:1) 통과.

## 글꼴

**Pretendard** — SIL Open Font License 1.1, 한글·라틴·숫자 포함, `tnum` 지원. 글꼴 파일을 저장소에 넣을지, 부분 집합(subset)으로 줄일지, CDN으로 받을지는 클라이언트가 정한다(용량·오프라인 PWA 고려). 못 받으면 시스템 한글 글꼴로 떨어진다.
