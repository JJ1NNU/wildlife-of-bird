import type { GameData, StatName } from '@wb/schema';
import {
  chooseSecondBrood,
  endBreeding,
  secondBroodCards,
  secondBroodChoices,
  secondBroodDue,
} from './brood.ts';
import { advance, phaseAt, yearCalendar } from './calendar.ts';
import {
  chicksSurvive,
  clutchCards,
  clutchChoices,
  clutchOptions,
  expectedFledged,
  feedChicks,
  hatchIfDue,
} from './clutch.ts';
import { checkChance, previewEffects, resolveOption } from './events.ts';
import { agedStats, fatCap } from './formulas.ts';
import {
  chickCards,
  chooseInheritance,
  endLife,
  inheritanceChoices,
  inheritanceDue,
  openInheritance,
  startLife,
  stayCard,
} from './inherit.ts';
import {
  divorce,
  isPhaseStart,
  makeCandidates,
  mateCards,
  mateChoices,
  mateYear,
  potentialRange,
} from './mate.ts';
import { buildNest, nestCards, nestChoices, nestHoles, nestSurvives, releaseNest } from './nest.ts';
import {
  carryOrder,
  giveOrder,
  orderAcceptance,
  orderCards,
  orderChoices,
  orderDue,
  orderOptions,
} from './order.ts';
import { parentingChoices, parentingDue, setPolicy } from './parenting.ts';
import { seedFromString } from './rng.ts';
import { emptySlots, projected, routineSlots, runRoutine, suggestions } from './routine.ts';
import {
  breedingCost,
  judgeStep,
  mapNode,
  nextSlotIn,
  speciesBalance,
  stepChoices,
} from './step.ts';
import type {
  ActResult,
  Choice,
  EventOptionCard,
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
 * 실제 규칙이다. 관문은 짝 후보(`mateCandidate`)·짝 지시(`mateOrder`)·둥지 자리(`nestSite`)·산란수(`clutchSize`)·육아 방침(`parentingPolicy`)·2차 번식 여부(`secondBrood`, 실패 뒤·잔류 뒤)·계승(`inheritance`)이 있고, 부화·새끼 사망·독립을 굴린다. 단계 이벤트는 루틴의 칸마다 추첨해 관문(`event`)으로 멈춘다. 환경 카드는 아직 없다.
 */

/** 저장 형식 버전. 형식이 바뀌면 올린다 (03-contracts 6장) */
export const SAVE_VERSION = 6;

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
  const at = { year: 1, period: species.runStart.period, step: 1 };
  const player = {
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
  };
  return {
    config,
    rng: seedFromString(`${config.speciesId}:${config.seed}`),
    at,
    calendar: yearCalendar(data, config.speciesId),
    node,
    stay: 0,
    player,
    totalBreeding: 0,
    life: startLife({ at, player }, 1),
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
  if (state.gate?.kind === 'parentingPolicy') return parentingChoices(state, data);
  if (state.gate?.kind === 'secondBrood') return secondBroodChoices();
  if (state.gate?.kind === 'inheritance') return inheritanceChoices(state);
  if (state.gate?.kind === 'event')
    return gateEvent(state, data).options.map((o) => ({
      id: `event.${o.id}`,
      kind: 'eventOption',
      label: o.text,
    }));
  // 루틴의 다음 빈 칸 — 앞 칸에 옮기기를 넣었으면 그 장소 기준 (03-contracts 3장 '행동 루틴')
  return stepChoices(projected(state, data), data);
}

/** 열려 있는 이벤트 관문의 이벤트 */
function gateEvent(state: RunState, data: GameData) {
  const id = state.gate?.kind === 'event' ? state.gate.id : undefined;
  const event = data.events.find((e) => e.id === id);
  if (!event) throw new Error(`없는 이벤트다: ${String(id)}`);
  return event;
}

/** 이벤트 선택지 카드 — 효과 숫자, 판정형이면 성공 확률과 성공·실패 효과 (03-events 5.2·5.3) */
function eventCards(state: RunState, data: GameData): EventOptionCard[] {
  const fx = (effects: Parameters<typeof previewEffects>[1] = []) =>
    previewEffects(state, effects, data);
  return gateEvent(state, data).options.map((o) => ({
    choiceId: `event.${o.id}`,
    ...(o.check
      ? {
          chance: checkChance(
            data.formulas,
            state.player.stats[o.check.stat] ?? 0,
            data.effects.checkDifficulty[o.check.difficulty] ?? 0,
          ),
          onSuccess: fx(o.onSuccess),
          onFail: fx(o.onFail),
        }
      : { effects: fx(o.effects) }),
  }));
}

/** 고를 수 있는 선택을 찾는다. 목록에 없거나 `disabled`면 던진다 (03-contracts 3장, #47) */
function findChoice(state: RunState, choiceId: string, data: GameData): Choice {
  // 육아 방침은 항목 값을 `?` 뒤에 담는다 (03-contracts 3장)
  const id = choiceId.startsWith('parentingPolicy?') ? 'parentingPolicy' : choiceId;
  const choice = getChoices(state, data).find((c) => c.id === id);
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
    // S-22: 고를 방침을 걸었을 때의 이소 기대 수·내 번식 비용(04-breeding 6.4)
    const policy =
      state.gate.kind === 'parentingPolicy' ? setPolicy(state, choiceId, data).state : undefined;
    return {
      deathRisk: 0,
      energyDelta: [0, 0],
      ...(p === undefined ? {} : { mateAcceptance: p }),
      ...(policy
        ? {
            expectedFledged: expectedFledged(policy, data),
            breedingCost: breedingCost(policy, data),
          }
        : {}),
      notes: [],
    };
  }
  const from = projected(state, data);
  const out = judgeStep(from, choiceId, data, routineSlots(state, data));
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
  if (state.gate?.kind === 'parentingPolicy') return pickPolicy(state, choiceId, data);
  if (state.gate?.kind === 'secondBrood') return pickSecondBrood(state, choiceId, data);
  if (state.gate?.kind === 'inheritance') return pickInheritance(state, choiceId, data);
  if (state.gate?.kind === 'event') return pickEventOption(state, choiceId, data);
  const filled = [...(state.routine ?? []), choiceId];
  // 칸 채우기: 판정·난수 없음. 이벤트 뒤 다시 채우기면 남은 칸만
  if (filled.length < emptySlots(state, data))
    return { state: { ...state, routine: filled }, log: [] };

  const { routine: _r, ...planned } = state;
  const routed = runRoutine(planned, filled, data);
  // 이벤트로 멈춤 — 선택지를 고를 때까지 이 단계에 머문다 (03-contracts 3장)
  if (routed.event)
    return { state: { ...routed.state, log: [...state.log, ...routed.log] }, log: routed.log };
  const { paused, ...done } = routed.state;
  return endStep(
    state,
    { state: done, log: routed.log },
    paused?.nest ?? state.nest !== undefined,
    data,
  );
}

