import './locale.ts';
import type { z } from 'zod';
import { Breeding } from './breeding.ts';
import { Calendar, calendarPhases } from './calendar.ts';
import { CodexEntry } from './codex.ts';
import { EffectsTable } from './effects.ts';
import type { GameEvent } from './events.ts';
import { GameEventFile, optionEffects } from './events.ts';
import { Formulas } from './formulas.ts';
import { MapNode } from './nodes.ts';
import { Predator } from './predators.ts';
import { SpeciesBalance, SpeciesEcology } from './species.ts';
import { TextFile } from './text.ts';

/**
 * 검증된 게임 데이터 묶음. 엔진의 모든 함수가 이것을 받는다 (03-contracts 3장).
 */
export interface GameData {
  effects: EffectsTable;
  formulas: Formulas;
  /** 번식 계수 (`04-breeding`) */
  breeding: Breeding;
  ecology: Map<string, SpeciesEcology>;
  balance: Map<string, SpeciesBalance>;
  /** 종별 연간 단계표 */
  calendar: Map<string, Calendar>;
  /** 지도 장소. id → 장소 */
  nodes: Map<string, MapNode>;
  /** 포식자. id → 포식자 */
  predators: Map<string, Predator>;
  events: GameEvent[];
  /** 도감. id → 항목 */
  codex: Map<string, CodexEntry>;
  /** 화면 문구. 키 → 문구 (모든 `data/text/` 파일을 합친 것) */
  text: Map<string, string>;
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
  breeding?: RawFile;
  ecology: RawFile[];
  balance: RawFile[];
  calendar: RawFile[];
  nodes: RawFile[];
  predators: RawFile[];
  events: RawFile[];
  /** 도감. 화면이 도감을 읽기 전에는 넘기지 않아도 된다 */
  codex?: RawFile[];
  /** 화면 문구. 화면이 읽기 전에는 넘기지 않아도 된다 */
  text?: RawFile[];
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

  const nodes = loadNodes(raw.nodes, ecology, issues);
  // 장소 파일이 아직 없으면(#110 전) 시작 장소는 확인하지 않는다
  if (nodes.size > 0) {
    for (const [speciesId, species] of balance) {
      const start = nodes.get(species.runStart.node);
      if (!start || !start.species.includes(speciesId)) {
        issues.push({
          file: balanceFile.get(speciesId) ?? 'data/balance/species',
          at: 'runStart.node',
          reason: `${speciesId}의 장소가 아니다: ${species.runStart.node} (data/nodes/)`,
        });
      }
    }
  }

  const predators = new Map<string, Predator>();
  for (const file of raw.predators) {
    const parsed = check(Predator, file, issues);
    if (!parsed) continue;
    if (predators.has(parsed.id)) {
      issues.push({ file: file.file, at: 'id', reason: `포식자 id가 겹친다: ${parsed.id}` });
      continue;
    }
    predators.set(parsed.id, parsed);
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
      checkPredatorsExist(event, index, predators, file.file, issues);
      events.push(event);
    }
  }

  const codex = loadCodex(raw.codex ?? [], { ecology, predators, nodes, events }, issues);
  const text = loadText(raw.text ?? [], issues);

  const effects = raw.effects ? check(EffectsTable, raw.effects, issues) : undefined;
  const formulas = raw.formulas ? check(Formulas, raw.formulas, issues) : undefined;
  if (formulas) checkAptitudeGrades(balance, balanceFile, formulas, issues);
  const breeding = raw.breeding ? check(Breeding, raw.breeding, issues) : undefined;
  if (breeding && raw.breeding)
    checkBreedingSpecies(breeding, raw.breeding.file, ecology, balance, issues);

  if (issues.length > 0 || !effects || !formulas || !breeding) return { issues };
  return {
    data: {
      effects,
      formulas,
      breeding,
      ecology,
      balance,
      calendar,
      nodes,
      predators,
      events,
      codex,
      text,
    },
    issues,
  };
}

/**
 * 도감을 읽고 파일 이름·대상·해금 조건의 id가 실제 데이터에 있는지 확인한다(#155).
 * 파일 이름은 id에서 `cx.`을 뺀 것이다.
 */
