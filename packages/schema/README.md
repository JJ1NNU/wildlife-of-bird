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

## 지금 담은 형식 (M0 · v0)

| 파일 | 소유 | 스키마 |
|---|---|---|
| `data/species/<id>.ecology.json` | content | `SpeciesEcology` |
| `data/balance/species/<id>.json` | design | `SpeciesBalance` |
| `data/balance/effects.json` | design | `EffectsTable` |
| `data/events/<이름>.json` | content (design 리뷰) | `GameEvent[]` |

`data/nodes/` `data/predators/` `data/codex/` `data/calendar/` `data/titles/` `data/text/`는
형식이 아직 예시 수준이다. 소유 부서가 첫 파일을 올릴 때 엔진이 함께 스키마를 추가한다
(미리 만들지 않는다 — 01-collaboration 15장).

## 형식을 바꾸고 싶으면

03-contracts 8장의 계약 변경 절차를 따른다. 스키마와 그 문서를 같은 PR에서 고치고
영향받는 부서에 `review:*` 라벨을 단다.
