import type { GameData, StatName } from '@wb/schema';
import { advance, phaseAt, yearCalendar } from './calendar.ts';
import { agedStats, fatCap } from './formulas.ts';
import { nextChance, seedFromString } from './rng.ts';
import { judgeStep, mapNode, speciesBalance, stepChoices } from './step.ts';
import type {
  ActResult,
  Choice,
  LogEntry,
  Preview,
  RunConfig,
  RunState,
  ViewModel,
} from './types.ts';

/**
 * 엔진 API — 일곱 개의 순수 함수 (엔진 원칙 1, 03-contracts 3장).
 *
 * M1 진행 중(#21): 단계표·장소·행동·옮기기와 판정 1·2·3(에너지 → 스탯 → 위험), 아사·포식 사망은
 * 실제 규칙이다. 관문·번식·계승·이벤트는 아직 없다.
 */

/** 저장 형식 버전. 형식이 바뀌면 올린다 (03-contracts 6장) */
export const SAVE_VERSION = 2;

/** 새 런을 시작한다. 같은 설정이면 언제나 같은 초기 상태. */
export function newRun(config: RunConfig, data: GameData): RunState {
  if (!data.ecology.has(config.speciesId)) {
    throw new Error(
      `생태 데이터가 없는 종이다: ${config.speciesId} (data/species/${config.speciesId}.ecology.json)`,
    );
  }
  const f = data.formulas;
  const species = speciesBalance(data, config.speciesId);
  const node = species.runStart.node;
  if (!node) throw new Error(`런 시작 장소가 없다: ${config.speciesId}의 runStart.node`);
  mapNode(data, node);

  // 런 시작 개체(05-inheritance 2장): 잠재력 = 종 평균(난수 없음), 현재값 = 보통 짝 후보와 같은 비율
  const potential: Partial<Record<StatName, number>> = {};
  const stats: Partial<Record<StatName, number>> = {};
  for (const [stat, grade] of Object.entries(species.aptitude)) {
    const p = f.stats.aptitudeMean[grade] ?? 0;
    potential[stat as StatName] = p;
    stats[stat as StatName] = p * data.breeding.mate.candidateCurrentRatio;
  }
  return {
    config,
    rng: seedFromString(`${config.speciesId}:${config.seed}`),
    at: { year: 1, period: species.runStart.period, step: 1 },
    calendar: yearCalendar(data, config.speciesId),
    node,
    stay: 0,
    player: {
      speciesId: config.speciesId,
      // 런 시작 상태: 모든 종은 '첫 번식기를 앞둔 젊은 성조' (gdd 4.1장)
      sex: config.startSex ?? 'female',
      age: species.runStart.age,
      energy: fatCap(f, stats.stamina ?? 0) * f.energy.runStartRatio,
      stats,
      potential,
      feather: f.feather.runStart,
      // 05-inheritance 2장: 경험 연수 = `runStart.age` (짝 후보와 같은 셈)
      expYears: species.runStart.age,
    },
    totalBreeding: 0,
    gameOver: false,
    log: [],
  };
}

/** 지금 고를 수 있는 모든 선택. */
export function getChoices(state: RunState, data: GameData): Choice[] {
  if (state.gameOver) return [];
  return stepChoices(state, data);
}

/** 고를 수 있는 선택을 찾는다. 목록에 없거나 `disabled`면 던진다 (03-contracts 3장, #47) */
function findChoice(state: RunState, choiceId: string, data: GameData): Choice {
  const choice = getChoices(state, data).find((c) => c.id === choiceId);
  if (!choice) throw new Error(`지금 고를 수 없는 선택이다: ${choiceId}`);
  if (choice.disabled) throw new Error(`막힌 선택이다: ${choiceId} — ${choice.disabled.reason}`);
  return choice;
}

/** 선택의 예상 결과. 난수를 쓰지 않으므로 몇 번 불러도 같은 값이다 (엔진 원칙 2). */
export function preview(state: RunState, choiceId: string, data: GameData): Preview {
  findChoice(state, choiceId, data);
  const out = judgeStep(state, choiceId, data);
  const delta = out.energy - state.player.energy;
  const statGains: Partial<Record<StatName, number>> = {};
  for (const [stat, value] of Object.entries(out.stats)) {
    const gain = value - (state.player.stats[stat as StatName] ?? 0);
    if (gain > 0) statGains[stat as StatName] = gain;
  }
  return {
    deathRisk: out.starved ? 1 : out.risk,
    energyDelta: [delta, delta],
    statGains,
    notes: out.starved ? ['이대로면 굶어 죽는다'] : [],
  };
}

