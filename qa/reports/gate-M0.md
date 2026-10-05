# M0 관문 판정 — 착수

> 판정: QA·밸런스. 기준: `docs/studio/02-roadmap.md` 6장 'M0 착수'. 요청: #104.
> 판정일 2026-10-05 · 기준 커밋 main `77c06d6` · Node 24.11.1(로컬)

## 결론: **통과** (4/4 조건)

| 조건 | 결과 | 근거 |
|---|---|---|
| CI 통과 | ✅ | 아래 1 |
| 미리보기 주소 | ✅ | 아래 2 |
| 데이터 검증 동작 | ✅ | 아래 3 |
| 화풍 결정 | ✅ | 아래 4 |

참고: 열린 `sev:S1` 버그 0건(판정 시점).

## 1. CI 통과
- main 최신 커밋 `77c06d6`: [CI 성공](https://github.com/JJ1NNU/wildlife-of-bird/actions/runs/37222765223) · [Deploy 성공](https://github.com/JJ1NNU/wildlife-of-bird/actions/runs/37222765274)
- 5단계 포함 확인: `ci.yml` = typecheck · lint · test · validate:data, `deploy.yml` = `npm run build -w @wb/web` (#75, D-017)
- 참고: 그 전 커밋 몇 개의 Deploy가 `cancelled` — 연속 푸시로 앞선 실행이 취소된 것으로 보이며 실패가 아니다. 최신 커밋 기준으로 판정한다.

## 2. 미리보기 주소
- https://main.wildlife-of-bird.pages.dev 를 360×780으로 열었다(앱 내장 브라우저).
  - 제목 '야생조류 키우기', '개발 빌드 v0.0.0', 데이터 '파일 2개 · 검증 통과', 엔진 `getView` 결과(1년 1시기 1단계, 박새 암컷, 에너지 50) 표시 → 엔진 골격 화면 확인
  - `scrollWidth` = 360 → 가로 스크롤 없음. PWA 매니페스트 링크 있음
- 대표 본인 폰 확인: [#17 PM 대리 기록](https://github.com/JJ1NNU/wildlife-of-bird/issues/17#issuecomment-5970417148)(2026-10-04)
- 관찰(관문 영향 없음): 화면의 데이터가 '파일 2개'로 단계표(`data/calendar`)는 아직 안 읽는다 — 대시보드 라운드 5의 엔진 할 일(#100과 `calendar` glob)로 이미 잡혀 있다.

## 3. 데이터 검증 동작
`npm run validate:data`를 main `77c06d6`에서 실행. 바꾼 파일은 실행 후 `git checkout -- data`로 되돌렸다.

| 경우 | 바꾼 것 | 종료 코드 | 메시지 요지 |
|---|---|---|---|
| 정상 데이터 | 없음 | 0 | 데이터 검증 통과 — 종 1종, 이벤트 0건 |
| 필수 필드 삭제 | `data/species/parus-minor.ecology.json`에서 `nameKo` 줄 삭제 | 1 | 예상 타입은 string, 받은 타입은 undefined |
| 없는 id 참조 | `data/balance/species/parus-minor.json`의 `speciesId` → `no-such-bird` | 1 | 생태 파일이 없는 종이다: `data/species/no-such-bird.ecology.json` 필요 |
| 되돌린 뒤 | 없음 | 0 | 통과 |

오류 메시지가 파일·위치·이유를 함께 알려 준다.

## 4. 화풍 결정
- `needs:ceo` 이슈의 대표 답: [#71 "A"](https://github.com/JJ1NNU/wildlife-of-bird/issues/71#issuecomment-5970283581)
- `docs/studio/decisions.md` **D-015** 화풍 = A 수채 도감 (2026-10-04)
- `docs/art/style-guide.md` **v1** main에 있음(PR #83 머지), 1장 'A 담색 수채 생태도감 (확정, D-015)'

## 다음
PM이 대표에게 'M0 관문 통과 승인'을 `needs:ceo`로 요청한다(#104).