function loadCodex(
  files: RawFile[],
  known: {
    ecology: Map<string, SpeciesEcology>;
    predators: Map<string, Predator>;
    nodes: Map<string, MapNode>;
    events: GameEvent[];
  },
  issues: DataIssue[],
): Map<string, CodexEntry> {
  const eventIds = new Set(known.events.map((e) => e.id));
  const exists = {
    species: (id: string) => known.ecology.has(id),
    predator: (id: string) => known.predators.has(id),
    node: (id: string) => known.nodes.has(id),
  };
  const where = { species: 'data/species/', predator: 'data/predators/', node: 'data/nodes/' };
  const codex = new Map<string, CodexEntry>();
  for (const file of files) {
    const entry = check(CodexEntry, file, issues);
    if (!entry) continue;
    const name = file.file
      .split('/')
      .pop()
      ?.replace(/.json$/, '');
    if (`cx.${name}` !== entry.id) {
      issues.push({
        file: file.file,
        at: 'id',
        reason: `파일 이름은 ${entry.id.slice(3)}.json이어야 한다`,
      });
    }
    if (codex.has(entry.id)) {
      issues.push({ file: file.file, at: 'id', reason: `도감 id가 겹친다: ${entry.id}` });
      continue;
    }
    codex.set(entry.id, entry);
    const refs: [at: string, kind: keyof typeof exists, id: string][] = [];
    if (entry.kind !== 'phenomenon' && entry.target)
      refs.push(['target', entry.kind, entry.target]);
    const u = entry.unlock;
    if (u.on === 'run-start') refs.push(['unlock.species', 'species', u.species]);
    if (u.on === 'predator-met') refs.push(['unlock.predator', 'predator', u.predator]);
    if (u.on === 'node-visited') refs.push(['unlock.node', 'node', u.node]);
    for (const [at, kind, id] of refs) {
      if (!exists[kind](id)) {
        issues.push({ file: file.file, at, reason: `없는 id다: ${id} (${where[kind]})` });
      }
    }
    if (u.on === 'event-seen') {
      for (const [i, id] of u.events.entries()) {
        if (!eventIds.has(id)) {
          issues.push({
            file: file.file,
            at: `unlock.events[${i}]`,
            reason: `없는 이벤트다: ${id}`,
          });
        }
      }
    }
  }
  return codex;
}

/** 화면 문구를 합친다. 키의 첫 마디는 파일 이름이어야 한다(#254) — 그래서 파일끼리 키가 겹치지 않는다 */
function loadText(files: RawFile[], issues: DataIssue[]): Map<string, string> {
  const text = new Map<string, string>();
  for (const file of files) {
    const parsed = check(TextFile, file, issues);
    if (!parsed) continue;
    const name = file.file
      .split('/')
      .pop()
      ?.replace(/.json$/, '');
    for (const [key, value] of Object.entries(parsed)) {
      if (!key.startsWith(`${name}.`)) {
        issues.push({ file: file.file, at: key, reason: `키는 ${name}.으로 시작해야 한다` });
        continue;
      }
      text.set(key, value);
    }
  }
  return text;
}

/** 장소를 읽고 종·연결을 확인한다. 연결은 양방향이어야 한다(`00-core-loop` 3.4) */
function loadNodes(
  files: RawFile[],
  ecology: Map<string, SpeciesEcology>,
  issues: DataIssue[],
): Map<string, MapNode> {
  const nodes = new Map<string, MapNode>();
  const nodeFile = new Map<string, string>();
  for (const file of files) {
    const parsed = check(MapNode, file, issues);
    if (!parsed) continue;
    if (nodes.has(parsed.id)) {
      issues.push({ file: file.file, at: 'id', reason: `장소 id가 겹친다: ${parsed.id}` });
      continue;
    }
    nodes.set(parsed.id, parsed);
    nodeFile.set(parsed.id, file.file);
  }
  for (const node of nodes.values()) {
    const file = nodeFile.get(node.id) ?? 'data/nodes';
    for (const [i, speciesId] of node.species.entries()) {
      if (!ecology.has(speciesId)) {
        issues.push({ file, at: `species[${i}]`, reason: `생태 파일이 없는 종이다: ${speciesId}` });
      }
    }
    for (const [i, link] of node.links.entries()) {
      const other = nodes.get(link);
      const reason =
        link === node.id
          ? '자기 자신과 연결할 수 없다'
          : !other
            ? `없는 장소다: ${link}`
            : !other.links.includes(node.id)
              ? `${link}의 links에 ${node.id}가 없다 — 연결은 양방향이어야 한다`
              : undefined;
      if (reason) issues.push({ file, at: `links[${i}]`, reason });
    }
  }
  return nodes;
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

/** `breeding.species`의 종은 생태 파일이 있어야 하고, 밸런스가 있는 종은 번식 계수도 있어야 한다 */
function checkBreedingSpecies(
  breeding: Breeding,
  file: string,
  ecology: Map<string, SpeciesEcology>,
  balance: Map<string, SpeciesBalance>,
  issues: DataIssue[],
): void {
  for (const speciesId of Object.keys(breeding.species)) {
    if (!ecology.has(speciesId)) {
      issues.push({
        file,
        at: `species.${speciesId}`,
        reason: `생태 파일이 없는 종이다: ${speciesId}`,
      });
    }
  }
  for (const speciesId of balance.keys()) {
    if (!breeding.species[speciesId]) {
      issues.push({ file, at: 'species', reason: `${speciesId}의 번식 계수가 없다` });
    }
  }
}

/**
 * 이벤트 `deathRisk.predator`가 `data/predators/`에 있어야 한다.
 * 포식자 파일이 아직 없으면(#128 전) 확인하지 않는다.
 */
function checkPredatorsExist(
  event: GameEvent,
  index: number,
  predators: Map<string, Predator>,
  file: string,
  issues: DataIssue[],
): void {
  if (predators.size === 0) return;
  for (const [o, option] of event.options.entries()) {
    for (const effect of optionEffects(option)) {
      if (effect.type === 'deathRisk' && effect.predator && !predators.has(effect.predator)) {
        issues.push({
          file,
          at: `[${index}].options[${o}]`,
          reason: `없는 포식자다: ${effect.predator} (data/predators/)`,
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
