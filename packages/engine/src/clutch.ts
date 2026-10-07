import type { GameData } from '@wb/schema';
import { advance, phaseAt } from './calendar.ts';
import { chickDeath } from './formulas.ts';
import { orderValue } from './order.ts';
import { chickDeathMult, feedIntensity } from './parenting.ts';
import { nextChance } from './rng.ts';
import type { Choice, ClutchSizeCard, LogEntry, RunState } from './types.ts';

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
 * 부화 — `incubation` 마지막 단계의 판정 3 다음에 알마다 `hatchRate`로 굴린다(5장). 부화한 수가 새끼 수.
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
  return {
    state: { ...state, rng, nest: { ...nest, chicks } },
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
  for (let i = 0; i < chicks; i++) {
    const r = nextChance(rng, p);
    rng = r.state;
    if (!r.value) alive++;
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
    state: { ...state, rng, nest: { ...nest, chicks: alive } },
    log: lost > 0 ? [{ at: state.at, type: 'nest', text: `새끼 ${lost}마리를 잃었다` }] : [],
  };
}
