import type { GameData, StatName } from '@wb/schema';
import { advance, phaseAt, yearCalendar } from './calendar.ts';
import { chicksSurvive, clutchCards, clutchChoices, clutchOptions, hatchIfDue } from './clutch.ts';
import { agedStats, fatCap } from './formulas.ts';
import { isPhaseStart, makeCandidates, mateCards, mateChoices } from './mate.ts';
import { buildNest, nestCards, nestChoices, nestHoles, releaseNest } from './nest.ts';
import {
  carryOrder,
  giveOrder,
  orderAcceptance,
  orderCards,
  orderChoices,
  orderDue,
  orderOptions,
} from './order.ts';
import { seedFromString } from './rng.ts';
import { projected, runRoutine, suggestions } from './routine.ts';
import { judgeStep, mapNode, slotCount, speciesBalance, stepChoices } from './step.ts';
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
 * 실제 규칙이다. 관문은 짝 후보(`mateCandidate`)·짝 지시(`mateOrder`)·둥지 자리(`nestSite`)·산란수(`clutchSize`)가 있고, 부화를 굴린다. 번식·계승·이벤트는 아직 없다.
 */

/** 저장 형식 버전. 형식이 바뀌면 올린다 (03-contracts 6장) */
export const SAVE_VERSION = 3;

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
  if (state.gate?.kind === 'mateCandidate') return mateChoices(state.gate.candidates);
  if (state.gate?.kind === 'mateOrder') return orderChoices(state, data, state.gate.options);
  if (state.gate?.kind === 'nestSite') return nestChoices(state.gate.holes);
  if (state.gate?.kind === 'clutchSize') return clutchChoices(state.gate.options);
  // 루틴의 다음 빈 칸 — 앞 칸에 옮기기를 넣었으면 그 장소 기준 (03-contracts 3장 '행동 루틴')
  return stepChoices(projected(state, data), data);
}

/** 고를 수 있는 선택을 찾는다. 목록에 없거나 `disabled`면 던진다 (03-contracts 3장, #47) */
function findChoice(state: RunState, choiceId: string, data: GameData): Choice {
  const choice = getChoices(state, data).find((c) => c.id === choiceId);
  if (!choice) throw new Error(`지금 고를 수 없는 선택이다: ${choiceId}`);
  if (choice.disabled) throw new Error(`막힌 선택이다: ${choiceId} — ${choice.disabled.reason}`);
  return choice;
}

/**
 * 선택의 예상 결과. 난수를 쓰지 않으므로 몇 번 불러도 같은 값이다 (엔진 원칙 2).
 * 칸 선택이면 앞에 채운 칸들을 위험 없이 적용한 예상 상태에서 그 칸 하나의 결과다.
 */
export function preview(state: RunState, choiceId: string, data: GameData): Preview {
  findChoice(state, choiceId, data);
  // 관문 고르기는 판정이 없다 — 위험·에너지 변화 없음. 짝 지시는 화면용 수락률(2.5)
  if (state.gate) {
    const p =
      state.gate.kind === 'mateOrder' ? orderAcceptance(state, data, choiceId, true) : undefined;
    return {
      deathRisk: 0,
      energyDelta: [0, 0],
      ...(p === undefined ? {} : { mateAcceptance: p }),
      notes: [],
    };
  }
  const from = projected(state, data);
  const out = judgeStep(from, choiceId, data);
  const delta = out.energy - from.player.energy;
  const statGains: Partial<Record<StatName, number>> = {};
  for (const [stat, value] of Object.entries(out.stats)) {
    const gain = value - (from.player.stats[stat as StatName] ?? 0);
    if (gain > 0) statGains[stat as StatName] = gain;
  }
  return {
    deathRisk: out.starved ? 1 : out.risk,
    energyDelta: [delta, delta],
    statGains,
    notes: out.starved ? ['이대로면 굶어 죽는다'] : [],
  };
}

/**
 * 선택을 실행한다. 칸 선택은 루틴에 적어 두기만 하고, 마지막 칸을 채우면 루틴을 실행해 한 단계 진행한다.
 * 모든 판정은 `LogEntry`를 남긴다 (엔진 원칙 5).
 */
