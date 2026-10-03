import type { Formulas, GameData, SpeciesEcology } from '@wb/schema';
import { EffectsTable, SpeciesEcology as SpeciesEcologySchema } from '@wb/schema';

/**
 * 테스트용 최소 데이터. `data/`의 진짜 데이터는 design·content가 소유하므로
 * 엔진 테스트는 자기 고정 데이터를 쓴다. 스키마로 검증해서 형식이 어긋나지 않게 한다.
 */
const src = { sources: ['SRC-TEST'], factCheck: 'verified' } as const;

const ecology: SpeciesEcology = SpeciesEcologySchema.parse({
  id: 'parus-minor',
  nameKo: '박새',
  scientificName: 'Parus minor',
  residency: { value: 'resident', ...src },
  habitats: { values: ['forest'], ...src },
  breeding: {
    season: { fromPeriod: 7, toPeriod: 14, ...src },
    layStart: { fromPeriod: 6, toPeriod: 8, ...src },
    layStartDriver: { value: 'spring-temperature', ...src },
    clutchSize: { typicalMin: 7, typicalMax: 10, max: 18, ...src },
    broodsPerYearMax: { value: 2, ...src },
    incubationDays: { min: 12, max: 13, ...src },
    nestlingDays: { min: 16, max: 20, ...src },
    incubationBy: { value: 'female', ...src },
    nestType: { value: 'cavity', ...src },
  },
  diet: {
    primary: { values: ['insects'], ...src },
    secondary: { values: ['seeds'], ...src },
    nestlingFood: { values: ['caterpillars'], ...src },
  },
  lifespan: { sources: [], factCheck: 'needs-review', note: '테스트용 — 값 없음' },
  alarmCalls: {
    values: [
      {
        id: 'jar',
        predatorType: 'snake',
        incubatingFemaleResponse: 'leave-nest',
        lateNestlingResponse: 'jump-out',
        ...src,
      },
    ],
  },
  sources: ['SRC-TEST'],
  factCheck: 'verified',
});

export const testData: GameData = {
  effects: EffectsTable.parse({
    energy: { small: 5, medium: 12, large: 25 },
    feather: { small: 5, medium: 10, large: 20 },
    deathRisk: { low: 0.01, medium: 0.03, high: 0.08 },
    broodRisk: { low: 0.1, medium: 0.3, high: 0.6 },
    chickLoss: { small: 0.15, medium: 0.3, large: 0.5 },
    statGain: { small: 1, medium: 3, large: 6 },
    bond: { small: 3, medium: 8, large: 15 },
    injury: { small: 2, medium: 3, large: 4 },
    riskMod: { low: 0.2, medium: 0.5, high: 1.0 },
    foodMod: { small: 0.15, medium: 0.3, large: 0.5 },
    eventWeight: { common: 10, uncommon: 4, rare: 1 },
    checkDifficulty: { low: 30, medium: 50, high: 70 },
  }),
  // M0 엔진은 공식 계수를 읽지 않는다. M1(#21)에서 규칙을 구현할 때 이 고정 데이터를
  // 실제 `data/`(design의 formulas.json)로 바꾼다.
  formulas: {} as Formulas,
  ecology: new Map([[ecology.id, ecology]]),
  balance: new Map(),
  events: [],
};
