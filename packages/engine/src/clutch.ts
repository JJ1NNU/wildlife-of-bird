import type { GameData } from '@wb/schema';
import { phaseAt } from './calendar.ts';
import type { Choice, ClutchSizeCard, RunState } from './types.ts';

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