/** 선택을 실행하고 한 단계 진행한다. 모든 판정은 `LogEntry`를 남긴다 (엔진 원칙 5). */
export function act(state: RunState, choiceId: string, data: GameData): ActResult {
  if (state.gameOver) throw new Error('이미 끝난 런이다');
  const choice = findChoice(state, choiceId, data);
  const out = judgeStep(state, choiceId, data);
  const p = state.player;

  const deltas: Record<string, number> = {
    energy: out.energy - p.energy,
    feather: out.feather - p.feather,
  };
  for (const [stat, value] of Object.entries(out.stats)) {
    const gain = value - (p.stats[stat as StatName] ?? 0);
    if (gain !== 0) deltas[`stat.${stat}`] = gain;
  }
  const log: LogEntry[] = [{ at: state.at, type: 'decision', text: choice.label, deltas }];
  const player = { ...p, energy: out.energy, feather: out.feather, stats: out.stats };
  const moved = { ...state, node: out.node, stay: out.stay, player };

  // B-1 아사: 판정 1 직후 확정 사망. 스탯·위험은 건너뛴다 — 난수도 당기지 않는다
  if (out.starved) {
    log.push({ at: state.at, type: 'death', text: '굶어 죽었다', cause: 'starvation' });
    return { state: { ...moved, gameOver: true, log: [...state.log, ...log] }, log };
  }
  const rolled = nextChance(state.rng, out.risk);
  if (rolled.value) {
    log.push({ at: state.at, type: 'death', text: '포식자에게 잡혔다', cause: 'predation' });
    return {
      state: { ...moved, rng: rolled.state, gameOver: true, log: [...state.log, ...log] },
      log,
    };
  }

  const next: RunState = { ...moved, rng: rolled.state, at: advance(state.at, state.calendar) };
  return { state: { ...yearStart(next, data), log: [...state.log, ...log] }, log };
}

/** `period 1` 진입: 나이 +1 · 경험 +1 · 노화 · 단계표 초기화 (00-core-loop 2.1 `YearStart`) */
function yearStart(state: RunState, data: GameData): RunState {
  if (state.at.period !== 1 || state.at.step !== 1) return state;
  const species = speciesBalance(data, state.config.speciesId);
  const age = state.player.age + 1;
  return {
    ...state,
    calendar: yearCalendar(data, state.config.speciesId),
    player: {
      ...state.player,
      age,
      expYears: state.player.expYears + 1,
      stats: agedStats(data.formulas, species, age, state.player.stats),
    },
  };
}

/**
 * 화면이 그대로 그리는 형태. 부족하면 클라이언트가 이슈로 요청한다.
 * 복사본을 돌려준다 — 화면·봇이 고쳐도 `RunState`가 바뀌지 않게(결정론, #33).
 */
export function getView(state: RunState, data: GameData): ViewModel {
  return structuredClone({
    at: state.at,
    phase: phaseAt(state.calendar, state.at),
    speciesId: state.config.speciesId,
    node: state.node,
    player: state.player,
    energyCap: fatCap(data.formulas, state.player.stats.stamina ?? 0),
    totalBreeding: state.totalBreeding,
    gameOver: state.gameOver,
    recentLog: state.log.slice(-20),
  });
}

/** 저장 문자열. 버전을 함께 적는다 (03-contracts 6장). */
export function serialize(state: RunState): string {
  return JSON.stringify({ saveVersion: SAVE_VERSION, state });
}

/**
 * 저장 문자열을 상태로. 버전이 다르면 던진다 —
 * 친구 알파(M3) 전에는 화면이 "새 게임 시작"을 안내하면 충분하고,
 * 알파 이후 형식이 바뀔 때부터 마이그레이션을 만든다 (엔진 원칙 6).
 */
export function deserialize(text: string, _data: GameData): RunState {
  const parsed = JSON.parse(text) as { saveVersion?: number; state?: RunState };
  if (parsed.saveVersion !== SAVE_VERSION) {
    throw new Error(
      `저장 형식이 다르다: 저장 ${String(parsed.saveVersion)} / 지금 ${SAVE_VERSION}. 새 게임을 시작해야 한다`,
    );
  }
  if (!parsed.state) throw new Error('저장 파일에 state가 없다');
  return parsed.state;
}
