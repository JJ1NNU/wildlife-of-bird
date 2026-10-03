import './locale.ts';
import type { z } from 'zod';
import { EffectsTable } from './effects.ts';
import type { GameEvent } from './events.ts';
import { GameEventFile } from './events.ts';
import { SpeciesBalance, SpeciesEcology } from './species.ts';

/**
 * 검증된 게임 데이터 묶음. 엔진의 모든 함수가 이것을 받는다 (03-contracts 3장).
 * M0에서는 03-contracts 4.1~4.3의 형식만 담는다. 장소·포식자·도감·단계표는
 * 그 데이터의 소유 부서가 첫 파일을 올릴 때 형식을 확정하고 여기에 더한다.
 */
export interface GameData {
  effects: EffectsTable;
  ecology: Map<string, SpeciesEcology>;
  balance: Map<string, SpeciesBalance>;
  events: GameEvent[];
}

/** 검증 실패 하나 — 어느 파일의 어디가 왜 틀렸는지 */
export interface DataIssue {
  /** 저장소 기준 상대 경로 */
  file: string;
  /** 파일 안의 위치. 예: `[3].options[0].effects[1].tier` */
  at: string;
  reason: string;
}

/** 읽어 온 파일 하나 (경로 + JSON.parse 결과) */
export interface RawFile {
  file: string;
  json: unknown;
}

function pathToString(path: readonly PropertyKey[]): string {
  if (path.length === 0) return '(파일 전체)';
  return path
    .map((k) => (typeof k === 'number' ? `[${k}]` : `.${String(k)}`))
    .join('')
    .replace(/^\./, '');
}

function check<T>(schema: z.ZodType<T>, raw: RawFile, issues: DataIssue[]): T | undefined {
  const result = schema.safeParse(raw.json);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    issues.push({ file: raw.file, at: pathToString(issue.path), reason: issue.message });
  }
  return undefined;
}

/** 검증기에 넘길 파일들. 없는 묶음은 빈 배열로 둔다(M0에는 아직 데이터가 없다). */
export interface RawGameData {
  effects?: RawFile;
  ecology: RawFile[];
  balance: RawFile[];
  events: RawFile[];
}

/**
 * 읽어 온 JSON을 검증해 `GameData`를 만든다. 파일 시스템을 쓰지 않는 순수 함수이므로
 * CLI와 테스트가 같은 코드를 쓴다.
 */
export function loadGameData(raw: RawGameData): { data?: GameData; issues: DataIssue[] } {
  const issues: DataIssue[] = [];

  const ecology = new Map<string, SpeciesEcology>();
  for (const file of raw.ecology) {
    const parsed = check(SpeciesEcology, file, issues);
    if (parsed) ecology.set(parsed.id, parsed);
  }

  const balance = new Map<string, SpeciesBalance>();
  for (const file of raw.balance) {
    const parsed = check(SpeciesBalance, file, issues);
    if (!parsed) continue;
    balance.set(parsed.speciesId, parsed);
    if (!ecology.has(parsed.speciesId)) {
      issues.push({
        file: file.file,
        at: 'speciesId',
        reason: `생태 파일이 없는 종이다: data/species/${parsed.speciesId}.ecology.json 이 필요하다`,
      });
    }
  }

  const events: GameEvent[] = [];
  for (const file of raw.events) {
    const parsed = check(GameEventFile, file, issues);
    if (!parsed) continue;
    for (const [index, event] of parsed.entries()) {
      for (const [sIndex, speciesId] of event.species.entries()) {
        if (!ecology.has(speciesId)) {
          issues.push({
            file: file.file,
            at: `[${index}].species[${sIndex}]`,
            reason: `생태 파일이 없는 종이다: ${speciesId}`,
          });
        }
      }
      events.push(event);
    }
  }

  const effects = raw.effects ? check(EffectsTable, raw.effects, issues) : undefined;

  if (issues.length > 0 || !effects) return { issues };
  return { data: { effects, ecology, balance, events }, issues };
}
