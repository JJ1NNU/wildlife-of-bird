import type { CardId, GameData } from '@wb/schema';
import { loadGameData } from '@wb/schema';
import { readDataDir } from '@wb/schema/cli/read-data';
import type { ActResult, RunState } from '../src/index.ts';
import { act } from '../src/index.ts';

/**
 * 테스트는 저장소의 실제 `data/`를 쓴다. 명세 예시는 데이터 파일의 값으로 계산한 것이므로
 * (01-formulas 0장) 데이터를 바꾸면 예시 테스트가 함께 알려 준다.
 */
const { raw } = await readDataDir();
const loaded = loadGameData(raw);
if (!loaded.data) {
  throw new Error(
    `data/ 검증 실패 — npm run validate:data 로 확인: ${JSON.stringify(loaded.issues)}`,
  );
}
/** 실제 데이터 그대로 — 이벤트 테스트용 */
export const fullData: GameData = loaded.data;
/**
 * 단계 이벤트·계절 방침을 뺀 데이터 — 다른 규칙의 테스트가 이벤트·계절 방침 관문에 멈추지 않게.
 * 추첨 u₁은 그대로 쓰므로 난수 순서는 실제와 같다 (03-events 3.1). 계절 방침은 난수를 쓰지 않는다.
 * 먹이 모자람 배율(01-formulas 3.2·3.3, #501)도 끈다 — 명세 예시는 배율 1로 계산했고, 배율은 nest.test가 따로 잰다
 * 장소 위험 등급·노화 위험은 명세 예시의 값(#462 전)으로 둔다 — 3.1·4.1 예시가 그 값으로 계산돼 있다
 * 런은 프롤로그 전처럼 나이 1·`period 1`에서 시작한다 — 다른 규칙의 테스트가 프롤로그(13-prologue)를 지나지 않게. 프롤로그는 `fullData`로
 */
const real = loaded.data.balance.get('parus-minor');
if (!real) throw new Error('data/balance/species/parus-minor.json 이 없다');
export const testData: GameData = {
  ...loaded.data,
  balance: new Map(loaded.data.balance).set('parus-minor', {
    ...real,
    runStart: { ...real.runStart, age: 1, period: 1 },
  }),
  events: [],
  seasonPolicy: { policies: {}, species: {} },
  formulas: {
    ...loaded.data.formulas,
    brood: { ...loaded.data.formulas.brood, chickDeathByShortfall: 0, nestLossByShortfall: 0 },
    nodeTiers: {
      ...loaded.data.formulas.nodeTiers,
      risk: { veryLow: 0.00122, low: 0.00245, medium: 0.00428, high: 0.00734, veryHigh: 0.0122 },
    },
    aging: { ...loaded.data.formulas.aging, riskPerStep: 0.0026 },
  },
};
/** 계절 방침만 넣은 데이터 (11-season-policy) */
export const seasonData: GameData = { ...testData, seasonPolicy: loaded.data.seasonPolicy };

const species = testData.balance.get('parus-minor');
if (!species) throw new Error('data/balance/species/parus-minor.json 이 없다');
/** 박새 밸런스 */
export const tit = species;
export const f = testData.formulas;

/** 카드 풀이 한 장뿐인 데이터 — 패가 그 카드로만 차서 칸마다 고를 수 있다 (12-card-turn 2.2) */
export function onlyCard(data: GameData, card: CardId): GameData {
  return { ...data, cards: { ...data.cards, pool: { [card]: { weight: 1 } } } };
}

/** 루틴의 남은 칸을 모두 같은 선택으로 채워 단계 하나를 진행한다 (03-contracts 3장 '행동 루틴'). 관문 선택은 한 번 */
export function actStep(state: RunState, choiceId: string, data: GameData = testData): ActResult {
  let r = act(state, choiceId, data);
  const log = [...r.log];
  while (r.state.routine?.length) {
    r = act(r.state, choiceId, data);
    log.push(...r.log);
  }
  return { state: r.state, log };
}
