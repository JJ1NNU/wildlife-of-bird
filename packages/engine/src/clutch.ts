import type { GameData, StatName } from '@wb/schema';
import { advance, phaseAt } from './calendar.ts';
import {
  chickDeath,
  childPotential,
  feedingFulfilment,
  forageEfficiency,
  seasonOf,
} from './formulas.ts';
import { orderValue } from './order.ts';
import { chickDeathMult, feedIntensity, policy } from './parenting.ts';
import { nextChance, nextFloat, nextNormal, type RngState } from './rng.ts';
import { mapNode, speciesBalance } from './step.ts';
import type { Chick, Choice, ClutchSizeCard, LogEntry, RunState } from './types.ts';

/**
 * 산란수 관문 `clutchSize` — 04-breeding 5장. `laying` 첫 단계, 흐름의 마지막에 열린다(둥지가 있을 때만).
 * 고르는 순간 알이 모두 둥지에 있다. 플레이어가 암컷이면 관문 뒤의 `laying` 단계마다 산란 비용을 낸다.
 * 잠정(#21): 카드의 이소 기대 수·은수저 지수(5장 화면)는 둥지 손실·새끼 사망·은수저 조각에서 더한다.
 */

function breedingSpecies(data: GameData, speciesId: string) {
  const s = data.breeding.species[speciesId];
  if (!s) throw new Error(`번식 데이터가 없는 종이다: ${speciesId} (data/balance/breeding.json)`);
  return s;
}

export function clutchOptions(data: GameData, speciesId: string): number[] {
  return [...breedingSpecies(data, speciesId).clutchOptions];
}

export function clutchChoices(options: number[]): Choice[] {
  return options.map((n) => ({ id: `clutchSize.${n}`, kind: 'clutchSize', label: `알 ${n}개` }));
}

/** 알 `eggs`개일 때 `laying` 단계 하나의 산란 비용 — 암컷만 (5장) */
function costFor(data: GameData, state: RunState, eggs: number): number {
  if (state.player.sex !== 'female') return 0;
  return breedingSpecies(data, state.config.speciesId).layingCostPerEgg * eggs;
}

/** 이 단계에 내는 산란 비용 (01-formulas 2.4 번식 비용 칸) */
export function layingCost(data: GameData, state: RunState): number {
  const eggs = state.nest?.eggs;
  if (eggs === undefined || phaseAt(state.calendar, state.at) !== 'laying') return 0;
  return costFor(data, state, eggs);
}

/** 화면 카드 — 산란 단계 비용 */
export function clutchCards(data: GameData, state: RunState, options: number[]): ClutchSizeCard[] {
  return options.map((eggs) => ({
    choiceId: `clutchSize.${eggs}`,
    eggs,
    layingCost: costFor(data, state, eggs),
  }));
}

/**
 * 새끼 하나의 성별 → 잠재력 6개(`species.aptitude` 키 순서) — 05-inheritance 3장, 01-formulas 5장.
 * 어미·아비 = 플레이어와 짝. 짝이 없으면 그 쪽은 종 평균(잠정 #139 — 둥지 국면엔 늘 짝이 있다)
 */
function makeChick(
  rng: RngState,
  state: RunState,
  data: GameData,
): { rng: RngState; chick: Chick } {
  const f = data.formulas;
  const species = speciesBalance(data, state.config.speciesId);
  const u = nextFloat(rng);
  let next = u.state;
  const sex = u.value < f.heredity.femaleShare ? 'female' : 'male';
  const potential: Partial<Record<StatName, number>> = {};
  for (const [stat, grade] of Object.entries(species.aptitude)) {
    const s = stat as StatName;
    const mean = f.stats.aptitudeMean[grade] ?? 0;
    const own = state.player.potential[s] ?? mean;
    const mate = state.mate?.potential[s] ?? mean;
    const female = state.player.sex === 'female';
    const z = nextNormal(next);
    next = z.state;
    potential[s] = childPotential(f, species, {
      stat: s,
      mother: female ? own : mate,
      father: female ? mate : own,
      z: z.value,
    });
  }
  return { rng: next, chick: { sex, potential } };
}

/**
 * 부화 — `incubation` 마지막 단계의 판정 3 다음에 알마다 `hatchRate`로 굴린다(5장). 부화한 수가 새끼 수.
 * 알을 다 굴린 뒤 부화한 새끼마다 성별·잠재력을 정한다(05-inheritance 3장).
 * 0이면 B-5 새끼 전멸: 그 번식은 실패하고 둥지를 거둔다.
 * 실패 뒤 2차 번식 관문·분할 해제는 `brood.ts`(api.ts가 연다).
 */
export function hatchIfDue(state: RunState, data: GameData): { state: RunState; log: LogEntry[] } {
  const nest = state.nest;
  if (nest?.eggs === undefined || nest.chicks !== undefined) return { state, log: [] };
  if (phaseAt(state.calendar, state.at) !== 'incubation') return { state, log: [] };
  if (phaseAt(state.calendar, advance(state.at, state.calendar)) === 'incubation') {
    return { state, log: [] };
  }
  const rate = breedingSpecies(data, state.config.speciesId).hatchRate;
  let rng = state.rng;
  let chicks = 0;
  for (let i = 0; i < nest.eggs; i++) {
    const r = nextChance(rng, rate);
    rng = r.state;
    if (r.value) chicks++;
  }
  if (chicks === 0) {
    const { nest: _n, ...rest } = state;
    return {
      state: { ...rest, rng },
      log: [
        { at: state.at, type: 'brood', text: '알이 하나도 깨지 않았다', cause: 'hatchFailure' },
      ],
    };
  }
  const young: Chick[] = [];
  for (let i = 0; i < chicks; i++) {
    const made = makeChick(rng, state, data);
    rng = made.rng;
    young.push(made.chick);
  }
  return {
    state: { ...state, rng, nest: { ...nest, chicks, young } },
    log: [{ at: state.at, type: 'nest', text: `새끼 ${chicks}마리가 깨어났다` }],
  };
}

