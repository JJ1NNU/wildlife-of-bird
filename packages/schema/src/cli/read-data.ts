import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { DataIssue, RawFile, RawGameData } from '../load.ts';

/** 저장소 뿌리. 이 파일은 `packages/schema/src/cli/`에 있다. */
export const repoRoot = path.resolve(import.meta.dirname, '../../../..');

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

/** 파일을 읽어 JSON으로 만든다. 읽기·파싱 실패도 검증 실패로 보고한다. */
function readJson(absolute: string, issues: DataIssue[]): RawFile | undefined {
  const file = toPosix(path.relative(repoRoot, absolute));
  try {
    return { file, json: JSON.parse(readFileSync(absolute, 'utf8')) };
  } catch (error) {
    issues.push({
      file,
      at: '(파일 전체)',
      reason: `JSON으로 읽을 수 없다: ${(error as Error).message}`,
    });
    return undefined;
  }
}

/** 디렉터리의 파일 목록. 디렉터리가 아직 없으면 빈 배열(M0에는 데이터가 없다). */
async function listFiles(dir: string, suffix: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(path.join(repoRoot, dir));
  } catch {
    return [];
  }
  return entries
    .filter((name) => name.endsWith(suffix))
    .sort()
    .map((name) => path.join(repoRoot, dir, name));
}

/** `data/`를 읽어 검증기에 넘길 모양으로 만든다. */
export async function readDataDir(): Promise<{ raw: RawGameData; issues: DataIssue[] }> {
  const issues: DataIssue[] = [];
  const read = (files: string[]) =>
    files.map((f) => readJson(f, issues)).filter((f): f is RawFile => f !== undefined);

  /** 파일 하나짜리 묶음. 아직 없으면 undefined */
  const readOne = (relative: string) => {
    const absolute = path.join(repoRoot, relative);
    return existsSync(absolute) ? readJson(absolute, issues) : undefined;
  };
  const effects = readOne('data/balance/effects.json');
  const formulas = readOne('data/balance/formulas.json');
  const breeding = readOne('data/balance/breeding.json');

  return {
    raw: {
      ...(effects ? { effects } : {}),
      ...(formulas ? { formulas } : {}),
      ...(breeding ? { breeding } : {}),
      ecology: read(await listFiles('data/species', '.ecology.json')),
      balance: read(await listFiles('data/balance/species', '.json')),
      calendar: read(await listFiles('data/calendar', '.json')),
      nodes: read(await listFiles('data/nodes', '.json')),
      predators: read(await listFiles('data/predators', '.json')),
      events: read(await listFiles('data/events', '.json')),
    },
    issues,
  };
}
