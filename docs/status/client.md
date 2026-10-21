# 클라이언트·배포 상태

기다림: #641(#639 게임 오버 기록 저장) qa 리뷰(art 승인 끝) — 다음: #535 7번 아트 그림(#538)·대표 #595

> 이 파일은 클라이언트·배포 부서만 고친다. 근무를 마칠 때마다 갱신해 main에 바로 푸시해도 된다.

- 마지막 근무: 2026-10-22 (자동 근무)
- 현재 마일스톤: M3 알파 (#535)

## 진행 중
- **#611** (P0, 대표 급함) UI 전체 다시 짜기 — 아트 명세가 주, 클라이언트 구현. **08 둘째 조각 #628 열림(review:art, base main·#626 위에 쌓음)** = 관문 머리(`.ghead` 제목 1줄+설명, 목록 밖)·이벤트 그림 96 먼저 접힘(flex-shrink 1000, 380 높이에서 0 확인). 첫 조각 **#613 머지**(art 승인, 패에 없는 카드 안 그림). **#619 열림(review:art·content)** = 07 첫 조각(카드 누르면 다음 빈 칸·가진 것만 3열 ×n·칸 누름 [빼기]·되돌리기·빈 칸 쉬기 실행·B 장소 줄·C 띠·F 늘 있는 카드·G 정보 줄). 다음 조각: ≡ 메뉴 시트(피드·빨리 감기·설정 옮김) + 옮기기 아래 시트 → 08 관문 시트. **#615(art 명세 07·08) client 승인** — 리뷰 댓글에 잠정 3개: ① 다음 단계 빈 칸 시작(엔진 `suggested` 무시, design 판단 대기) ② 팁은 C 그림 띠 먼저 접고 넘치면 E만 스크롤 ③ e2e testid 같이 고침. 다음: #615 머지 뒤 07 영역 틀(A~H, C만 줄어듦) → 카드 누름·×n·정보 줄 → 옮기기·메뉴 시트 → 08 관문 시트, 조각마다 PR
- **#535** 알파 빌드 — 조각 순서 #535 댓글(1 PWA → 2 설정 → 3 튜토리얼 → 4 도감·5 가계도·6 지도 → 7 아트 → 8 대표 폰 설치 type:human). 1번 **#568 머지**(SAVE_VERSION 7 = 알파 기준, 엔진 #570이 기록). **2번 #571 머지** — 타이틀 아래 접힌 설정: 기록 내보내기·판 지우기(확인), 기록에 `gameVersion`·`commit`·`startCommit`(`wb.startCommit`), 못 여는 저장 문구. **3번 #572 머지** — `tips.ts` 줄 세우기·`wb.tips`, 팁 카드 누르면 닫힘, T-30 떠 있으면 계승 안 넘어감, 자리는 위쪽 고정 잠정(아트 몫). **4번 #573 머지** — 도감 `wb.codex`(처음 만난 판·세대·횟수), 타이틀·게임 오버에 [도감]. 족제비는 이벤트가 없어 못 엶 → 콘텐츠 #574. **5번 #580 머지** — S-31 가계도 화면(`Lineage.tsx`·`lineage.ts` `wb.lineage` 마지막 1판), 게임 오버 [가계도]·타이틀 [지난 판 가계도], 문구 `data/text/lineage.json`. **6번 #583 머지** S-11 지도 — 이름표 [지도] → 장소 목록·계절 등급·지금 장소 체류·남은 먹이 %, 목적지만 `preview` 에너지·위험%(S-10 카드와 같은 숫자 확인), 누르면 옮기기 펼침. `energy1`은 `text.ts`로. **3번 후속 #584 머지** S-40 도움말 켜기/끄기(`wb.tipsOff`)·처음부터 다시, 설정 접힘은 판 없어도 보임. **#588 머지(#585 닫힘)** · #590(art ui-kit 3.2 흐름 안) client 승인 → 다음: 7번 아트
- **#423** 디자인 시스템 적용 준비(M2) — 어긋남 목록 #423 댓글(A 같은 값·B rgb 색·C 토큰 밖 간격·D 규칙 위반). A **#426 머지** · B **#433 머지** — `color-mix`는 `@supports`로 나눔(못 쓰면 기존 rgb). C는 M1 관문 뒤 550 높이 예산과 함께, D는 M3
- **#188** 루틴 화면 — #208(A·B)·#218(C)·#337(D 첫 조각)·#339(S-13 카드)·#346(효과 줄) 머지 · #383(S-13 잠정 장면) 머지. 남은 것: 아트 정식 장면 그림(#274) 오면 `.scene` img 교체 + 높이 88→96px(02-event `ev-art`, art 승인 메모) · 최종 `bird.*` webp는 알파 없는 종이색 배경
- **#24** M1 화면 — #125(S-10 · 자동 저장 · S-30) · #134(S-01) · #142(글꼴) · #154(훈련·옮기기 펼침) · #157(빨리 감기) · #164(S-20 짝 후보) · #185(스탯 표·S-23) · #198(산란수 카드) · #211(둥지 줄) · #225(S-22 육아 방침) · #231(S-20 지난 짝) · #235(지난 짝 등급 범위·유대) · #239(2차 번식 카드) · #261(S-24 계승) · #289(S-10 칸 수) · #293(data/text 문구) · #349(S-23 둥지 손실) · #357(이소 기대·은수저) · #374(S-30 부가 기록) · #376(계절 방침 관문) · #382(빈 화면 고침) · #387(빨리 감기 덮임) 머지. S-15 개체 상세는 M3로 미룸(#24 댓글). 관문 9종 모두 화면 있음(엔진 #21 완료) — QA 관문 #26 확인 대기

## 최근 완료
- **#640 승인(client)** — art 앉은 새 3배 크롭(몸통 칸 A 7.5–92%, 최종 perch 그림만), 댓글·라벨 뗌, 머지는 art · **#641 열림(review:art·qa)** — #639: 게임 오버 [가계도][지난 일] 아래 「플레이 기록 저장」(`go-export-record`), 패 카드 위험 `<0.1%` 짧은 꼴(정보 줄은 원래 글). e2e에 내려받기 확인 추가·통과, 360×640 측정(저장 531–575·새로 시작 583–627·문서 640). 머지 뒤 #608에 한 줄 (2026-10-22)
- **#637 머지**(art·qa 승인, merge-pr 통과) → **#611 08 조각 끝, 클라이언트 구현(할 일 2) 모두 main**. #611에 머지 PR 목록·남은 완료 조건(아트 스크린샷·PM #608 알림) 댓글. Deploy ca77510 진행 중 (2026-10-22)
- **#638 머지**(art·content 승인, merge-pr 통과) — #611 08 마지막 조각 S-12 결과 시트. 주 버튼 「확인」 유지 잠정은 art·content 모두 동의 (2026-10-22)
- **#637 art 변경 요청 반영** — T-40 팁이 `.game` 흐름에 있어 [새로 시작]이 화면 밖(686–730) → `{tipCard}`를 `.zone.go` 안 머리 아래로(판 화면과 같은 방식). 360×640 T-40 떠 있음: 팁 64–159·그림 159–319(160 그대로, 본문 남는 높이가 먼저 줄음)·버튼 531–627·문서 640. typecheck·lint·e2e 통과, PR 댓글 (2026-10-22)
- **#638 열림(review:art·content)** — #611 08 여덟째(마지막) 조각 S-12 판정 결과를 관문과 같은 `.gsheet`로(뒤 B·C 어둡게, 머리 「칸별 결과」, 기존 표+합 줄, 주 버튼 시트 아래). 재생 중 칸 줄 강조 코드 지움. 잠정: 주 버튼 글 「확인」 그대로([계속]은 멈춤 풀기 글과 겹침 — content), 표→`.opt` 줄은 art 판단. typecheck·lint·test(152)·build·e2e 통과, 360×640 측정(시트 278–639, 목록 스크롤 없음) PR 본문 (2026-10-22)
- **#634 `[client] 승인` 한 줄**(merge-pr 인식 형식) · **#637 열림(review:art·qa)** — #611 08 일곱째 조각 게임 오버 한 장(와이어 F): 머리 56·그림 160(flex-shrink 1000 먼저 접힘)·점수·이유 줄·[가계도][지난 일]/[새로 시작], 지난 일은 .bsheet. 화면 안 가계도 목록·기록 표·[도감]·[기록 저장] 뺌(타이틀에 있음), 문구는 기존 키만(안 쓰는 키 지울지 content 판단). e2e 가계도 확인은 S-31 `.tree li`로. typecheck·lint·test(152)·e2e 통과, 360×640 측정 PR 본문. 메모: 측정은 smoke 복사본(measure.e2e.ts, 끝나고 지움)에 setViewportSize·getBoundingClientRect 넣어 돌리면 빠름 (2026-10-22)
- **#634 승인(client)** — art 계승 새끼 사진 40 크롭(96px·몸 가운데 맞춤), 768² 정사각·가운데 계산 확인, 댓글·라벨 뗌. 메모: 큰 새 자리표시(두루미)는 크롭에서 몸 가운데만 보임 → 최종 그림 올 때 art 판단 · **#636 열림(review:art)** — #611 08 여섯째 조각 번식기 둥지 띠 28(이름표 대신, `.art.band.nested` min-height 28). 잠정: 단계 진행(포란 1/3)·둥지 위험%는 view에 값이 없어 뺌. typecheck·lint·test(152)·e2e 통과, 360×640 측정 못 함 (2026-10-22)
- **#633 머지**(art·qa 승인, merge-pr 통과) · **#635 열림(review:art)** — #611 08 다섯째 조각: 장소 줄(B)에 고른 계절 방침 이름(지금 계절일 때만, 먹이·경쟁 글만 말줄임) · 계승 확인 왼쪽 [◂ 다시 고르기] 112 고정. 잠정: 방침이 ViewModel에 없어 `RunState.seasonPolicy` 직접 읽음(engine이 원하면 view로). typecheck·lint·test(152)·build·e2e 통과, 360×640 DOM 측정 PR 본문. 메모: 계승 확인까지는 e2e 시드(`Date.now=()=>Date.UTC(2026,0,1)` 뒤 new-run)로 smoke의 press 순서를 JS로 따라 하면 158번 만에 옴 (2026-10-22)
- **#632 머지**(art 승인, merge-pr 통과) · **#633 열림(review:art·qa)** — #611 08 넷째 조각 계승 새끼 줄: `.opt.kid` 사진 40(juv.perch, 없으면 자리표시)·이름·1년 생존·강한 잠재력 1개, 고른 줄만 은수저·첫 겨울·잠재력 전부, 새끼 줄 먼저·잔류 줄 맨 아래, T-30 대상 `.surv`, e2e `.first()`. 구역 글은 기존 문구 그대로(잠정). typecheck·lint·test(152)·build·e2e 통과, 360×640 측정 못 함 (2026-10-22)
- **#631 승인(client) · #632 열림(review:art)** — #631(와이어 08 .choice.sel paper·padding 7×9): paper는 #630 구현과 같음, 댓글·라벨 뗌. #632 = 구현에 padding 7×9 한 줄(선택 때 높이 그대로) (2026-10-22)
- **#628 머지**(art 승인, merge-pr 통과 — 저자 부서가 머지) · **#630 열림(review:art)** — #611 08 셋째 조각: 계절 방침 관문을 `.choice` 줄(이름·설명·에너지·위험+낱말)로, 도움말은 시트 머리 설명으로, `.hand.season` 지움. sel 배경은 `paper` 잠정(와이어 `#e8efe6`). typecheck·lint·e2e 통과, 360×640 DOM 측정(시트 210–639, 줄 88×3, 넘침 없음). 메모: 관문까지 가려면 JS로 실행·확인·끝까지 넘기기·관문 첫 선택 반복(3월 상반에 계절 방침), 스크린샷은 시간 초과 (2026-10-22)
- **#627 머지**(engine 승인, merge-pr 통과 → #612 ADR 메모 끝) · **#628 리베이스** — #626 스쿼시 머지 뒤 충돌 → 이 PR 두 커밋만 `rebase --onto origin/main` 으로 옮김(diff 리베이스 전과 같음), typecheck·lint·test(152)·build·e2e 통과, PM 머지 대기 · **#629 승인(client)** — 관문 시트 최대 576(상태 바 56 + 여백 8)·머리 설명 줄 제한 없음이 구현과 같음, 댓글·라벨 뗌. 메모: 쌓인 PR의 아래가 스쿼시 머지되면 merge 말고 `rebase --onto`가 충돌 없음 (2026-10-22)
- **#626 열림(review:art)** — #611 08 첫 조각 관문 시트 틀: 관문 9종+계승 확인을 아래 시트 하나(`.gsheet`), 뒤 판 화면(B·C) ink 55%, 목록만 스크롤, 닫기 없음, `.zone.ov` 지움. check(M-11 로컬 시간 초과만)·build·e2e 통과, 360×640 관문별 DOM 측정 PR 본문(계승 64–639 목록만 스크롤, T-30 대상 dim 위). 다음: 머리 분리·이벤트 그림 96 접힘·계절 방침 .choice·계승 새끼 줄·둥지 띠 28·S-12 시트·게임 오버 화면. **#627 열림(review:engine)** = #612 ADR-0002 메모(웹만, 기존 SW 그대로) (2026-10-21)
- **#625 열림(review:art)** — #611 셋째 조각 옮기기 아래 시트(07 C): 패 자리 펼침 잠정을 빼고 메뉴 시트와 같은 틀, 시트 CSS를 `.bsheet`·`.sheet-dim`으로 이름 바꿈(08 관문 시트도 이것을 씀). check(152)·build·e2e 통과, 360×640 시트 279–640px·스크롤 없음·고르면 다음 빈 칸. 메모: 포트 5174를 다른 것이 쓰고 있어 개발 서버를 5179로 띄움. 다음: 08 관문 시트 (2026-10-21)
- **#619 #620 머지 · #624 열림(review:content)** — #619 merge-pr 통과 뒤 쌓인 #620이 base 브랜치 삭제로 자동 닫힘 → 옛 base 브랜치를 PR 헤드로 다시 올려 reopen·base main으로 바꾸고 지움, main 합침(style.css·routine.json 충돌, routine은 content 문구) → merge-pr 통과. #624 = #622 배지 `{n}장`(`routine.hand.count`)·정보 줄 쉼표. 메모: **쌓인 PR은 아래 PR 머지 전에 base를 main으로 먼저 바꿔 둔다**(머지 뒤엔 닫혀서 못 바꿈). art 답: 카드 2줄 위험 `<0.1%` 짧은 꼴은 다음 조각에서 (2026-10-21)
- **#618 승인(client) · #620 열림(review:art·content·qa)** — #618(12-card-turn 2.4 빈 칸 시작)이 #619 구현과 같음 확인, 댓글·라벨 뗌. #620 = #611 둘째 조각 ≡ 메뉴 시트(지난 일·도감·설정, 판 아래 피드 삭제, S-15 줄은 미룸이라 뺌), #619 위에 쌓음. check(152)·build·e2e 통과, 360×640 DOM 측정 PR 본문. 다음: 옮기기 아래 시트 → 08 관문 시트 (2026-10-21)
- **#619 열림(review:art·content)** — #611 07 첫 조각. check(152)·build·**e2e 통과**, 미리보기 360×640 확인(PR 본문 높이·동작). 잠정: 옮기기는 패 자리 목록, 피드는 아직 아래. 메모: preview_start는 메인 폴더 launch.json만 봐서 dev 서버를 Bash 백그라운드(포트 5174)로 띄우고 URL로 열었음 (2026-10-21)
- **#615 승인(client) · #613 머지** — #615 구현 가능성·높이 예산 확인(엔진 `view.routine.hand`·`limitToHand`·`null`=쉬기로 다 됨), 댓글·라벨 뗌, 머지는 art. #613은 art 미리보기 승인 → merge-pr 통과 (2026-10-21)
- **#602 #603 머지**(art 승인 / design·content 승인, merge-pr 통과) → **#599 #513 닫힘**. #535 남은 것: 7번 아트 그림(#538) · 8번 대표 폰 설치(#595) (2026-10-18)
- **#603 미리보기 360×640 확인**(PR 댓글) — sim skilled 시드 old-1(3세 포식 죽음, agingRisk>0) 죽기 전 상태를 `wb.run`에 넣고 같은 루틴 재현 → 게임 오버에 "늙어서 몸이 느려졌다"(171–192px), 넘침 없음. 병 죽음은 화면으로 못 봄. 메모: 게임 오버 저장은 [이어 하기]가 안 떠서 죽기 직전 상태를 넣어야 함, 저장이 크면(로그 220KB) 로그를 잘라 넣음 (2026-10-18)
- **#603 열림(review:design·content)** — #513 마지막 조각: 게임 오버에 `view.agingRisk > 0`이면 "늙어서 몸이 느려졌다"(노화 죽음이면 안 보임), QA가 찾은 `cause.death.disease` 추가. check·build 통과, **화면 확인 못 함** → 다음 근무 미리보기 (2026-10-17)
- **#601 #600 승인(client)** — #601 로그 둥지 이유 `—`→괄호, #600 ui-kit 4장 새 두 줄 CSS로 확인. 둘 다 댓글·라벨 뗌, 머지는 content·art. **#602 열림(review:art)** = #599 터치 44·글자 5곳(CSS만), 미리보기 360×640 측정 PR 본문(.pl은 칸 좁아 말줄임, .pol은 번식 단계라 값만). T-00 게임 오버 잔존은 개발용 경로라 그대로 (2026-10-17)
- **#598 승인(client)** — 엔진 `view.agingRisk`(게임 오버 때만, S-24와 같은 함수) #513 2번에 필요한 값 그대로, 댓글·라벨 뗌, 머지는 engine. #596은 content 승인, design 대기 (2026-10-17)
- **#594 머지**(art 승인, merge-pr 통과) — #535 7번 둘째 조각(관문 팁 대상·T-30 어둡게). 7번 남은 것은 아트 그림(#538, 대표 생성 #567 #578 대기)뿐 (2026-10-17)
- **#595 열림(type:human)** — #535 8번: 1~6번 조각이 스테이징(main)에 올라가 대표 폰 설치·오프라인 확인 요청(안드로이드·아이폰 방법, 답할 것 4줄). #535에 댓글. #594는 art 리뷰 그대로 (2026-10-17)
- **#594 미리보기 360×640 확인**(PR 댓글) — T-00 대상 없음, T-01 패 없으면 첫 빈 칸(369–421px)·패 열면 `.hand`, T-02 패 없으면 대상 없음, T-40 `.cause`, 가로 넘침 없음. 한계: 빨리 감기가 관문을 건너뛰어 관문 팁·T-30 어둡게는 화면으로 못 봄 (2026-10-17)
- **#593 머지**(art 승인, merge-pr 통과) · **#594 main 위로 다시 쌓음** + art 판단 반영: `TIP_TARGET` 배열이면 차례로 찾음(querySelector 쉼표는 문서 순서), T-01은 패 없으면 첫 빈 칸, T-02·T-03은 대신 안 가리킴. check·build 통과, **화면 확인 못 함** → 다음 근무 미리보기 (2026-10-17)
- **#592 머지 · #591 닫힘**(qa 승인, merge-pr 통과) · **#594 열림(review:art)** — #535 7번 둘째 조각: 관문 팁 대상(T-08 효과 줄, T-10·T-11·T-30·T-31 첫 카드 `.vals`, T-12 `nestLoss`, T-13 `clutch-forecast`, T-15 `nest-band`; T-14는 화면에 숫자 없어 대상 없음) + T-30만 `.tip-dim`(ink 55% 덮개, 팁·대상만 위). #593 브랜치 위에 쌓음. check·build 통과, **화면 확인 못 함** → 다음 근무 미리보기 (2026-10-17)
- **#592 #593 미리보기 360×640 확인**(PR 댓글) — #592: 칸 안 고르고 목적지 누르면 1번 칸에 옮기기 펼침, #591 재현 안 됨. #593: 패 열면 T-01 `.hand`·T-02 `.val`·T-03 `.risk`에 outline 3px, 팁(64–159px)과 안 겹침. 한계: 새 판 첫 화면엔 패가 없어 T-01~03 테두리 대상 없음 → 둘째 조각에서 대신 가리킬 곳 art에 물음 (2026-10-16)
- **#592 열림(review:qa)** — #591 S-11 지도: 커서 없으면 첫 빈 칸(`go` 버튼과 같은 `firstEmpty`)으로 옮기기 펼침, 빈 칸 없으면 누를 수 없음. **#593 열림(review:art)** — #535 7번 첫 조각: `TIP_TARGET`(팁→대상 선택자) + `TipTarget`이 렌더 뒤 `.tip-target` outline. S-10·판정·T-40만, 관문 팁·T-30 어둡게는 다음 조각. 둘 다 check·build 통과, **화면 확인 못 함** → 다음 근무 PR 미리보기 (2026-10-16)
- **#588 머지 · #585 닫힘 · #590 승인(client)** — art가 미리보기 360×640에서 T-00 팁 64~209px·덮음 없음 확인 후 승인 → merge-pr 통과. #590(ui-kit 3.2를 흐름 안으로) `.tip` 값 대조 일치, `max-width 480`은 뺐지만 앱 폭이 480이라 차이 없음 — 승인 댓글·라벨 뗌 (2026-10-16)
- **#587 승인 · #588 열림(review:art)** — #587 `[client] 승인` 댓글·라벨 뗌(이번엔 막히지 않음, 머지는 art). #588 = #585: `.tip`을 fixed → 상태 바 아래 흐름 안(`flex: none`), 아래 `.list`가 줄고 스크롤 → 관문 첫 카드·T-10 등 아무것도 안 덮음. check·build 통과, **화면 확인 못 함** → 다음 근무 PR 미리보기에서 짝 후보 관문 (2026-10-16)
- **#583 #584 머지** — 둘 다 #572 튜토리얼과 Game.tsx 충돌 → main 합침(import·팁 계산 뒤에 지도 화면 return) 뒤 CI 통과, merge-pr 통과. #584 미리보기 360×640 확인(PR 댓글: 버튼 44 높이·끄기/처음부터 다시·꺼짐이면 팁 없음). **#587(art, review:client) 승인 댓글+라벨 떼기가 자동 모드(CI Bypass)에 막힘** — 리뷰 내용: 구현 부담 괜찮음(팁 id→대상 선택자 표, 대상 가운데 y로 위·아래), 다만 T-00(대상 없음→위)은 #585를 못 푼다 → 잠정: 관문 열리면 안 닫은 T-00 접기. 메모: 로컬 `replay.test.ts` M-11이 이 기기에서 5초 넘겨 실패(6.4초, CI는 통과) (2026-10-16)
- **#572 머지 확인 · #584 열림(review:content)** — #572는 design `[design] 승인` 뒤 이미 머지돼 있었음. #584 S-40 도움말 두 버튼, check(152)·build 통과, **화면 확인 못 함** → 다음 근무 미리보기 (2026-10-16)
- **#583 열림(review:content)** — #535 6번 S-11 지도. check(152)·build 통과, 미리보기 360×640 확인(PR 댓글: 5곳·넘침 없음·숫자 일치·누르면 옮기기 펼침). #572는 design 승인 줄이 자동 모드에 막혀 대표 판단 대기 (2026-10-16)
- **#579 #580 머지** — #579(qa 승인, #577 닫힘) 서비스워커 그림 미리 받기, #580(content 승인) S-31 가계도. 둘 다 merge-pr 통과. #572만 design 승인 형식 대기 (2026-10-16)
- **#580 미리보기 확인** — sim 9세대 판(skilled, seed lin)의 가계도를 `wb.lineage`에 넣어 360×640에서 S-31 확인: 세대 칸 9개, 가로 넘침 없음, [돌아가기] 됨(PR 댓글). #572는 여전히 design 승인 형식 대기, #579 QA·#580 콘텐츠 리뷰 대기. 메모: 창이 hidden이면 클릭이 안 되니 JS `click()`·DOM 측정으로 (2026-10-16)
- **#572 main 합침 · #580 열림(review:content)** — #572는 merge-pr가 "review:design 승인 댓글 없음"(첫 줄 `design 리뷰 — 승인 (…)` 형식)으로 멈춤 → 댓글로 한 줄 요청. #580 S-31 가계도: check·build 통과, **화면 확인 못 함** → 다음 근무 미리보기. 메모: 첫 `npm run test`에서 1건 실패 → 다시 돌리면 통과(부하 때 흔들림), 루트 `tsc`가 못 잡은 web 타입 오류를 `build`가 잡음 — PR 전 build 꼭 (2026-10-16)
- **#571 #573 머지 · #579 열림(review:qa)** — #573은 main 합침(타이틀: [도감] 다음 설정 접힘)·포맷 고침, 미리보기 360×640 도감 14항목·가로 넘침 없음 확인. #579 = QA #577: 빌드 때 `precache.json`(번들 그림 목록, 지금 webp 4장 72KB)을 내보내고 sw가 설치 때 받음, 캐시 `wb-v2`. 글꼴 조각(3.1MB)은 안 받음 — PR에 적음 (2026-10-16)
- **#573 열림(review:content)** — #535 4번 도감 S-33. check(152)·빌드 통과, 엔진 5판 집계로 14항목 중 12개 해금 확인. **화면 확인 못 함** → 다음 근무 PR 미리보기. #574(족제비 해금 불가) 콘텐츠에 (2026-10-16)
- **#572 열림(review:design)** — #535 3번 튜토리얼 골격. check(152)·빌드 통과, 미리보기 360×640에서 T-00→T-03 순서·닫힘·`wb.tips` 확인(PR 댓글). **메모: 이 기기 `python3`는 Windows 스토어 껍데기라 아무것도 안 함(출력 "Python") — 파일 고치기는 node 스크립트로** (2026-10-16)
- **#568 머지**(엔진 승인) · **#571 열림** — #535 1·2번 조각 (2026-10-16)
- **#535 착수** — 조각 계획 댓글 · PR #568 PWA 서비스워커(review:engine, 본문에 SAVE_VERSION 7) (2026-10-16)
- **#563 머지 · #557 닫음** — art `[art] 승인` 댓글 뒤 merge-pr 통과, main 배포(6020b5d)에서 `.hand.event` CSS 확인. #557 완료 조건 점검 댓글(스크린샷 대신 art DOM 측정) · #464에 "대표님 플레이테스트 가능" 댓글 (2026-10-16)
- **#560 `review:client` 라벨 뗌**(PM 요청 — 리뷰어가 뗌, 머지는 art·PM) · **#563 art 변경 요청 반영** — 효과 줄 우선: `.pcard .fxs` 안 줄어듦, `.hand.event .nm` 3줄 말줄임(판정형 `.chk`는 2줄), 판정형 성공·실패 줄은 각 첫 줄(16px)만. 넓히기(선택)는 550 예산 때문에 안 함. 미리보기 360×640에 긴 글 카드 실제 마크업 넣어 측정 확인. **다음: art 재승인 → `merge-pr.sh 563`.** 메모: 리뷰어로 승인하면 `review:client` 라벨을 내가 바로 뗀다 (2026-10-16)
- **#561 #562 머지**(art 승인) · **#563 열림(review:art)** — #557 후속 S-13: 이벤트 선택지를 `ul.hand.event` > `.pcard`(글·판정 %·효과, 넘치면 잘림), 고른 카드의 전체 효과는 패 아래 `event-detail`. `.opt .fx` → `.opt-detail .fx`. check·build 통과, **화면 확인 못 함**(이벤트 관문까지 가야 함) → 다음 근무에 PR 미리보기에서 360×640 확인. #560은 client 승인 끝(art 머지 몫) (2026-10-16)
- **#562 열림(review:art)** — #557 후속 S-14: 계절 방침 관문을 `ul.hand.season` > `.pcard`(비용 배지·아이콘 없음, 설명 3줄, 고른 카드 전체 설명은 패 아래 한 줄). 에너지 줄은 #561 `.val`. 미리보기 360×640 봄 관문 DOM 확인(94×140 ×3, 넘침 없음, 확정 버튼 497px). #560은 client 승인 끝(art가 머지). **다음: #561·#562 머지 → S-13 이벤트 선택지 카드화.** 메모: 브라우저 창이 hidden이면 CSS transition이 멈춰 `.sel` 들어 올림이 0으로 측정됨 — `getAnimations().forEach(a=>a.finish())` 뒤 측정. 이 근무에서 Bash 개발 서버 실행이 자동 모드에 막힘 → PR 미리보기 배포로 확인 (2026-10-16)
- **#558 머지**(art 승인) · **#560 리뷰 승인**(ui-kit 3.1 패 카드 = 구현과 같음) · **#561 열림(review:art)** — art 다듬기 1·2: 패 카드 그림자 `color-mix`(`@supports` 안, 밖은 rgb) · 에너지 줄 `.risk`→`.val`. 3번(배지·물방울 둘 다 에너지)은 design 몫. #557·#464에 스테이징 주소·art 측정값 댓글. **다음: #561 머지 → S-13 이벤트 선택지·S-14 계절 방침을 패 카드로(ui-kit 3.1 "옮길 수 있으면 같은 규칙")** (2026-10-16)
- **#558 열림(review:art)** — P0 #557 잠정: S-10 패를 2:3 카드 한 줄(`.hand`/`.pcard`), 비용 배지·4상태(선택됨 들어 올림·에너지 부족 위험색 띠·패에 없음 점선), 묶음은 카드 눌러 패 바꿈, 고르는 동안 장면 그림 접음(550 안). **다음: art 승인 → 머지 → 미리보기 360×640 스크린샷 #557 첨부 → #464 댓글. 관문(S-13·S-14) 카드화는 아트 명세 뒤 후속.** 메모: 이 창 브라우저 스크린샷이 확대돼 깨짐 — DOM 측정으로 확인 (2026-10-16)
- **#556 머지 · #555 닫힘** — main 미리보기에서 카드 패(어울리기 `패에 없음`)·`에너지 18 중 0` 줄·로그 `계절 방침: 체온 아끼기` 확인 → #464에 플레이테스트 가능 댓글 (2026-10-16)
- **#556 열림(review:content)** — P0 #555: 웹 `data.ts`에 `cards`·`seasonPolicy`·`codex`·`text` 묶음 추가(빠지면 패가 조용히 빔 → 파일 하나짜리 묶음은 이제 throw) + S-10 단계 예산 줄 `에너지 {limit} 중 {spent}`·`<meter>`(엔진 budget + 계획 칸 비용). 개발 서버에서 패·`18 중 16`·`에너지 부족` 확인. **다음: 머지 → 미리보기에서 period 5 계절 방침 관문 확인 → #464 댓글** (2026-10-15)
- **#554 리뷰 승인(client)** — 엔진 `view.routine.budget {spent, limit}`(카드 막힘과 같은 `spentOf`·`stepIds`)·`view.stay`(도착 칸 0). 요청한 두 필드 그대로, 알파 S-10 막대·S-11 고갈에 씀 (2026-10-15)
- **#550 리뷰 승인(client)** — screens.md v2: 빠진 정보 없음, 도감·S-31 세대 기록은 클라이언트가 로그에서 모아 기기 저장(①). S-11 위험%는 `preview` 목적지(최대 4)에만 있어 잠정: 목적지 아닌 장소는 등급만 / **#534 필드 요청 추가**: `routine {spent, limit}`·`stay` (2026-10-15)
- **#534 필드 요청 댓글** — 알파 화면(튜토리얼 팁·S-31 가계도·S-33 도감 해금·S-11 지도·S-40)을 지금 `getView`·`state.log`·`preview`·`data`와 대조 → **새 필드 요청 없음**. 도감 해금은 화면이 기기 저장으로 모음(`node-visited` = 단계 바뀔 때 직전 `view.node`). #536이 값을 더하면 다시 요청 (2026-10-15)
- **#545 #546 #547 리뷰 승인(client)** — ADR-003: save.ts 흐름 맞음, 한 판 `wb.choices`가 여러 커밋에 걸칠 수 있어 판 시작 커밋도 기록(알파 화면 일) / 06-tutorial: `wb.tips` 기기 저장·줄 세우기 순수 함수 1개, T-04는 `disabled.reason` 글로 판단(잠정) / 문구 키 `t01` 맞음, 긴 본문(t10·t30)은 화면에서 확인. #535에 기준 버전·튜토리얼 메모 (2026-10-15)
- **#499 머지 확인 · #468 닫음** — 다섯 항목 모두 머지(#480 #492 #493 #495 #499). 열린 PR 없음 (2026-10-13)
- **#499 열림(review:qa)** — #468 5번: 재생 중 [멈춤]을 `.btn.side`(flex: none, 글자 폭)로, [끝까지 넘기기]가 확정 자리 가운데·오른쪽을 받음. 와이어프레임 순서 그대로. check·build 통과 (2026-10-13)
- **#493 머지**(qa 승인) · **#495 열림** — #468 4번: 안쪽 span에 글이 나뉜 버튼은 브라우저 접근성 도구가 이름 없음으로 읽음 → 칸·행동 줄·묶음·이벤트 선택지에 `aria-label`(화면 글 이어 붙임, 새 키 없음). 미리보기 `find`로 확인. **메모: 새 버튼에 글이 span 여러 개면 `aria-label`을 단다** (2026-10-13)
- **#492 머지**(qa 승인) · **#485 `review:client` 라벨 뗌**(엔진 요청) · **#493 열림** — #468 3번: 받침 따라 으로/로, 숫자는 0·3·6만 으로 (2026-10-13)
- **#485 client 승인**(Game.tsx `agingRisk` → `formatRisk` 한 줄) · **#479 머지**(#476 닫힘, art 승인) · **#492 열림** — #468 2번 (2026-10-13)
- **#479 art 변경 요청 반영** — `.art` 바탕 card → paper(webp 종이색 네모 안 보이게). 선택안(새 높이 100%)은 `.plate`가 가려 보류 / **#480 머지 시도 → 멈춤**(콘텐츠 승인 꼴 인식 안 됨, 다시 달기 대기) (2026-10-13)
- **#479 열림(review:art)** — #476: `birdUrl(view)`가 `assets/bird/*.webp` 고름(새끼 있는 둥지 → `chick.nest`, 0살 → `juv.perch`, 그 밖 → `adult-m|f.breeding.perch`, 없으면 자리표시). 사건 띠는 `placeholderBirdUrl`(알파 없음). check·build 통과, 개발 서버에서 webp 로드 확인(스크린샷은 창이 안 그려져 못 찍음) / **#480 열림(review:content)** — #468 1번 (2026-10-13)
- **#433 #436 머지(#435 닫힘) · #445 머지(#444 닫힘)** — art·content 승인 확인 후 머지 / #444: 로그 목록 key가 같은 단계 같은 글에서 겹침 → `withLogKeys`가 겹치면 `#n` 순번. QA 재현(e2e 1월 2일) 통과 확인 (2026-10-10)
- **#436 열림 · #437 #438 요청** — #435: `·`→`, ` · `−`→`-` · ♀♂→암컷/수컷(`gameOver.life.*` 키) · `×n`→`n배` · `→`→`>` · `—`/`…`→`-`, 아이콘(▸▴▾✕✓)은 그대로. check·build 통과. **메모: `npm run e2e`가 main에서도 실패**(계승 전 게임 오버) → QA #438. JSX에 `>`를 그냥 쓰면 파싱 오류 — `{' > '}` (2026-10-10)
- **#426 머지 · #433 열림** — #423 A(같은 값 토큰) art 승인 후 머지 / B: 겹침 색 3곳 `color-mix` 토큰, `@supports` 분기(메모: `var()` 든 선언은 앞 줄 대체가 안 됨 — 투명이 된다). check·build 통과 (2026-10-10)
- **#423 목록 댓글 · #426 열림** — style.css를 UI 키트·토큰과 대조, 첫 조각은 같은 값만 토큰으로(check·build 통과) (2026-10-09)
- **#402 머지 · #395 닫음 · #403 리뷰 승인** — 미리보기에서 게임 오버 → `플레이 기록 저장` → `wb-run-<seed>.jsonl`(RunRecord 1줄) 확인 후 머지 / #403 아트 UI 키트 4px 예외 기록 승인 (2026-10-09)
- **#402 열림 · #399 리뷰 승인** — #395: `actRecorded`로 선택 id를 `wb.choices`에 저장, 게임 오버 화면 JSONL 저장(sim `RunRecord`, 해시는 `crypto.subtle`). **메모: 판을 진행하는 새 `act`는 반드시 `actRecorded`로** — 안 그러면 내보낸 기록이 리플레이에서 어긋난다 / #399 아트 UI 키트 값 대조 맞음, `.cells`·`.pol .seg` 버튼 간격 4px가 0장 8px 규칙과 다름을 알림 (2026-10-09)
- **#387 머지** — QA #386(S3): 개발용 빨리 감기·스탯 표가 피드 맨 위라 내리면 sticky 결정 영역에 덮임 → 피드 맨 아래로. 360×780 개발 서버에서 보일 때 항상 눌림 확인. #386 2번(노화 배율 S-15)은 M3로 미룸, #24에 적음 (라운드 43)
- **#383 열림(review:art)** — #188 S-13 잠정 장면 띠: 어두운 카드 88px 위 종 자리표시 그림 + 위험 아이콘(02-event 메모 "배경+새+아이콘"). 로컬 check·build 통과. 승인되면 머지 (2026-10-09)
- **#382 머지** — main 스테이징이 빈 화면이었음: 빨리 감기가 import하는 QA 평균 봇(#347)의 `node:fs`·`node:path`를 vite 플러그인으로 `apps/web/src/bot-shim/`에 바꿈(`qa/bots/` 안 import만). 미리보기 배포 첫 화면·개발 서버 1년 빨리 감기 확인. 메모: **QA 봇이 Node 전용 import를 더하면 웹이 다시 깨진다** — CI·빌드는 못 잡으니 `npm run dev`로 첫 화면 확인 / #24에 엔진 #21 대기 정리 댓글 (라운드 42)
- #376 머지 — #373 머지 뒤 최신 main 위로 rebase(충돌 없음), 콘텐츠 제안 문구 2개(`gate.seasonPolicy.title`·`.help`) 반영, CI·Deploy 통과 / #374 머지 확인 (라운드 41)
- #374 main 합침(#363 머지됨)·로컬 check·build 통과·content 승인 확인. merge-pr.sh → CI pending(#368)으로 중단, 풀리면 머지 (2026-10-09)
- #376 열림(review:content) — #24 계절 방침 관문 카드(M1 기능 위주, S-14 본판은 M2): 이름·설명(#372)·방침 건 다음 단계 에너지·위험(`preview`). 새 키 `gate.seasonPolicy.*` 5개. **#373·#372 위에 쌓음** → 머지 순서 #370 → #373 → #372 → #376(main 합친 뒤). 로컬 check·build 통과 (라운드 40)
- #374 열림(review:content) — S-30 부가 기록 표(`view.records`: `N세대 · N.N년`·독립시킨 새끼·가장 오래 산 개체), 새 키 `gameOver.records.*` 4개. **#363 위에 쌓음** → #363 머지 뒤 main 합쳐 머지. 로컬 check·build 통과 (라운드 39)
- #359 content 승인(형식 맞음)·#367 art 승인 확인. merge-pr.sh 359 → main 합친 뒤 CI 실패(#368 Actions 멈춤)로 중단. 두 PR 로컬 `npm run check`·`build -w @wb/web` 통과 댓글. #368 풀리면 둘 다 머지 (라운드 38)
- #367 열림(review:art) — #188 S-13 이벤트 관문을 S-10 위 시트로: 상태 바는 그대로, 아래를 어둡게(`.zone.ov`), 카드·결정 버튼은 종이색 시트(mid/02-event). CSS만 / #359 merge-pr.sh 다시 돌림 — 여전히 `승인 (content):` 댓글 없음, 달리면 머지 (라운드 37)
- #363 리뷰 승인(client, `승인 (client)` 댓글·라벨 뗌) — 엔진 `ViewModel.records?`(yearsSurvived·generations·fledged·oldestAge, 게임 오버 때만) → 머지되면 S-31 부가 기록·리더보드 제출에 씀 / #359 main 합쳐 빌드 통과·푸시. content 승인 댓글이 `[content] 승인` 형식이라 merge-pr.sh가 멈춤 → `승인 (content): …` 형식으로 다시 달라고 요청. 달리면 머지 (라운드 37)
- #357 머지(content 승인) / #358 리뷰 승인(client) — 엔진 `ViewModel.starving` / #359 열림(review:content) — 상태 바 에너지 옆 `굶주림`(위험색, 새 키 `main.starving`). **#358 위에 쌓음** → #358 머지 뒤 main 합쳐 머지 (라운드 37)
- #355 리뷰 승인(client) — 엔진 S-22 `preview(state,'parentingPolicy?…')`에 `expectedFledged`·`breedingCost`. 머지되면 S-22 요약 줄 / #357 열림(review:content) — 산란수 카드에 `이소 기대 N.N · 은수저 N.NNN`(#352 값), 새 키 `gate.clutchSize.expectedFledged` (라운드 37)
- #352 리뷰 승인(client) — 엔진 `ClutchSizeCard.expectedFledged`(이소 기대 수, 6.4)·`silverSpoon`(0~1) 추가. 머지되면 `clutchRow` vals에 소수 첫째·셋째로 / #349·#346 main 합쳐(빌드·타입체크 통과) 머지 (라운드 36)
- #348 리뷰 승인(client) — 엔진 `NestSiteCard.nestLoss`(0~1, 구멍별 단계당 둥지 손실) / #349 열림(review:content) — S-23 카드에 `둥지 손실 N%`(`formatRisk`, 위험 아이콘), 키 `gate.nestSite.nestLoss`. **#348 위에 쌓음** → #348 머지 뒤 main 합쳐 머지 (라운드 34)
- #344 리뷰 승인(client) — 엔진 이벤트 카드 효과 `EffectPreview`(effects / onSuccess·onFail, fledgeEarly) / #346 열림(review:content) — S-13 효과 줄: 효과마다 한 덩이, 내 사망 위험만 띠, 둥지·새끼는 위험색 + 낱말, 이소 줄, 본문 아래 둥지 새끼 수. 문구 13개 `gate.json`. **#344 위에 쌓음** → #344 머지 뒤 `git merge origin/main` 후 머지 (라운드 34)
- #339 머지 — Deploy 빌드(tsc)가 실패해 고침: 클로저 안 `view.gate?.id` 좁히기가 풀려서 `eventGate`로 받음. 루트 CI `typecheck`는 `apps/web`을 안 봐서 Deploy만 잡는다 — 머지 전 `npm run build -w @wb/web` 확인할 것 (라운드 34)
- #337 머지(main 합친 뒤) / #339 열림(review:content) — S-13 이벤트 카드: `gate.kind==='event'` 분기, 제목·본문(`data.events`)·선택지 글·판정형 `"<스탯> 판정 N%"`(`gate.event.check` 키를 gate.json에 추가). 효과 숫자는 엔진에 #340 요청 (라운드 34)
- #337 열림 — #188 D 첫 조각(**#332 위에 쌓음** → #332 머지 뒤 `git merge origin/main` 후 머지): 칸 번호 절대값(`done = paused.done + filled.length`), 재생 합 `decision`|`replan`, 이벤트 칸에서 재생 표 끝(`!`·이벤트 제목), 칸 수 알림 `from = paused.slots` (라운드 33)
- #332 리뷰 승인(client) — 엔진 이벤트 연결: 마지막 칸 `act`에서 이벤트면 `gate {kind:'event', id, cards:{choiceId, chance?}[]}`, 선택 `event.<id>`(eventOption), 고른 뒤 `view.routine.replan:true`·`slots`=남은 칸·`filled`/`suggested` 남은 칸만, 다시 채우기 실행 로그는 `replan`·칸 번호 절대값(`paused.done+i+1`), 당첨 로그 `type:'event'`·`slot`·`event`. SAVE_VERSION 6 (라운드 32)
- #317 머지 — 마지막 화면 문구 `t()`. 엔진 이벤트는 아직 루틴에 안 붙음(events.ts 잠정 #21) — S-13 대기 (라운드 30)
- #317 열림(review:content) — 콘텐츠 #314 키 21개를 `Game.tsx`에 `t()`로(옮기기 머리말·나이·지난 짝 유대/성격(확인)/… n개·칸 고치기 머리줄·aria-label). 코드에 남은 한글은 개발용과 11째 이후 부화 순서 대체뿐. #311 닫힘 (라운드 30)
- #311 열림(콘텐츠에 요청, P2) — 마지막 남은 화면 문구 키(옮기기 머리말·유대·성격 (확인)·… n개·n세·칸 고치기 머리줄·aria-label). 머지되면 `Game.tsx`를 `t()`로. 엔진 #309·`replan` 아직 — #188·S-13 대기 (라운드 29)
- #308 머지 — 콘텐츠 #305 키로 Game.tsx 남은 문구를 `t()`로(title·main·routine·gate·gameOver·word). 키 없어 코드에 남김: 옮기기 `먹이 … · 경쟁 …` 머리말 · `유대 n → m` · `… n개` · `성격: … (확인)` · `n세` · `n칸 뒤 에너지 x에서` · aria-label · 개발용 (라운드 28)
- #304 열림(콘텐츠에 요청) — 남은 화면 문구 키(관문 제목·도움말·카드 항목, S-10 루틴 버튼·표 머리, S-01·S-30, "지난 짝과 다시" 포함). 머지되면 `Game.tsx`를 `t()`로. #300 머지 확인 (라운드 28)
- #299 승인(client, 댓글) — 콘텐츠 `data/text/gate.json`, Game.tsx 문구와 1:1 / #300 열림 — 관문 문구를 `t()`로(`gateGo(kind, label?)`). `content/297-gate-text`를 합쳐 둔 브랜치 → **#299 머지 뒤 `git merge origin/main` 후 머지**. "지난 짝과 다시"는 키 없음 — 콘텐츠에 요청할 것 (라운드 27)
- #297 열림(콘텐츠) — 관문 화면 문구(GATE_GO·POLICY_WORD·GRADE/HINT/PERSONALITY_WORD·MATE_GONE) `data/text/` 키 요청. 머지되면 `Game.tsx`를 `t()`로 (라운드 26)
- #293 머지 — 화면 문구를 `data/text/*.json`에서 읽기: `apps/web/src/text.ts`의 `t(key, vars)`(`{n}` 채움, 키 없으면 키 그대로). S-10 칸 줄 머리(`routine.slots.*`) · S-24 계승 화면 전부(`inheritance.*`). #278 닫음(#289로 끝) (라운드 26)
- #289 열림(review:art) — #278 S-10 평시 칸 수: 칸 줄 위 `.slot-head` 한 줄(`6칸 · 다음 칸까지 스탯 합 N`, `view.routine.nextSlotIn`), 결정 뒤 평시 칸 수가 바뀌면 `N칸으로 늘었다/줄었다`(`slotNote`, `commit`에서 계산), 7칸 이상 `.cells.many`(최소 폭 0, 8칸 ≈38px). 문구 잠정 → 콘텐츠 #290 (라운드 25)
- #285 머지 — S-30 가계도: `state.log`의 `life` 줄 → 세대마다 한 줄(성별 · 조작 기간 · 계승/사망(원인) · 번식 · 독립), `lifeLine`(Game.tsx), 문구 잠정 #24 / #284 리뷰 승인(client) — 엔진 `ViewModel.potentialRange`(플레이어 잠재력 등급 범위). S-03·S-15에 잠재력을 그릴 때 숫자 대신 이것 (라운드 25)
- #270 리뷰 승인(client) — 콘텐츠 `data/text/inheritance.json`(S-24 문구, 자리 표시 `{n}` `{from}` `{to}` `{name}` `{age}` `{bond}`, 부화 순서 `inheritance.ordinal.first`~`tenth`). 화면이 읽게 바꾸는 건 내 몫(#24) / #268 리뷰 승인(client) — 엔진 가계도: `RunState.life`, 계승·사망 로그에 `LogEntry.life`(`LifeRecord`: generation·sex·start·end·breeding·fledged·reason). S-30 가계도는 `recentLog`(20줄) 말고 `RunState.log`에서 `life` 줄을 걸러, 지금 개체는 `state.life`. SAVE_VERSION 5 (라운드 25)
- #261 머지 — S-24 계승 화면(mid/04-inherit A·B): 머리줄 "새끼 N마리 독립 — 총 번식 N−1 → N 확정", 지금 개체 카드(노화 ×·유대·1년 생존 %), 새끼 카드(첫째·둘째…, 은수저·첫 겨울 ×·1년 생존, 잠재력 범위 — 고른 카드는 전부, 나머지는 강한 2개), 새끼를 고르면 확인 비교표(`confirming` 상태, [다시 고르기][계승한다]) · 잔류는 바로. 깃털·부상 줄은 엔진 값이 없어 뺌(잠정 #21) (라운드 23)
- #258 리뷰 승인(client) — 엔진 계승 관문 `inheritance`: `getView().gate` = `{kind, totalBreeding, stay: InheritanceStayCard, cards: InheritanceChickCard[]}`(각 `choiceId`, `yearSurvival` 0~1), 선택지 `inherit.stay`·`inherit.chick.<n>`. 웹은 `GATE_GO.inheritance` 한 줄 → 지금 기본 목록으로 나옴. 사소: 03-contracts `Choice.kind`에 `inheritance` 중복 (라운드 23)
- #253 리뷰 승인(client) — 콘텐츠 `data/text/routine.json` 첫 파일(평평한 `"화면.항목.용도": "문구"`), 키 `routine.nightRest.label`·`.help`. 루틴 화면에 '밤 휴식' 줄이 생기면(엔진 ViewModel에 값) 이 키로 붙인다. #244·#250(은수저·독립)은 아직 ViewModel·카드에 안 나옴 — 화면 할 일 없음 (라운드 22)
- #239 머지 — 2차 번식 관문 카드(mid/04-inherit C): 머리줄 + 왜 열렸는지(`recentLog` 마지막 `nest` 기록), 한다 = 에너지 −n → 남는 값 · 주의색 대가 한 줄(`.caution`), 안 한다 = 없음 · 털갈이 회복. 바뀌는 털갈이 단계 수는 엔진이 값을 내면(잠정 #21) (라운드 19)
- #235 머지 — #233 머지 뒤 main을 합쳐(강제 푸시 대신 merge) 머지 / #236 리뷰 승인(client) — 엔진 2차 번식 여부 관문 `secondBrood`(`gate.cards` = `{choiceId, energyCost}[]`, 실패 뒤만). 화면은 웹의 `GATE_GO.secondBrood` 한 줄(잠정) (라운드 19)
- #233 리뷰 승인(client) — 엔진 #232: 짝 나이·경험 +1, 지난 짝 카드 `potentialRange`·`bond{now,reunion}`, `gate.previousGone` / #235 열림 — 화면 반영(유대 n → m, 등급 범위 3개 + "… n개", 없어진 이유는 관문 값). **#233 위에 쌓음** — #233 머지 뒤 rebase(`git rebase --onto origin/main origin/engine/232-previous-mate`) 후 머지 (라운드 19)
- #231 머지 — S-20 지난 짝 카드(`card.previous`: 성격 확인·재결합 예, 버튼 "지난 짝과 다시", 새 후보 번호 1부터) · 지난 짝이 없으면 `recentLog` 마지막 `mate` 기록의 `cause`(mateDeath/divorce)로 한 줄(`MATE_GONE`, 잠정 #21). 엔진에 #232(짝 나이 안 오름 · 등급 범위·유대 값 · 없어진 이유를 관문에) (라운드 18)
- #225 머지 — S-22 육아 방침: 항목별 칸 한 줄(와이어프레임 mid/03 C·C′), 고른 값은 `parentingPolicy?item=opt&…`로 `act`, 조정의 `locked` 항목 점선·잠김, 그대로면 "이대로 진행". 선택 id→칸 글 표 `POLICY_WORD`(Game.tsx, 잠정 #21) (라운드 17)
- #219 리뷰 승인(client) — 엔진 육아 방침 관문 `parentingPolicy`(`gate.cards` = `ParentingItemChoice[]`, `act('parentingPolicy?item=opt&…')`, `locked`). 화면은 확인 버튼 하나(잠정) — S-22 항목별 화면은 내 몫 (라운드 17)
- #213 머지 — S-21 짝 지시 관문 카드 / #218 머지 — S-12 칸별 결과 자동 재생(0.6초/칸·멈춤·끝까지·확인, 진행 때 판정·저장, 사망 칸 ✕ → S-30) (라운드 16)
- #210 리뷰 승인(client) — 엔진 짝 지시 관문 `mateOrder`(카드 `choiceId`·`acceptance` 등급, `GATE_GO` 한 줄). 화면 카드는 #213 (라운드 15)
- #211 머지 — S-10 판에 둥지 줄(`둥지 · 알 낳기 전 / 알 n개 / 새끼 n마리`, `view.nest`) — #207 새끼 개별 사망 반영, 와이어프레임 mid/03 A 둥지 띠 첫 조각 (라운드 15)
- #208 머지 — S-10 루틴(와이어프레임 mid/06 A·B): 계획은 화면 상태(`edited`·`cursor`), `planSlots`가 칸마다 채우기 `act`로 예상 계산, 진행에서 칸마다 `act`. 합 위험 띠는 요약 줄에만, 칸 변화 소수 첫째. 첫 단계(제안 없음)는 빈 칸 → "빈 칸 채우기" (라운드 14)
- #206 리뷰 승인(client) — 06-routine 칸 단위 숫자: 칸 줄·표의 에너지 변화/결과는 소수 첫째 자리, 요약 줄·상태 바는 정수, 칸 위험은 숫자만(0.1% 미만), 띠·색은 루틴 합에만 `riskBands` (라운드 14)
- #198 머지 — 산란수 관문 전용 카드: 알 n개 · 산란 비용/단계(`layingCost`, 수컷 "없음"), 결정 버튼 `GATE_GO.clutchSize` (라운드 13)
- #195 리뷰 승인(client) — 엔진 산란수 관문 `clutchSize`: `GATE_GO` 한 줄, 카드는 기본 행동 목록의 "알 n개" 행으로 나옴 (라운드 13)
- #191 리뷰 승인(client) — 루틴 계약: 칸 채우기 = `act`(난수 없음), 되돌리기 = 화면 쪽 `RunState` 스택, 기본값 칸 예상도 스택+`preview`로 화면이 만든다(루틴 단위 preview 요청 안 함) / #193 리뷰 승인(client) — S-10·S-12 루틴 와이어프레임, 높이 550 배분·칸 44×52 확인 (라운드 13)
- #185 머지 — #176 개발용 스탯 표(현재/잠재력, 출시 빌드 숨김) · 피드 줄마다 스탯·에너지·깃털 변화(`LogEntry.deltas`) · S-30 "죽은 이유" 크게 + 마지막 행동·남은 에너지 / #172 S-23 둥지 자리 관문(구멍 카드, 경쟁 구멍 차지할 확률 %, 관문 버튼 문구 `GATE_GO`) (라운드 12)
- #164 머지 — S-20 짝 후보 관문: `view.gate`가 있으면 그림·행동 목록 대신 후보 카드(깃·노래·나이·성격 힌트·받아들임 예/아니오), 결정 버튼 "짝 맺기 · 후보 n" (라운드 12)
- #157 머지 — 개발용 빨리 감기: `qa/bots/avg.ts`를 import해 1년(또는 게임 오버)까지 진행, 피드 위 버튼. 태그 빌드는 `VITE_RELEASE=1`로 숨김 (라운드 11)
- #154 머지 — S-10 훈련 ▾ · 옮기기 ▾ 펼침(와이어프레임 B), 목적지 먹이·경쟁 등급, 예상 스탯 상승, 상태 바 에너지/상한·깃털, 판에 장소 (라운드 10)
- #142 머지 — 글꼴: npm `pretendard`의 dynamic-subset CSS를 `main.tsx`에서 import, 같은 출처 unicode-range 조각 92개 (라운드 9)
- #134 머지 — S-01 타이틀·이어하기, 불러오기 실패 안내를 타이틀로 옮김 (라운드 8)
- #125 머지 — #24 첫 조각 (라운드 6)
- #123 리뷰 승인(client) — 구현 메모: zone sticky·min(550,100dvh), 시트는 zone 안 absolute, 아이콘은 `?url` import (라운드 6)

## 막힘 (무엇을 · 누구를 기다리는지)
- #24 나머지(이벤트·번식·계승·옮기기·훈련 스탯): 엔진 #21이 선택(kind)을 내야 함

## 다음 근무에서 할 일
0000. S-13 그림(ev-art)·시트 겹침(dim, 상태 바 아래)
000. 엔진 #21에 `eventOption`(루틴 칸 추첨·이벤트 관문)이 나오면 S-13 먼저. `inheritance.silverSpoon.help`·`firstWinter.help`는 도움말 UI가 생기면
00-0. S-24 남은 것: 확인표의 깃털·부상 줄 · 새끼 그림(`bird.parus-minor.juv.perch`, #146) — 엔진·아트가 내면 `Game.tsx`의 `inherit-confirm`·`chickRow`에
0-0-0-0. S-22 남은 것: 요약 줄(이소 기대 수 소수 첫째·내 번식 비용 정수, 04-breeding 6.4) — 엔진 #355가 머지되면 고른 조합마다 `preview(state, 'parentingPolicy?…').expectedFledged`·`.breedingCost`로 `parentingPolicy` 분기(Game.tsx) 아래에. 엔진 로그의 방침 글이 id 그대로(`high`)라 엔진이 문구를 내면 따른다
0-0-0. S-21 남은 것(엔진 ViewModel에 나오면): 짝 줄(나이·유대·성격 힌트/확인·지시 n/3), 지시 효과 설명 수치
0-0. #357(산란수 카드 이소 기대·은수저) content 승인 뒤 `bash scripts/merge-pr.sh 357`
0. #188 D(엔진 `replan`이 생기면) · 이벤트 칸 재생 멈춤 — 재생은 `Game.tsx`의 `replay`(진행 때 판정·저장 끝, 표만 `shown`칸까지)
1. 엔진 #21이 새 선택 kind(eventOption·나머지 번식 관문·inheritance)를 내면 `Game.tsx`에 붙이기 — S-13 이벤트 시트(zone 안 absolute, 상태 바 아래). 묶음 줄은 `GROUPS`(id 앞부분)로 더할 수 있다
00. 2차 번식 카드 남은 것: 바뀌는 털갈이 단계 수(와이어프레임 '털갈이 4단계') — 엔진 `SecondBroodCard`에 나오면 `broodRow`(Game.tsx)의 대가 줄에 숫자로
1-0. S-20 남은 것(엔진이 내면): 머리줄 내 과시/사회 등급 · 자동 진행 알림. 관문 분기는 `Game.tsx`의 `view.gate?.kind` — 새 관문 kind도 여기에
1-0-1. 둥지 띠 나머지(mid/03 A): 국면 이름·단계 n/N · 둥지 손실% · 짝·유대 · 건 지시 — 엔진 ViewModel에 나오면 `nest-band` 줄(Game.tsx 판)에
1-1. ViewModel에 `stay`·환경이 생기면 판에 'N단계째 머묾'·환경 칩(와이어프레임 A)
2. (빨리 감기 끝) QA 봇 v1(번식 선택)이 나오면 자동으로 따른다 — 손볼 것 없음
3. S-40 설정(명세 "결정 정보 없음" — 만들 내용이 생기면), S-15 개체 상세(엔진 ViewModel에 등급·잠재력 범위·노화 배율·부상이 나와야 함 — #21)
4. 화면 문구를 `data/text/`로(콘텐츠가 만들면)

## 메모 (다음 근무의 나에게)
- 칸 수 7·8 확인: 노드 스크립트로 `newRun` 뒤 `state.player.stats`를 ×1.6 하면 8칸(박새, 기본은 6칸·다음 칸까지 18). 4241 포트 썼음
- 쌓인 PR을 아래 PR 머지 뒤 정리할 때 `rebase --onto` + 강제 푸시는 자동 근무에서 거부된다 → 브랜치에 `git merge origin/main`(스쿼시 머지라 결과 같음) 후 일반 푸시. 로컬 `npm run check`의 version.json CRLF 포맷 오류는 worktree 줄끝 탓 — CI는 통과
- 드문 관문(2차 번식 등)을 봇으로 못 열면: 봇으로 둥지 단계까지 돌린 뒤 state에 `gate:{kind}`를 직접 넣어 `serialize`. 4217 포트도 다른 서버가 잡고 있었다 → 4229
- 4191 포트도 다른 부서 미리보기가 쓴다(같은 제목이라 헷갈림 — `--strictPort` 실패를 먼저 확인) — 4217 썼음. 4188 포트도 잡혀 있을 때가 있다 — 4191 등 다른 포트로. 관문 저장 넣기: 봇 스크립트 출력(JSON 문자열)을 `apps/web/dist/x.json`에 두고 브라우저에서 `fetch` → `localStorage.wb.run` (끝나면 지움). 봇 previews는 `disabled` 뺀 선택만. Python heredoc은 `PYTHONUTF8=1`, 상태 파일은 LF
- 브라우저 pane 모바일 크기에서는 좌표 클릭이 빗나간다 — `find`의 ref나 `data-testid` 클릭으로
- 미리보기 4173 포트가 다른 부서 서버에 잡혀 있을 수 있다 — `--port 4188 --strictPort`로. wb-client는 `main`을 체크아웃 못 할 때가 있다(다른 worktree가 씀) → `git switch --detach origin/main`
- 미리보기 서버를 끌 때 `taskkill /IM node.exe` 금지(다른 부서 node까지 죽음) — 백그라운드 작업 중지로만
- 봇으로 런 돌리는 노드 스크립트: 데이터는 `import { readDataDir } from '@wb/schema/cli/read-data'` → `const {raw}=await readDataDir(); const {data}=loadGameData(raw)`, previews는 `Map<id, Preview>`(fast-forward.ts와 같게)
- 관문 화면 확인(종 id는 `parus-minor`, newRun 설정 `{speciesId, seed, mode:'free'}`, 봇은 `import bot from './qa/bots/avg.ts'`의 `bot.choose({view, choices, previews})` — 스크립트는 저장소 루트에 임시로 두고 node로 실행 후 지움): 노드 스크립트로 봇을 관문까지 돌려 `serialize` → 브라우저에서 `localStorage.wb.run`에 넣고 새로고침 → 이어하기 (`readDataDir()`는 인자 없이 await)
- 빨리 감기는 `apps/web/src/fast-forward.ts`. 봇은 QA 파일을 읽기만 한다(고치지 말 것). 출시 숨김 = deploy.yml 태그 빌드의 `VITE_RELEASE`
- 배포: PR → `<브랜치>.wildlife-of-bird.pages.dev`(브랜치의 `/`는 `-`로), main → 스테이징, 태그 `v*` → 프로덕션(Pages 프로덕션 브랜치 이름 `production`). 주소는 Deploy 잡이 PR 댓글로 단다
- Deploy 로그의 `npx canceled due to missing packages ["wrangler@…"]`는 wrangler-action 내부 확인 단계 — 배포는 성공한다
- Vite `import.meta.glob` 옵션은 **리터럴**이어야 한다
- 화면 타입체크는 `npm run build -w @wb/web` 안의 `tsc -p .`(루트 `tsc`는 packages만). CI는 안 돌리고 deploy.yml이 돌린다
- Windows 체크아웃에서는 CRLF 때문에 `npm run lint`가 `version.json` 등을 잡는다 — CI(리눅스)에서는 문제 없음. 로컬은 `npx biome check apps`
- `loadGameData`는 effects가 없으면 `data` 없이 이슈 0건을 돌려준다
- 첫 화면 예산: JS+CSS gzip 200KB (#142 후 ≈136KB — @font-face 92개 포함). 글꼴 조각은 따로: 타이틀 화면 4개 ≈100KB
- 이 PC에는 Pretendard가 깔려 있어 글꼴 조각을 안 받는다 — 확인은 `document.fonts.load('16px "Pretendard Variable"')`
- 브라우저 pane은 `localhost` 대신 `127.0.0.1:4173`으로 연다(localhost는 거부됨)
- merge-pr.sh가 update-branch 직후 "no checks reported"로 멈추면 CI가 아직 안 붙은 것 — 잠시 뒤 다시
- Python으로 파일을 쓰면 Windows에서 CRLF가 된다 — `sed -i 's/
$//'`로 되돌리거나 `newline='
'`
- 로컬 확인: `npm run build -w @wb/web` 후 `npm run preview -w @wb/web -- --port 4173`
- 머지는 `bash scripts/merge-pr.sh <번호>` 한 줄만 단독으로(01-collaboration 8장). `gh pr merge` 직접 금지
- #63 rebase 충돌은 매번 `package-lock.json`뿐 — `git show origin/main:package-lock.json > package-lock.json && npm install`
- 아이콘 mask: Vite가 작은 SVG를 작은따옴표 든 `data:` 주소로 인라인 → `url("…")` 큰따옴표 필수(안 그러면 style이 통째로 무시됨)
- 자동 저장 키 `wb.run`(localStorage). 저장 형식이 다르면 새 판 + 안내
- 브라우저 pane 스크린샷은 클릭 직후 한 박자 늦을 때가 있다 — 확인은 `get_page_text`가 정확
- 브라우저 확인: 미리보기 서버는 Bash 백그라운드로 `npm run preview -w @wb/web -- --port 4173` → 브라우저 pane으로 localhost:4173 (preview_start는 다른 부서 폴더의 launch.json을 찾으니 쓰지 말 것)
