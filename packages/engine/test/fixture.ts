import type { GameData, SpeciesEcology } from '@wb/schema';
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
    statGain: { small: 1, medium: 3, large: 6 },
    eventWeight: { common: 10, uncommon: 4, rare: 1 },
  }),
  ecology: new Map([[ecology.id, ecology]]),
  balance: new Map(),
  events: [],
};
