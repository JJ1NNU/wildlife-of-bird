/**
 * 시뮬레이션 실행:  npm run sim
 *
 * M0에서는 `data/`에 아직 종 데이터가 없으므로 "데이터가 준비되면 돈다"는 것만
 * 확인하고 끝낸다. 대량 실행·지표 집계·봇 3종은 M1(#21)이다.
 */
import { loadGameData } from '@wb/schema';
import { readDataDir } from '@wb/schema/cli/read-data';
import type { Bot } from '../index.ts';
import { runOne } from '../index.ts';

const firstChoiceBot: Bot = {
  name: 'first-choice',
  choose: ({ choices }) => choices[0]?.id ?? '',
};

const { raw, issues: readIssues } = await readDataDir();
const { data, issues } = loadGameData(raw);
const speciesId = process.argv[2] ?? (data ? [...data.ecology.keys()][0] : undefined);

if (!data || !speciesId) {
  console.error(
    [...readIssues, ...issues].length > 0
      ? '데이터가 어긋났다. `npm run validate:data`로 어디가 틀렸는지 보라.'
      : '아직 실행할 종 데이터가 없다. data/species/ · data/balance/effects.json · data/balance/formulas.json 이 필요하다.',
  );
  process.exit([...readIssues, ...issues].length > 0 ? 1 : 0);
}

const result = runOne(
  { speciesId, seed: process.argv[3] ?? 'sim-1', mode: 'free' },
  data,
  firstChoiceBot,
  2000,
);
console.log(
  `${result.botName} · ${speciesId} — 총 번식 ${result.totalBreeding}, ` +
    `${result.yearsSurvived}년, ${result.steps}단계`,
);
