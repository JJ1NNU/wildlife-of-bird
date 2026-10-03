import { describe, expect, it } from 'vitest';
import { testData } from '../../engine/test/fixture.ts';
import type { Bot } from '../src/index.ts';
import { replay, runOne } from '../src/index.ts';

const firstBot: Bot = {
  id: 'first',
  version: '0',
  choose: ({ previews }) => [...previews.keys()][0] ?? '',
};

describe('판 기록 리플레이 (test-strategy T1 · T3)', () => {
  it('config + choices로 다시 재생하면 같은 해시 — 중간에 저장/불러오기를 끼워도', () => {
    const record = runOne(
      { speciesId: 'parus-minor', seed: 'replay', mode: 'free' },
      testData,
      firstBot,
    );
    expect(record.choices.length).toBeGreaterThan(10);
    expect(replay(record, testData)).toBe(record.finalStateHash);
    expect(replay(record, testData, 7)).toBe(record.finalStateHash);
  });
});
