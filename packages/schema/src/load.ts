import './locale.ts';
import type { z } from 'zod';
import { Calendar, calendarPhases } from './calendar.ts';
import { EffectsTable } from './effects.ts';
import type { GameEvent } from './events.ts';
import { GameEventFile, optionEffects } from './events.ts';
import { Formulas } from './formulas.ts';
import { SpeciesBalance, SpeciesEcology } from './species.ts';

/**
 * 검증된 게임 데이터 묶음. 엔진의 모든 함수가 이것을 받는다 (03-contracts 3장).
 * 장소·포식자·도감은 그 데이터의 소유 부서가 첫 파일을 올릴 때 형식을 확정하고
 * 여기에 더한다.
 */
export interface GameData {
  effects: EffectsTable;
  formulas: Formulas;
  ecology: Map<string, SpeciesEcology>;
  balance: Map<string, SpeciesBalance>;
  /** 종별 연간 단계표 */
  calendar: Map<string, Calendar>;
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
  formulas?: RawFile;
  ecology: RawFile[];
  balance: RawFile[];
  calendar: RawFile[];
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
  const balanceFile = new Map<string, string>();
  for (const file of raw.balance) {
    const parsed = check(SpeciesBalance, file, issues);
    if (!parsed) continue;
    balance.set(parsed.speciesId, parsed);
    balanceFile.set(parsed.speciesId, file.file);
    if (!ecology.has(parsed.speciesId)) {
      issues.push({
        file: file.file,
        at: 'speciesId',
        reason: `생태 파일이 없는 종이다: data/species/${parsed.speciesId}.ecology.json 이 필요하다`,
      });
    }
  }

  const calendar = new Map<string, Calendar>();
  for (const file of raw.calendar) {
    const parsed = check(Calendar, file, issues);
    if (!parsed) continue;
    calendar.set(parsed.speciesId, parsed);
    if (!ecology.has(parsed.speciesId)) {
      issues.push({
        file: file.file,
        at: 'speciesId',
        reason: `생태 파일이 없는 종이다: data/species/${parsed.speciesId}.ecology.json 이 필요하다`,
      });
    }
  }
  for (const [speciesId, species] of balance) {
    const file = balanceFile.get(speciesId) ?? 'data/balance/species';
    const cal = calendar.get(speciesId);
    if (!cal) {
      issues.push({
        file,
        at: 'speciesId',
        reason: `단계표가 없는 종이다: data/calendar/${speciesId}.json 이 필요하다`,
      });
      continue;
    }
    checkSpeciesPhases(species, calendarPhases(cal), file, issues);
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
      checkStatsExist(event, index, balance, file.file, issues);
      checkEventPhases(event, index, calendar, file.file, issues);
      events.push(event);
    }
  }

  const effects = raw.effects ? check(EffectsTable, raw.effects, issues) : undefined;
  const formulas = raw.formulas ? check(Formulas, raw.formulas, issues) : undefined;
  if (formulas) checkAptitudeGrades(balance, balanceFile, formulas, issues);

  if (issues.length > 0 || !effects || !formulas) return { issues };
  return { data: { effects, formulas, ecology, balance, calendar, events }, issues };
}

/**
 * 이벤트가 쓰는 스탯(`statGain`, 판정형 `check.stat`)이 이벤트의 모든 종의 적성에 있어야 한다
 * (03-events 6.2). 박새에 없는 `navigation`을 쓰는 이벤트를 막는다.
 */
function checkStatsExist(
  event: GameEvent,
  index: number,
  balance: Map<string, SpeciesBalance>,
  file: string,
  issues: DataIssue[],
): void {
  for (const [o, option] of event.options.entries()) {
    const stats = [
      ...(option.check ? [option.check.stat] : []),
      ...optionEffects(option).flatMap((e) => (e.type === 'statGain' ? [e.stat] : [])),
    ];
    for (const speciesId of event.species) {
      const species = balance.get(speciesId);
      if (!species) {
        if (stats.length > 0) {
          issues.push({
            file,
            at: `[${index}].options[${o}]`,
            reason: `스탯을 쓰는데 종 밸런스가 없거나 검증에 실패했다: data/balance/species/${speciesId}.json`,
          });
        }
        continue;
      }
      for (const stat of new Set(stats)) {
        if (species.aptitude[stat] === undefined) {
          issues.push({
            file,
            at: `[${index}].options[${o}]`,
            reason: `${speciesId}에 없는 스탯이다: ${stat} (종 밸런스 aptitude)`,
          });
        }
      }
    }
  }
}

/**
 * 종 밸런스가 쓰는 국면 이름이 그 종의 단계표에 있어야 한다 (#91). 없는 국면의 계수는
 * 조용히 쓰이지 않으므로(오타 `nestlng` 등) 여기서 잡는다.
 */
function checkSpeciesPhases(
  species: SpeciesBalance,
  phases: Set<string>,
  file: string,
  issues: DataIssue[],
): void {
  const used = [
    ...Object.keys(species.predatorActivity).map((p) => [`predatorActivity.${p}`, p] as const),
    ...species.flockPhases.map((p, i) => [`flockPhases[${i}]`, p] as const),
  ];
  for (const [at, phase] of used) {
    if (!phases.has(phase)) {
      issues.push({
        file,
        at,
        reason: `${species.speciesId}의 단계표에 없는 국면이다: ${phase} (data/calendar/${species.speciesId}.json)`,
      });
    }
  }
}

/** 이벤트의 `phaseAny`가 이벤트의 모든 종의 단계표에 있어야 한다 (#91) */
function checkEventPhases(
  event: GameEvent,
  index: number,
  calendar: Map<string, Calendar>,
  file: string,
  issues: DataIssue[],
): void {
  for (const speciesId of event.species) {
    const cal = calendar.get(speciesId);
    if (!cal) continue; // 단계표가 없는 종은 종 쪽 검사가 알린다
    const phases = calendarPhases(cal);
    for (const [p, phase] of (event.when.phaseAny ?? []).entries()) {
      if (!phases.has(phase)) {
        issues.push({
          file,
          at: `[${index}].when.phaseAny[${p}]`,
          reason: `${speciesId}의 단계표에 없는 국면이다: ${phase}`,
        });
      }
    }
  }
}

/** 종이 쓰는 적성 등급마다 공식의 평균·성장 계수가 있어야 한다 (`formulas.stats`) */
function checkAptitudeGrades(
  balance: Map<string, SpeciesBalance>,
  balanceFile: Map<string, string>,
  formulas: Formulas,
  issues: DataIssue[],
): void {
  for (const species of balance.values()) {
    const file = balanceFile.get(species.speciesId) ?? 'data/balance/species';
    for (const [stat, grade] of Object.entries(species.aptitude)) {
      if (
        formulas.stats.aptitudeMean[grade] === undefined ||
        formulas.stats.aptitudeGrowth[grade] === undefined
      ) {
        issues.push({
          file,
          at: `aptitude.${stat}`,
          reason: `등급 ${grade}의 계수가 data/balance/formulas.json의 stats.aptitudeMean·aptitudeGrowth에 없다`,
        });
      }
    }
  }
}
