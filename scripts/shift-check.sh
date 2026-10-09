#!/usr/bin/env bash
# 자동 근무 근무표 확인 (D-030). 부서 예약 작업이 근무 맨 앞에서 부른다.
# 사용(어느 worktree에서든): git fetch -q origin main && git show origin/main:scripts/shift-check.sh | bash -s <부서>
# 근무표: origin/main의 docs/status/shifts.json — 부서별 시간당 근무 횟수(0~3).
# 예약 작업은 :10 :30 :50에 돈다(지연 20분 미만). 지금 분으로 칸을 정한다:
#   칸 0 = :10~:29, 칸 1 = :30~:49, 칸 2 = :50~:09. 횟수가 n이면 칸 0..n-1만 근무.
# 출력: "근무 …"(exit 0) 또는 "비번 …"(exit 1). 근무표를 못 읽으면 근무(안전한 쪽).
set -uo pipefail
dept="${1:?사용: shift-check.sh <부서>}"
table="$(git show origin/main:docs/status/shifts.json 2>/dev/null)" || { echo "근무 (근무표 없음)"; exit 0; }
SHIFTS="$table" DEPT="$dept" node -e '
let n = 2;
try {
  const v = JSON.parse(process.env.SHIFTS).perHour[process.env.DEPT];
  if (Number.isInteger(v)) n = Math.max(0, Math.min(3, v));
} catch { console.log("근무 (근무표 읽기 실패)"); process.exit(0); }
const m = new Date().getMinutes();
const slot = m >= 10 && m < 30 ? 0 : m >= 30 && m < 50 ? 1 : 2;
const on = slot < n;
console.log(`${on ? "근무" : "비번"} (${process.env.DEPT} 시간당 ${n}회, 지금 칸 ${slot})`);
process.exit(on ? 0 : 1);
'
