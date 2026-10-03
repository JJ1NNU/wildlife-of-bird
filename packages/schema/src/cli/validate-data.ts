/**
 * `data/`의 모든 데이터 파일을 검증한다. CI와 사람이 같은 명령을 쓴다.
 *
 *   npm run validate:data
 *
 * 실패하면 **파일 · 파일 안의 위치 · 이유**를 한 줄씩 적고 1로 끝난다.
 */
import { loadGameData } from '../load.ts';
import { readDataDir } from './read-data.ts';

const { raw, issues: readIssues } = await readDataDir();
const { data, issues: schemaIssues } = loadGameData(raw);
const issues = [...readIssues, ...schemaIssues];

const counted = [
  ['종 생태 (data/species)', raw.ecology.length],
  ['종 밸런스 (data/balance/species)', raw.balance.length],
  ['이벤트 파일 (data/events)', raw.events.length],
  ['효과 등급표 (data/balance/effects.json)', raw.effects ? 1 : 0],
  ['공식 계수 (data/balance/formulas.json)', raw.formulas ? 1 : 0],
] as const;

for (const [label, count] of counted) {
  console.log(count === 0 ? `건너뜀  ${label} — 아직 파일이 없다` : `검사함  ${label}: ${count}개`);
}

if (issues.length > 0) {
  console.error(`\n데이터 검증 실패 — ${issues.length}건\n`);
  for (const issue of issues) {
    console.error(`  ${issue.file}\n    위치: ${issue.at}\n    이유: ${issue.reason}`);
  }
  console.error('\n형식은 docs/studio/03-contracts.md 4장을 보라.');
  process.exit(1);
}

const checkedAny = counted.some(([, n]) => n > 0);
console.log(
  data
    ? `\n데이터 검증 통과 — 종 ${data.ecology.size}종, 이벤트 ${data.events.length}건`
    : checkedAny
      ? '\n데이터 검증 통과 — 검사한 파일 모두 이상 없음 (효과 등급표·공식 계수가 아직 없어 게임 데이터 묶음은 만들지 않았다)'
      : '\n데이터 검증 통과 — 아직 검사할 데이터가 없다',
);