/**
 * 이벤트 선택지를 적용한다 (03-events 5장). 남은 칸이 있으면 다시 채우기로, 마지막 칸의 이벤트였으면 단계 끝으로.
 * 효과로 죽으면 런이 끝난다
 */
function pickEventOption(state: RunState, choiceId: string, data: GameData): ActResult {
  const event = gateEvent(state, data);
  const optionId = choiceId.slice('event.'.length);
  const option = event.options.find((o) => o.id === optionId);
  const out = resolveOption(state, event, optionId, data);
  const log: LogEntry[] = [
    { at: state.at, type: 'event', text: option?.text ?? optionId, event: event.id },
    ...out.log,
  ];
  const { gate: _g, paused, ...after } = out.state;
  // 이 단계 판정 뒤에 걸린 부상 — 남은 칸에는 배율이 붙지만 이 단계 끝에는 줄지 않는다 (03-events 6.1 `injury`)
  const fresh = (after.injury ?? 0) > (state.injury ?? 0);
  const closed: RunState = fresh ? { ...after, injuryFresh: true } : after;
  if (!paused) throw new Error('멈춘 루틴 없이 이벤트 관문이 열려 있다');
  if (out.death) {
    const text = out.death === 'starvation' ? '굶어 죽었다' : '목숨을 잃었다';
    const over: RunState = { ...closed, gameOver: true };
    log.push({ at: state.at, type: 'death', text, cause: out.death, life: endLife(over, 'death') });
    return { state: { ...over, log: [...state.log, ...log] }, log };
  }
  // 남은 칸 다시 채우기 — 결정으로 세지 않는다 (03-contracts 3장)
  if (paused.done < paused.slots)
    return { state: { ...closed, paused, log: [...state.log, ...log] }, log };
  return endStep(state, { state: closed, log }, paused.nest, data);
}

