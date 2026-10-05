import { describe, expect, it } from 'vitest';
import { GameEvent } from '../src/events.ts';

/** `docs/design/specs/03-events.md` 7.2의 예시 이벤트 (줄임) */
const snakeAtNest = {
  id: 'ev.parus-minor.snake-at-nest',
  species: ['parus-minor'],
  when: { phaseAny: ['nestling'], phaseLastStep: true, hasBrood: true, hasMate: true },
  weight: 'uncommon',
  title: '둥지 아래의 소리',
  body: '둥지 구멍 아래 나무껍질을 무언가 천천히 긁으며 올라온다.',
  options: [
    {
      id: 'mob',
      text: '짝과 함께 경보음을 낸다',
      check: { stat: 'vigilance', difficulty: 'medium' },
      onSuccess: [{ type: 'bond', tier: 'small', sign: 'gain' }],
      onFail: [{ type: 'deathRisk', tier: 'low', cause: 'predation', predator: 'rat-snake' }],
    },
    { id: 'signal-flee', text: '경보를 이어 간다', effects: [{ type: 'fledgeEarly' }] },
    { id: 'stay-away', text: '멀리서 지켜본다', effects: [{ type: 'broodRisk', tier: 'high' }] },
  ],
  ecologyBasis: '박새는 뱀에게 구별되는 경보음을 낸다.',
  sources: ['SRC-001'],
  factCheck: 'verified',
};

const reasons = (event: unknown) =>
  GameEvent.safeParse(event).error?.issues.map((i) => i.message) ?? [];

describe('이벤트 효과의 성립 조건 (03-events 6.2)', () => {
  it('명세의 예시 이벤트는 통과한다', () => {
    expect(reasons(snakeAtNest)).toEqual([]);
  });

  it('when이 대상을 보장하지 않는 효과를 잡아낸다', () => {
    const { hasMate: _m, hasBrood: _b, phaseLastStep: _l, ...when } = snakeAtNest.when;
    expect(
      reasons({ ...snakeAtNest, when: { ...when, phaseAny: ['nestling', 'postFledge'] } }),
    ).toEqual([
      'bond 효과에는 when.hasMate: true가 필요하다',
      'fledgeEarly 효과에는 when.phaseAny: ["nestling"]과 phaseLastStep: true가 필요하다',
      'broodRisk 효과에는 when.hasBrood: true가 필요하다',
    ]);
  });

  it('단계 이벤트의 선택지는 2~3개다', () => {
    expect(reasons({ ...snakeAtNest, options: snakeAtNest.options.slice(0, 1) })).toContain(
      'draw가 step인 이벤트의 선택지는 2~3개다 (지금 1개)',
    );
  });
});
