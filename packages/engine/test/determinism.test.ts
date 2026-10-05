import { describe, expect, it } from 'vitest';
import type { RunConfig, RunState } from '../src/index.ts';
import { act, deserialize, getChoices, newRun, preview, serialize } from '../src/index.ts';
import { testData } from './fixture.ts';

const config: RunConfig = { speciesId: 'parus-minor', seed: 'test-seed', mode: 'free' };

/** 선택 열을 끝까지 실행한 뒤의 상태. 봇·리플레이 검증이 쓰는 경로와 같다. */
function play(choiceIds: string[]): RunState {
  let state = newRun(config, testData);
  for (const id of choiceIds) {
    if (state.gameOver) break;
    state = act(state, id, testData).state;
  }
  return state;
}

const plan = Array.from({ length: 50 }, (_, i) => (i % 3 === 0 ? 'action.rest' : 'action.forage'));

describe('결정론 (엔진 원칙 2)', () => {
  it('같은 시드와 같은 선택 열이면 같은 상태가 된다', () => {
    expect(play(plan)).toEqual(play(plan));
  });

  it('시드가 다르면 난수 상태가 갈라진다', () => {
    const other = newRun({ ...config, seed: 'other-seed' }, testData);
    expect(other.rng).not.toBe(newRun(config, testData).rng);
  });

  it('preview는 난수를 쓰지 않으므로 몇 번 불러도 같다', () => {
    const state = play(plan.slice(0, 7));
    const first = preview(state, 'action.forage', testData);
    expect(preview(state, 'action.forage', testData)).toEqual(first);
  });
});

describe('저장 / 불러오기 왕복 (엔진 원칙 6)', () => {
  it('저장했다 불러와도 같은 상태이고, 이후 수열이 이어진다', () => {
    const state = play(plan.slice(0, 11));
    const restored = deserialize(serialize(state), testData);
    expect(restored).toEqual(state);

    const nextId = getChoices(state, testData)[0]?.id ?? '';
    expect(act(restored, nextId, testData).state).toEqual(act(state, nextId, testData).state);
  });

  it('저장 버전이 다르면 불러오지 않고 알려 준다', () => {
    expect(() => deserialize('{"saveVersion":999,"state":{}}', testData)).toThrow('새 게임');
  });
});
