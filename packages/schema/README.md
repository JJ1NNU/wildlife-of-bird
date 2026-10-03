# `@wb/schema` — 데이터 타입과 검증기

`data/`의 데이터 파일 형식을 타입으로 적고 검증한다. 형식의 출처는
[`docs/studio/03-contracts.md`](../../docs/studio/03-contracts.md) 4장이다.

데이터 파일의 **필드 의미는 소유 부서**(design·content)가 정의하고, 엔진은 그 의미대로
여기에 타입을 만든다.

## 검증하기

```bash
npm run validate:data
```

실패하면 **파일 · 파일 안의 위치 · 이유**를 한 줄씩 적는다.

```
data/species/parus-minor.ecology.json
  위치: breeding.clutchSize
  이유: clutchSize.typicalMin은 typicalMax보다 클 수 없다
```

## 생태 사실은 값마다 출처를 붙인다 (#56 결정)

한 종 파일 안에서도 사실마다 출처 등급이 다르므로(포란 담당은 확인, 포란 기간은 미확인)
`sources` · `factCheck` · `note`를 **값 단위**로 붙인다. 값의 모양은 셋 중 하나다.

```json
"incubationBy":   { "value": "female",            "sources": ["SRC-001"], "factCheck": "verified" },
"habitats":       { "values": ["forest"],          "sources": ["SRC-004"], "factCheck": "needs-review" },
"incubationDays": { "min": 12, "max": 13,          "sources": ["SRC-004"], "factCheck": "needs-review", "note": "..." }
```

- `verified`이면 출처가 1개 이상 필요하다.
- 값을 아직 못 찾은 사실은 값 없이 `{ "sources": [], "factCheck": "needs-review", "note": "찾아볼 곳" }` (지금은 없음).
- 스키마 코드: `src/fact.ts`의 `fact()` · `UnresolvedFact`.

## 지금 담은 형식 (M0 — #54 개정)

| 파일 | 소유 | 스키마 |
|---|---|---|
| `data/species/<id>.ecology.json` | content | `SpeciesEcology` |
| `data/balance/species/<id>.json` | design | `SpeciesBalance` |
| `data/balance/effects.json` | design | `EffectsTable` |
| `data/balance/formulas.json` | design | `Formulas` |
| `data/events/<이름>.json` | content (design 리뷰) | `GameEvent[]` |
| `data/calendar/<id>.json` | design | `Calendar` |

`data/nodes/` `data/predators/` `data/codex/` `data/titles/` `data/text/`는
형식이 아직 예시 수준이다. 소유 부서가 첫 파일을 올릴 때 엔진이 함께 스키마를 추가한다
(미리 만들지 않는다 — 01-collaboration 15장).

## 형식을 바꾸고 싶으면

03-contracts 8장의 계약 변경 절차를 따른다. 스키마와 그 문서를 같은 PR에서 고치고
영향받는 부서에 `review:*` 라벨을 단다.
