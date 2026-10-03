import type { Formulas, RiskTier, SpeciesBalance, StatName, Tier } from '@wb/schema';

/**
 * `docs/design/specs/01-formulas.md` v0의 공식. 모두 순수 함수이고 난수를 쓰지 않는다 —
 * 난수가 필요한 판정(`u < p`)은 `act`가 이 함수들이 준 확률로 굴린다.
 * 계수는 전부 `data/balance/`에서 온다(엔진 원칙 4). 절 번호는 명세의 절이다.
 */

export type ActionId = keyof Formulas['actions'];
export type FoodTier = keyof Formulas['nodeTiers']['food'];
export type NodeRiskTier = keyof Formulas['nodeTiers']['risk'];
export type CompetitionTier = keyof Formulas['nodeTiers']['competition'];
export type Intensity = keyof Formulas['energy']['feedCostByIntensity'];
export type Season = keyof SpeciesBalance['basalPerStep'];

/** 그 시기에 걸린 이벤트·환경 효과 하나 (`foodMod`·`riskMod`) */
export interface FoodMod {
  tier: Tier;
  sign: 'gain' | 'loss';
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

// ── 1. 스탯 ──────────────────────────────────────────────

/** 1.1 화면 등급: 값이 `from` 이상인 가장 높은 등급 */
export function statGrade(f: Formulas, value: number): string {
  let grade = f.stats.grades[0]?.grade ?? '';
  for (const g of f.stats.grades) if (value >= g.from) grade = g.grade;
  return grade;
}

/** 1.3 스탯 상승량. `base`는 행동의 기본 상승(또는 이벤트 `statGain` 등급 값) */
export function statGain(
  f: Formulas,
  species: SpeciesBalance,
  input: { stat: StatName; base: number; potential: number; current: number; growthMult: number },
): number {
  const aptitude = species.aptitude[input.stat];
  const growth = aptitude ? (f.stats.aptitudeGrowth[aptitude] ?? 0) : 0;
  const taper = clamp((input.potential - input.current) / f.stats.gainTaperWithin, 0, 1);
  return input.base * growth * input.growthMult * taper;
}

// ── 2. 에너지 ────────────────────────────────────────────

/** 2.1 지방 상한 */
export function fatCap(f: Formulas, stamina: number): number {
  return f.energy.capBase + f.energy.capPerStamina * stamina;
}

/** 2.2 채식 효율. `expYears` = `period 1`을 지난 횟수 */
export function forageEfficiency(f: Formulas, foraging: number, expYears: number): number {
  const e = f.energy;
  return (
    e.forageEffBase +
    e.forageEffPerStat * foraging +
    e.forageEffPerExpYear * Math.min(expYears, e.expYearsCap)
  );
}

/** 2.3 먹이 보정: 걸린 `foodMod`마다 `1 ± effects.foodMod[등급]`의 곱 */
export function foodModFactor(foodMod: Record<Tier, number>, mods: readonly FoodMod[]): number {
  return mods.reduce(
    (m, x) => m * (x.sign === 'gain' ? 1 + foodMod[x.tier] : 1 - foodMod[x.tier]),
    1,
  );
}

/** 2.3 섭취 */
export function intake(
  f: Formulas,
  input: {
    food: FoodTier;
    competition: CompetitionTier;
    foodModFactor: number;
    efficiency: number;
    action: ActionId;
    /** 그 장소에 도착한 뒤 지난 단계 수. 도착한 단계는 0 */
    stay: number;
  },
): number {
  const e = f.energy;
  const depletion = Math.max(e.depletionFloor, 1 - e.depletionPerStay * input.stay);
  return (
    f.nodeTiers.food[input.food] *
    input.foodModFactor *
    input.efficiency *
    f.actions[input.action].intakeMult *
    depletion *
    (1 - f.nodeTiers.competition[input.competition])
  );
}

/** 2.4 행동 비용. `move`만 비행 스탯으로 줄어든다 */
export function actionCost(f: Formulas, action: ActionId, flight: number): number {
  const cost = f.actions[action].cost;
  if (action !== 'move') return cost;
  return cost * (f.energy.moveCostFlightBase - f.energy.moveCostPerFlight * flight);
}

/** 종 밸런스 `seasons`로 시기 → 계절 */
export function seasonOf(species: SpeciesBalance, period: number): Season {
  for (const [season, periods] of Object.entries(species.seasons)) {
    if (periods.includes(period)) return season as Season;
  }
  // 스키마가 1~24를 모두 덮는지 검사하므로 여기에 오지 않는다
  throw new Error(`계절이 없는 시기다: ${period}`);
}

/** 2.4 소비 */
export function expenditure(
  f: Formulas,
  species: SpeciesBalance,
  input: {
    period: number;
    phase: string;
    action: ActionId;
    flight: number;
    /** 이 단계에 포란 비용을 내는가 (박새는 암컷만 포란) */
    incubating: boolean;
    /** 급이 국면(`nestling` `postFledge`)의 급이 강도. 정하지 않았으면 `mid` */
    feedIntensity: Intensity;
    chicks: number;
  },
): number {
  const e = f.energy;
  let brood = 0;
  if (input.incubating) brood = e.incubationCostPerStep;
  else if (input.phase === 'nestling' || input.phase === 'postFledge') {
    brood = e.feedCostByIntensity[input.feedIntensity] + e.feedCostPerChick * input.chicks;
  }
  const molt = input.phase === 'molt' ? e.moltCostPerStep : 0;
  return (
    species.basalPerStep[seasonOf(species, input.period)] +
    actionCost(f, input.action, input.flight) +
    brood +
    molt
  );
}

/** 2.5 에너지 갱신. 0 이하면 0으로 자르고 아사 (00-core-loop B-1) */
export function nextEnergy(
  cap: number,
  energy: number,
  gained: number,
  spent: number,
): { energy: number; starved: boolean } {
  const next = Math.min(cap, energy + gained - spent);
  return next <= 0 ? { energy: 0, starved: true } : { energy: next, starved: false };
}

/** 2.6 깃털 */
export function nextFeather(f: Formulas, feather: number, phase: string, action: ActionId): number {
  let next =
    phase === 'molt' ? feather + f.feather.moltRecoverPerStep : feather - f.feather.decayPerStep;
  if (action === 'rest') next += f.actions.rest.featherRecover ?? 0;
  return clamp(next, 0, f.feather.max);
}

// ── 3. 위험 ──────────────────────────────────────────────

/** 3.1 위험 보정: 걸린 `riskMod`마다 `1 + effects.riskMod[등급]`의 곱 */
export function riskModFactor(
  riskMod: Record<RiskTier, number>,
  mods: readonly RiskTier[],
): number {
  return mods.reduce((m, tier) => m * (1 + riskMod[tier]), 1);
}

/** 4장 노화 보정 */
export function agingRiskMult(f: Formulas, species: SpeciesBalance, age: number): number {
  if (age < species.agingStartAge) return 1;
  return 1 + f.aging.riskPerYear * (age - species.agingStartAge + 1);
}

/** 3.1 조작 개체의 단계 사망 위험 */
export function deathRisk(
  f: Formulas,
  species: SpeciesBalance,
  input: {
    nodeRisk: NodeRiskTier;
    phase: string;
    season: Season;
    action: ActionId;
    riskModFactor: number;
    vigilance: number;
    expYears: number;
    /** 판정 1 직후의 `에너지 / 지방 상한` */
    r: number;
    feather: number;
    age: number;
    /** 은수저 지수 — 나이 0일 때의 첫 겨울 보정에 쓴다 */
    silverSpoon: number;
    injured: boolean;
  },
): number {
  const k = f.risk;
  const flock = species.flockPhases.includes(input.phase) ? k.flockMult : 1;
  const fat = 1 + k.fatHeavySlope * Math.max(0, input.r - k.fatHeavyFrom);
  const hunger = 1 + k.hungerSlope * Math.max(0, k.hungerFrom - input.r);
  const feather = 1 + k.featherSlope * Math.max(0, k.featherFrom - input.feather);
  const firstWinter =
    input.age === 0 && input.season === 'winter'
      ? firstWinterRiskMult(f, species, input.silverSpoon)
      : 1;
  const risk =
    f.nodeTiers.risk[input.nodeRisk] *
    (species.predatorActivity[input.phase] ?? 1) *
    f.actions[input.action].riskMult *
    input.riskModFactor *
    (1 - k.vigilancePerStat * input.vigilance) *
    (1 - Math.min(k.expCap, k.expPerYear * input.expYears)) *
    flock *
    fat *
    hunger *
    feather *
    agingRiskMult(f, species, input.age) *
    firstWinter *
    (input.injured ? k.injuryMult : 1);
  return clamp(risk, k.floor, k.cap);
}

/** 3.2 둥지 손실. `mateVigilance`가 없으면 플레이어 경계만 */
export function nestLoss(
  f: Formulas,
  species: SpeciesBalance,
  input: { vigilance: number; mateVigilance?: number; riskModFactor: number },
): number {
  const mean =
    input.mateVigilance === undefined
      ? input.vigilance
      : (input.vigilance + input.mateVigilance) / 2;
  return (
    species.nestLossPerStep * (1 - f.brood.nestLossVigilancePerStat * mean) * input.riskModFactor
  );
}

/** 3.3 새끼 1마리의 단계 사망 확률 */
export function chickDeath(f: Formulas, intensity: Intensity): number {
  return f.brood.chickDeathPerStep * f.brood.chickDeathByIntensity[intensity];
}

// ── 4. 노화 ──────────────────────────────────────────────

/** 4장 `period 1` 진입(나이 +1 직후)의 스탯 하락. 잠재력은 그대로 */
export function agedStats(
  f: Formulas,
  species: SpeciesBalance,
  age: number,
  stats: Partial<Record<StatName, number>>,
): Partial<Record<StatName, number>> {
  if (age < species.agingStartAge) return stats;
  const next = { ...stats };
  for (const stat of f.aging.declineStats) {
    const v = next[stat];
    if (v !== undefined) next[stat] = Math.max(0, v - f.aging.statDeclinePerYear);
  }
  return next;
}

// ── 5. 유전 ──────────────────────────────────────────────

/** 5장 자식 잠재력. `z`는 표준정규 표본(변이 = z × `mutationSd`) */
export function childPotential(
  f: Formulas,
  species: SpeciesBalance,
  input: { stat: StatName; mother: number; father: number; z: number },
): number {
  const h = f.heredity;
  const aptitude = species.aptitude[input.stat];
  const mean = aptitude ? (f.stats.aptitudeMean[aptitude] ?? 0) : 0;
  const h2 = h.h2[input.stat] ?? 0;
  const value = mean + h2 * ((input.mother + input.father) / 2 - mean) + input.z * h.mutationSd;
  return clamp(value, h.potentialMin, h.potentialMax);
}

// ── 6. 은수저 ────────────────────────────────────────────

/** 6.1 급이 단계 하나의 충족도(0~1). 부모마다 급이 강도와 채식 효율 */
export function feedingFulfilment(
  f: Formulas,
  input: {
    parents: { intensity: Intensity; efficiency: number }[];
    food: FoodTier;
    chicks: number;
  },
): number {
  const s = f.silverSpoon;
  const supply = input.parents.reduce(
    (sum, p) =>
      sum +
      (s.feedByIntensity[p.intensity] * p.efficiency * f.nodeTiers.food[input.food]) /
        s.nodeFoodDivisor,
    0,
  );
  return Math.min(1, supply / input.chicks / s.chickNeedPerStep);
}

/** 6.2 시작 스탯. 학습 보너스는 v0에서 0 */
export function startStat(
  f: Formulas,
  potential: number,
  silverSpoon: number,
  learnBonus = 0,
): number {
  const s = f.silverSpoon;
  return potential * (s.startStatBase + s.startStatPerIndex * silverSpoon) + learnBonus;
}

/** 6.2 성장 배율 (나이 ≤ `growthUntilAge` 동안) */
export function growthMult(f: Formulas, silverSpoon: number): number {
  return f.silverSpoon.growthBase + f.silverSpoon.growthPerIndex * silverSpoon;
}

/** 6.3 첫 겨울 보정 */
export function firstWinterRiskMult(
  f: Formulas,
  species: SpeciesBalance,
  silverSpoon: number,
): number {
  return species.firstWinterRiskMult - f.silverSpoon.firstWinterRelief * silverSpoon;
}

// ── 8. 짝 지시 수락률 ────────────────────────────────────

export interface MateOrderFactors {
  role: keyof Formulas['mate']['roleFit'];
  personality: keyof Formulas['mate']['personality'];
  /** 짝의 `에너지 / 지방 상한` */
  mateR: number;
  /** 유대 0~100 */
  bond: number;
  /** 최근 `reciprocityWindowSteps` 단계 안의 급이·도움 행동 횟수 */
  recentHelps: number;
  cost: Tier;
  social: number;
}

/** 8장 수락률. 생물학적으로 불가능한 지시는 계산하지 않는다(부르는 쪽이 '불가'로) */
export function mateAcceptance(f: Formulas, x: MateOrderFactors): number {
  const m = f.mate;
  const condition =
    m.conditionBase + (1 - m.conditionBase) * Math.min(1, x.mateR / m.conditionFullAt);
  const helps = String(Math.min(2, x.recentHelps)) as keyof typeof m.reciprocity;
  const value =
    m.roleFit[x.role] *
    m.personality[x.personality] *
    condition *
    (m.bondBase + m.bondPerPoint * x.bond) *
    m.reciprocity[helps] *
    m.costConflict[x.cost] *
    (m.socialBase + m.socialPerStat * x.social);
  return clamp(value, m.acceptMin, m.acceptMax);
}

/** 8장 거절 시 대안 행동의 효과. `u` ∈ [0, 1) 균등 난수 */
export function refusalEffect(f: Formulas, original: number, u: number): number {
  const m = f.mate;
  return original * (m.refusalEffectMin + u * (m.refusalEffectMax - m.refusalEffectMin));
}
