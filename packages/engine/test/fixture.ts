import type { GameData } from '@wb/schema';
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
export const testData: GameData = loaded.data;

const species = testData.balance.get('parus-minor');
if (!species) throw new Error('data/balance/species/parus-minor.json 이 없다');
/** 박새 밸런스 */
export const tit = species;
export const f = testData.formulas;

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
