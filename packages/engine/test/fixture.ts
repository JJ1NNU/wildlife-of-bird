import type { GameData, SpeciesEcology } from '@wb/schema';
import { EffectsTable, SpeciesEcology as SpeciesEcologySchema } from '@wb/schema';

/**
 * 테스트용 최소 데이터. `data/`의 진짜 데이터는 design·content가 소유하므로
 * 엔진 테스트는 자기 고정 데이터를 쓴다. 스키마로 검증해서 형식이 어긋나지 않게 한다.
 */
const ecology: SpeciesEcology = SpeciesEcologySchema.parse({
  id: 'parus-minor',
  nameKo: '박새',
  scientificName: 'Parus minor',
  residency: 'resident',
  habitats: ['forest'],
  breeding: {
    season: { fromPeriod: 7, toPeriod: 14 },
    clutchSize: { min: 4, max: 13, typicalMin: 7, typicalMax: 10 },
    broodsPerYearMax: 2,
    incubationBy: 'female',
    nestType: 'cavity',
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