/**
 * 새끼 개별 사망 — `nestling` `postFledge` 단계마다 새끼 1마리씩 굴린다(01-formulas 3.3).
 * 루틴의 판정 뒤 단계당 1번 굴린다: 확률이 칸의 행동과 무관해 칸마다 `1 − (1 − p)^(1/n)`로 n번 굴리는 것(9.4)과 분포가 같다.
 * 모두 죽으면 B-5: 그 번식은 실패하고 둥지를 거둔다.
 * 육아 방침의 급이 강도·배율(04-breeding 6.3)과 짝 지시 `splitBrood`의 배율을 건다.
 */
export function chicksSurvive(
  state: RunState,
  data: GameData,
): { state: RunState; log: LogEntry[] } {
  const nest = state.nest;
  const chicks = nest?.chicks ?? 0;
  const phase = phaseAt(state.calendar, state.at);
  if (!nest || chicks === 0 || (phase !== 'nestling' && phase !== 'postFledge')) {
    return { state, log: [] };
  }
  const split = data.breeding.orders.splitBrood?.chickDeathMult ?? 1;
  const p =
    chickDeath(data.formulas, feedIntensity(state, data)) *
    chickDeathMult(state, data) *
    orderValue(state, 'mateOrder.splitBrood', 1, split);
  let rng = state.rng;
  let alive = 0;
  const young: Chick[] = [];
  for (let i = 0; i < chicks; i++) {
    const r = nextChance(rng, p);
    rng = r.state;
    if (r.value) continue;
    alive++;
    const chick = nest.young?.[i];
    if (chick) young.push(chick);
  }
  if (alive === 0) {
    const { nest: _n, ...rest } = state;
    return {
      state: { ...rest, rng },
      log: [{ at: state.at, type: 'brood', text: '새끼를 모두 잃었다', cause: 'chickDeath' }],
    };
  }
  const lost = chicks - alive;
  return {
    state: { ...state, rng, nest: { ...nest, chicks: alive, ...(nest.young ? { young } : {}) } },
    log: lost > 0 ? [{ at: state.at, type: 'nest', text: `새끼 ${lost}마리를 잃었다` }] : [],
  };
}

/**
 * 은수저 충족도 — `nestling` `postFledge` 단계마다 새끼 사망 다음에 살아남은 새끼 수로 계산해 둥지에 쌓는다(01-formulas 6.1).
 * 부모 = 플레이어(육아 방침의 급이 강도)와 짝(`mid`, 지시 `feedHigh`면 그 값 — 거절이면 사이 값, 04-breeding 3.5).
 * 먹이 등급은 둥지 장소의 그 계절 값. 먹이 질 `quality`면 `× fulfilmentMult`(상한 1, 04-breeding 6.3)
 */
export function feedChicks(state: RunState, data: GameData): RunState {
  const nest = state.nest;
  const chicks = nest?.chicks ?? 0;
  const phase = phaseAt(state.calendar, state.at);
  if (!nest || chicks === 0 || (phase !== 'nestling' && phase !== 'postFledge')) return state;
  const f = data.formulas;
  const feed = f.silverSpoon.feedByIntensity;
  const season = seasonOf(speciesBalance(data, state.config.speciesId), state.at.period);
  const food = mapNode(data, nest.node).seasons[season].food;
  const parents = [
    {
      feed: feed[feedIntensity(state, data)],
      efficiency: forageEfficiency(f, state.player.stats.foraging ?? 0, state.player.expYears),
    },
  ];
  if (state.mate) {
    parents.push({
      feed: orderValue(state, 'mateOrder.feedHigh', feed.mid, feed.high),
      efficiency: forageEfficiency(f, state.mate.stats.foraging ?? 0, state.mate.expYears),
    });
  }
  const quality = data.breeding.parenting.foodQuality[policy(state, data, 'foodQuality')];
  const value = Math.min(
    1,
    feedingFulfilment(f, { parents, food, chicks }) * (quality?.fulfilmentMult ?? 1),
  );
  const spoon = { sum: (nest.spoon?.sum ?? 0) + value, steps: (nest.spoon?.steps ?? 0) + 1 };
  return { ...state, nest: { ...nest, spoon } };
}

/**
 * 새끼 하나의 은수저 지수(0~1) — 충족도 평균 → 이소 시점 `early` 가감 → 첫째 새끼(살아 있는 새끼 중 부화 순서 첫째)
 * `compete` 가감 → 0~1로 자른다(04-breeding 6.3). `i`는 `nest.young`의 순서. 급이 단계가 없었으면 0
 */
export function silverSpoonIndex(state: RunState, data: GameData, i: number): number {
  const spoon = state.nest?.spoon;
  if (!spoon || spoon.steps === 0) return 0;
  const p = data.breeding.parenting;
  let v = spoon.sum / spoon.steps;
  v = Math.max(0, v + (p.fledgeTiming[policy(state, data, 'fledgeTiming')]?.silverSpoon ?? 0));
  if (i === 0) v += p.allocation[policy(state, data, 'allocation')]?.topChickSilverSpoon ?? 0;
  return Math.min(1, v);
}