export function act(state: RunState, choiceId: string, data: GameData): ActResult {
  if (state.gameOver) throw new Error('이미 끝난 런이다');
  findChoice(state, choiceId, data);
  if (state.gate?.kind === 'mateCandidate') return pickMate(state, choiceId, data);
  if (state.gate?.kind === 'mateOrder') return pickOrder(state, choiceId, data);
  if (state.gate?.kind === 'nestSite') return pickNest(state, choiceId, data);
  if (state.gate?.kind === 'clutchSize') return pickClutch(state, choiceId, data);
  const filled = [...(state.routine ?? []), choiceId];
  // 칸 채우기: 판정·난수 없음
  if (filled.length < slotCount(state)) return { state: { ...state, routine: filled }, log: [] };

  const { routine: _r, ...planned } = state;
  const ran = runRoutine(planned, filled, data);
  const log = ran.log;
  if (ran.state.gameOver) return { state: { ...ran.state, log: [...state.log, ...log] }, log };
  const moved = ran.state;

  // 부화: `incubation` 마지막 단계의 판정 3 다음 (04-breeding 5장)
  const hatched = hatchIfDue(moved, data);
  log.push(...hatched.log);
  // 새끼 개별 사망: 급이 국면의 판정 3 다음 (01-formulas 3.3)
  const raised = chicksSurvive(hatched.state, data);
  const survived = raised.state;
  log.push(...raised.log);

  // 흐름의 마지막: 관문 (00-core-loop 4.6). 열리면 이 단계에 머문다
  if (isPhaseStart(state.calendar, state.at, 'pairing')) {
    const { rng, candidates } = makeCandidates(survived, data);
    const opened: RunState = {
      ...survived,
      rng,
      gate: { kind: 'mateCandidate', candidates },
      log: [...state.log, ...log],
    };
    // 받아들이는 카드가 1장뿐이면 자동 진행 — 결정으로 세지 않는다(04-breeding 2.2)
    const accepted = candidates.flatMap((c, i) => (c.accepts ? [i] : []));
    if (accepted.length === 1) {
      const picked = pickMate(opened, `mateCandidate.${(accepted[0] ?? 0) + 1}`, data);
      return { state: picked.state, log: [...log, ...picked.log] };
    }
    return { state: opened, log };
  }
  // 둥지 자리: 짝이 있을 때만 (04-breeding 4장)
  if (survived.mate && isPhaseStart(state.calendar, state.at, 'nestSite')) {
    const holes = nestHoles(data, survived.node);
    return {
      state: { ...survived, gate: { kind: 'nestSite', holes }, log: [...state.log, ...log] },
      log,
    };
  }
  // 산란수: 둥지가 있을 때만 (04-breeding 5장)
  if (survived.nest && isPhaseStart(state.calendar, state.at, 'laying')) {
    const options = clutchOptions(data, state.config.speciesId);
    return {
      state: { ...survived, gate: { kind: 'clutchSize', options }, log: [...state.log, ...log] },
      log,
    };
  }

  return { state: { ...nextStep(survived, data), log: [...state.log, ...log] }, log };
}

/**
 * 다음 단계로 (`period 1`이면 해 바뀜 처리까지). 둥지 국면을 벗어나면 둥지를, 국면이 바뀌면 지시를 거둔다.
 * 짝이 있는 둥지 국면의 첫 단계면 첫 칸보다 먼저 짝 지시 관문을 연다 (04-breeding 3.1)
 */
function nextStep(state: RunState, data: GameData): RunState {
  const moved = releaseNest(yearStart({ ...state, at: advance(state.at, state.calendar) }, data));
  const next = carryOrder(state, moved, data);
  if (!orderDue(next)) return next;
  return { ...next, gate: { kind: 'mateOrder', options: orderOptions(next, data) } };
}

/** 짝 지시 관문을 닫는다 — 같은 단계에서 이어 칸을 고른다 (03-contracts 3장) */
function pickOrder(state: RunState, choiceId: string, data: GameData): ActResult {
  const given = giveOrder(state, choiceId, data);
  const { gate: _g, ...closed } = given.state;
  return { state: { ...closed, log: [...state.log, ...given.log] }, log: given.log };
}

/** 둥지 자리 관문을 닫고 다음 단계로 간다 (04-breeding 4장) */
function pickNest(state: RunState, choiceId: string, data: GameData): ActResult {
  const built = buildNest(state, choiceId, data);
  const { gate: _g, ...closed } = built.state;
  return {
    state: { ...nextStep(closed, data), log: [...state.log, ...built.log] },
    log: built.log,
  };
}

/** 산란수 관문을 닫고 다음 단계로 간다 (04-breeding 5장) */
function pickClutch(state: RunState, choiceId: string, data: GameData): ActResult {
  const eggs = Number(choiceId.slice('clutchSize.'.length));
  if (!state.nest) throw new Error('둥지 없이 산란수 관문이 열려 있다');
  const log: LogEntry[] = [{ at: state.at, type: 'nest', text: `알 ${eggs}개를 낳았다` }];
  const { gate: _g, ...closed } = state;
  return {
    state: {
      ...nextStep({ ...closed, nest: { ...state.nest, eggs } }, data),
      log: [...state.log, ...log],
    },
    log,
  };
}

/** 짝 후보 관문을 닫고 다음 단계로 간다 (04-breeding 2.2) */
function pickMate(state: RunState, choiceId: string, data: GameData): ActResult {
  const index = Number(choiceId.split('.')[1]) - 1;
  const c = state.gate?.kind === 'mateCandidate' ? state.gate.candidates[index] : undefined;
  if (!c) throw new Error(`없는 짝 후보다: ${choiceId}`);
  const { quality: _q, accepts: _a, plumageNoise: _n, hint: _h, ...mate } = c;
  const log: LogEntry[] = [{ at: state.at, type: 'mate', text: '짝을 맺었다' }];
  const { gate: _g, ...closed } = state;
  return { state: { ...nextStep({ ...closed, mate }, data), log: [...state.log, ...log] }, log };
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
    ...(state.gate?.kind === 'mateCandidate'
      ? { gate: { kind: state.gate.kind, cards: mateCards(data, state.gate.candidates) } }
      : {}),
    ...(state.gate?.kind === 'mateOrder'
      ? { gate: { kind: state.gate.kind, cards: orderCards(state, data, state.gate.options) } }
      : {}),
    ...(state.gate?.kind === 'nestSite'
      ? { gate: { kind: state.gate.kind, cards: nestCards(data, state, state.gate.holes) } }
      : {}),
    ...(state.gate?.kind === 'clutchSize'
      ? { gate: { kind: state.gate.kind, cards: clutchCards(data, state, state.gate.options) } }
      : {}),
    ...(state.nest ? { nest: state.nest } : {}),
    ...(state.gate || state.gameOver
      ? {}
      : {
          routine: {
            slots: slotCount(state),
            filled: state.routine ?? [],
            suggested: suggestions(state, data),
            replan: false,
          },
        }),
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