/**
 * 루틴을 다 실행한 단계의 끝: 부상 → 둥지 손실 → 부화 → 새끼 사망 → 은수저 → 독립·B-5 → 단계 끝 관문 → 다음 단계 (00-core-loop 4.6).
 * `hadNest` = 단계를 시작할 때 둥지가 있었나 (이벤트로 잃어도 B-5)
 */
function endStep(state: RunState, routed: ActResult, hadNest: boolean, data: GameData): ActResult {
  // 부상은 판정 3을 받은 단계가 끝날 때 1 준다 — 이 단계 이벤트로 걸린 부상은 다음 단계부터 센다 (03-events 6.1 `injury`)
  const ran = { ...routed, state: heal(routed.state) };
  const log = ran.log;
  if (ran.state.gameOver) return { state: { ...ran.state, log: [...state.log, ...log] }, log };
  // 둥지 손실: 둥지에 알·새끼가 있는 단계의 판정 3 다음 (01-formulas 3.2)
  const kept = nestSurvives(ran.state, data);
  log.push(...kept.log);
  const moved = kept.state;

  // 부화: `incubation` 마지막 단계의 판정 3 다음 (04-breeding 5장)
  const hatched = hatchIfDue(moved, data);
  log.push(...hatched.log);
  // 새끼 개별 사망: 급이 국면의 판정 3 다음 (01-formulas 3.3)
  const culled = chicksSurvive(hatched.state, data);
  log.push(...culled.log);
  // 은수저 충족도: 새끼 사망 다음, 살아남은 새끼로 (01-formulas 6.1)
  const raised = { state: feedChicks(culled.state, data) };
  // 독립(`postFledge` 마지막 단계): 총 번식 수 +1 → 계승 관문 (00-core-loop 6.1)
  if (inheritanceDue(raised.state)) {
    const opened = openInheritance(raised.state);
    log.push(...opened.log);
    return { state: { ...opened.state, log: [...state.log, ...log] }, log };
  }
  // 번식 실패(B-5): 2차 번식 여부 관문, 열리지 않으면 분할 해제 (00-core-loop 4.4 · 4.5)
  const failed = hadNest && raised.state.nest === undefined;
  if (failed && secondBroodDue(raised.state, data)) {
    return {
      state: { ...raised.state, gate: { kind: 'secondBrood' }, log: [...state.log, ...log] },
      log,
    };
  }
  let survived = failed ? endBreeding(raised.state) : raised.state;

  // 흐름의 마지막: 관문 (00-core-loop 4.6). 열리면 이 단계에 머문다
  if (isPhaseStart(state.calendar, state.at, 'pairing')) {
    // 관문 직전: 지난 짝과의 이혼 (04-breeding 2.1)
    const parted = divorce(survived, data);
    log.push(...parted.log);
    const { rng, candidates } = makeCandidates(parted.state, data);
    const opened: RunState = {
      ...parted.state,
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
  // 짝 없이 `nestSite`에 들어오면 그 해의 번식은 없다 — 분할 해제 (00-core-loop 4.6 · 4.5)
  if (!survived.mate && isPhaseStart(state.calendar, state.at, 'nestSite')) {
    survived = endBreeding(survived);
    log.push({ at: state.at, type: 'brood', text: '짝이 없어 올해는 번식하지 않는다' });
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

  const next = nextStep(survived, data);
  log.push(...next.log);
  return { state: { ...next.state, log: [...state.log, ...log] }, log };
}

/** 부상 1 감소, 0이면 지운다. 이 단계에 걸린 부상이면 표시만 지운다 (03-events 6.1 `injury`) */
function heal(state: RunState): RunState {
  const { injury, injuryFresh, ...rest } = state;
  if (injuryFresh && injury) return { ...rest, injury };
  return injury && injury > 1 ? { ...rest, injury: injury - 1 } : rest;
}

/**
 * 다음 단계로 (`period 1`이면 해 바뀜 처리까지). 시기가 바뀌면 시기 효과를 거둔다. 둥지 국면을 벗어나면 둥지와 육아 방침을, 국면이 바뀌면 지시를 거둔다.
 * 단계 시작 관문은 첫 칸보다 먼저 연다 — 짝 지시(04-breeding 3.1), 그다음 육아 방침(6.2)
 */
function nextStep(state: RunState, data: GameData): ActResult {
  const at = advance(state.at, state.calendar);
  // `riskMod`·`foodMod`는 그 시기가 끝날 때 사라진다 (03-events 6.1)
  const { periodMods, eventCooldown, ...rest } = state;
  const kept = at.period === state.at.period && periodMods ? { ...rest, periodMods } : rest;
  // 이벤트 쿨다운: 단계마다 1 준다 (03-events 3.1)
  const cooling = Object.entries(eventCooldown ?? {}).flatMap(([id, n]) =>
    n > 1 ? [[id, n - 1] as const] : [],
  );
  if (cooling.length > 0) Object.assign(kept, { eventCooldown: Object.fromEntries(cooling) });
  const year = yearStart({ ...kept, at }, data);
  const moved = releaseNest(year.state);
  const { parenting, ...carried } = carryOrder(state, moved, data);
  const next: RunState = carried.nest && parenting ? { ...carried, parenting } : carried;
  if (orderDue(next)) {
    return {
      state: { ...next, gate: { kind: 'mateOrder', options: orderOptions(next, data) } },
      log: year.log,
    };
  }
  return {
    state: parentingDue(next) ? { ...next, gate: { kind: 'parentingPolicy' } } : next,
    log: year.log,
  };
}

/** 짝 지시 관문을 닫는다 — 육아 방침 관문이 남았으면 열고, 아니면 같은 단계에서 이어 칸을 고른다 */
function pickOrder(state: RunState, choiceId: string, data: GameData): ActResult {
  const given = giveOrder(state, choiceId, data);
  const { gate: _g, ...closed } = given.state;
  const next: RunState = parentingDue(closed)
    ? { ...closed, gate: { kind: 'parentingPolicy' } }
    : closed;
  return { state: { ...next, log: [...state.log, ...given.log] }, log: given.log };
}

/** 육아 방침 관문을 닫는다 — 같은 단계에서 이어 칸을 고른다 (04-breeding 6.2) */
function pickPolicy(state: RunState, choiceId: string, data: GameData): ActResult {
  const set = setPolicy(state, choiceId, data);
  const { gate: _g, ...closed } = set.state;
  return { state: { ...closed, log: [...state.log, ...set.log] }, log: set.log };
}

/**
 * 계승 관문을 닫는다 (05-inheritance 5장). 잔류면 같은 단계에서 2차 번식 여부 관문(00-core-loop 6.2),
 * 열리지 않거나 계승이면 그 해 번식을 마치고 다음 단계로
 */
function pickInheritance(state: RunState, choiceId: string, data: GameData): ActResult {
  const chosen = chooseInheritance(state, choiceId, data);
  const stays = choiceId === 'inherit.stay';
  if (stays && secondBroodDue(chosen.state, data)) {
    const opened: RunState = { ...chosen.state, gate: { kind: 'secondBrood' } };
    return { state: { ...opened, log: [...state.log, ...chosen.log] }, log: chosen.log };
  }
  const next = nextStep(stays ? endBreeding(chosen.state) : chosen.state, data);
  const log = [...chosen.log, ...next.log];
  return { state: { ...next.state, log: [...state.log, ...log] }, log };
}

/** 2차 번식 여부 관문을 닫고 다음 단계로 간다 (04-breeding 7장) */
function pickSecondBrood(state: RunState, choiceId: string, data: GameData): ActResult {
  const chosen = chooseSecondBrood(state, choiceId, data);
  const { gate: _g, ...closed } = chosen.state;
  const next = nextStep(closed, data);
  const log = [...chosen.log, ...next.log];
  return { state: { ...next.state, log: [...state.log, ...log] }, log };
}

/** 둥지 자리 관문을 닫고 다음 단계로 간다 (04-breeding 4장) */
function pickNest(state: RunState, choiceId: string, data: GameData): ActResult {
  const built = buildNest(state, choiceId, data);
  const { gate: _g, ...closed } = built.state;
  const next = nextStep(closed, data);
  const log = [...built.log, ...next.log];
  return { state: { ...next.state, log: [...state.log, ...log] }, log };
}

/** 산란수 관문을 닫고 다음 단계로 간다 (04-breeding 5장) */
function pickClutch(state: RunState, choiceId: string, data: GameData): ActResult {
  const eggs = Number(choiceId.slice('clutchSize.'.length));
  if (!state.nest) throw new Error('둥지 없이 산란수 관문이 열려 있다');
  const { gate: _g, ...closed } = state;
  const next = nextStep({ ...closed, nest: { ...state.nest, eggs } }, data);
  const log: LogEntry[] = [
    { at: state.at, type: 'nest', text: `알 ${eggs}개를 낳았다` },
    ...next.log,
  ];
  return { state: { ...next.state, log: [...state.log, ...log] }, log };
}

/** 짝 후보 관문을 닫고 다음 단계로 간다 (04-breeding 2.2) */
function pickMate(state: RunState, choiceId: string, data: GameData): ActResult {
  const index = Number(choiceId.split('.')[1]) - 1;
  const c = state.gate?.kind === 'mateCandidate' ? state.gate.candidates[index] : undefined;
  if (!c) throw new Error(`없는 짝 후보다: ${choiceId}`);
  const { quality: _q, accepts: _a, plumageNoise: _n, hint: _h, previous, ...picked } = c;
  const m = data.breeding.mate;
  // 재결합: 유대 + bondReunion(상한 bondMax), 성격은 이미 확인 (2.2)
  const mate = previous
    ? { ...picked, bond: Math.min(m.bondMax, picked.bond + m.bondReunion), personalityKnown: true }
    : picked;
  const { gate: _g, mateGone: _gone, ...closed } = state;
  const next = nextStep({ ...closed, mate }, data);
  const log: LogEntry[] = [
    { at: state.at, type: 'mate', text: previous ? '지난 짝과 다시 맺었다' : '짝을 맺었다' },
    ...next.log,
  ];
  return { state: { ...next.state, log: [...state.log, ...log] }, log };
}

/** `period 1` 진입: 나이 +1 · 경험 +1 · 노화 · 단계표 초기화 (00-core-loop 2.1 `YearStart`) */
function yearStart(state: RunState, data: GameData): ActResult {
  if (state.at.period !== 1 || state.at.step !== 1) return { state, log: [] };
  const species = speciesBalance(data, state.config.speciesId);
  const age = state.player.age + 1;
  const mate = mateYear(state, data);
  const { yearNests: _y, ...rest } = mate.state;
  return {
    log: mate.log,
    state: {
      ...rest,
      calendar: yearCalendar(data, state.config.speciesId),
      player: {
        ...state.player,
        age,
        expYears: state.player.expYears + 1,
        stats: agedStats(data.formulas, species, age, state.player.stats),
      },
    },
  };
}

/**
 * 화면이 그대로 그리는 형태. 부족하면 클라이언트가 이슈로 요청한다.
 * 복사본을 돌려준다 — 화면·봇이 고쳐도 `RunState`가 바뀌지 않게(결정론, #33).
 */
export function getView(state: RunState, data: GameData): ViewModel {
  const nextIn = nextSlotIn(state, data);
  return structuredClone({
    at: state.at,
    phase: phaseAt(state.calendar, state.at),
    speciesId: state.config.speciesId,
    node: state.node,
    player: state.player,
    energyCap: fatCap(data.formulas, state.player.stats.stamina ?? 0),
    potentialRange: Object.fromEntries(
      Object.entries(state.player.potential).map(([stat, v]) => [
        stat,
        potentialRange(data.formulas, v ?? 0),
      ]),
    ),
    totalBreeding: state.totalBreeding,
    gameOver: state.gameOver,
    ...(state.gate?.kind === 'mateCandidate'
      ? {
          gate: {
            kind: state.gate.kind,
            cards: mateCards(data, state.gate.candidates),
            ...(state.mateGone ? { previousGone: state.mateGone } : {}),
          },
        }
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
    ...(state.gate?.kind === 'parentingPolicy'
      ? { gate: { kind: state.gate.kind, cards: parentingChoices(state, data)[0]?.items ?? [] } }
      : {}),
    ...(state.gate?.kind === 'secondBrood'
      ? { gate: { kind: state.gate.kind, cards: secondBroodCards(state, data) } }
      : {}),
    ...(state.gate?.kind === 'event'
      ? { gate: { kind: state.gate.kind, id: state.gate.id, cards: eventCards(state, data) } }
      : {}),
    ...(state.gate?.kind === 'inheritance'
      ? {
          gate: {
            kind: state.gate.kind,
            totalBreeding: state.totalBreeding,
            stay: stayCard(state, data),
            cards: chickCards(state, data),
          },
        }
      : {}),
    ...(state.nest ? { nest: state.nest } : {}),
    ...(state.gate || state.gameOver
      ? {}
      : {
          routine: {
            slots: emptySlots(state, data),
            ...(nextIn === undefined || state.paused ? {} : { nextSlotIn: nextIn }),
            filled: state.routine ?? [],
            suggested: suggestions(state, data),
            replan: state.paused !== undefined,
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
