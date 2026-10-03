/**
 * 시뮬레이션 실행 (#33).
 *
 *   npm run sim -- --bot qa/bots/random.ts --species parus-minor --runs 10 --seed-prefix qa [--out runs.jsonl]
 *     판마다 시드 `<접두어>-<i>`(i = 1..N)로 돌려 판 기록을 JSONL로 낸다(--out이 없으면 표준 출력).
 *     봇 모듈은 `Bot`을 `export default`한다.
 *
 *   npm run sim -- replay runs.jsonl [--resume-at k]
 *     판 기록을 다시 재생해 `finalStateHash`가 같은지 본다. k를 주면 k번째 선택 앞에서
 *     저장 → 불러오기 후 이어 간다. 다른 판이 있으면 종료 코드 1.
 *
 * 데이터가 없거나 틀리면 종료 코드 1.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { loadGameData } from '@wb/schema';
import { readDataDir, repoRoot } from '@wb/schema/cli/read-data';
import type { Bot, RunRecord } from '../index.ts';
import { replay, runOne } from '../index.ts';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    bot: { type: 'string' },
    species: { type: 'string' },
    runs: { type: 'string', default: '1' },
    'seed-prefix': { type: 'string', default: 'sim' },
    out: { type: 'string' },
    'resume-at': { type: 'string' },
  },
});

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const { raw, issues: readIssues } = await readDataDir();
const { data, issues } = loadGameData(raw);
if (!data) {
  fail(
    [...readIssues, ...issues].length > 0
      ? '데이터가 어긋났다. `npm run validate:data`로 어디가 틀렸는지 보라.'
      : '실행할 데이터가 없다. data/species/ · data/balance/effects.json · data/balance/formulas.json 이 필요하다.',
  );
}

if (positionals[0] === 'replay') {
  const file = positionals[1] ?? fail('판 기록 파일을 주라: npm run sim -- replay runs.jsonl');
  const resumeAt = values['resume-at'] === undefined ? undefined : Number(values['resume-at']);
  const records = readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as RunRecord);
  let mismatches = 0;
  for (const [i, record] of records.entries()) {
    const hash = replay(record, data, resumeAt);
    if (hash !== record.finalStateHash) {
      mismatches += 1;
      console.error(`다름: ${i + 1}번째 줄 (시드 ${record.config.seed})`);
    }
  }
  console.error(`리플레이 ${records.length}판 — 다름 ${mismatches}판`);
  process.exit(mismatches > 0 ? 1 : 0);
}

if (!values.bot) fail('봇 모듈을 주라: --bot qa/bots/<이름>.ts');
const bot = (await import(pathToFileURL(path.resolve(values.bot)).href)).default as Bot;
const speciesId = values.species ?? [...data.ecology.keys()][0];
if (!speciesId || !data.ecology.has(speciesId)) fail(`데이터가 없는 종이다: ${speciesId}`);
const runs = Number(values.runs);

const gameVersion = (
  JSON.parse(readFileSync(path.join(repoRoot, 'version.json'), 'utf8')) as { gameVersion: string }
).gameVersion;
let commit = 'unknown';
try {
  commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
} catch {}

const lines: string[] = [];
let errors = 0;
for (let i = 1; i <= runs; i += 1) {
  const config = { speciesId, seed: `${values['seed-prefix']}-${i}`, mode: 'free' } as const;
  const { config: c, bot: b, ...rest } = runOne(config, data, bot);
  if (rest.error) errors += 1;
  lines.push(JSON.stringify({ config: c, bot: b, gameVersion, commit, ...rest }));
}

if (values.out) writeFileSync(values.out, `${lines.join('\n')}\n`);
else console.log(lines.join('\n'));
console.error(`${bot.id}@${bot.version} · ${speciesId} — ${runs}판, 오류 ${errors}판`);
