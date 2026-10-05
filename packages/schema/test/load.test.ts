import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { fact } from '../src/fact.ts';
import { loadGameData } from '../src/load.ts';

describe('데이터 검증 메시지 (품질 기준: 파일 · 필드 · 이유)', () => {
  it('어긋난 필드의 파일과 위치를 알려 준다', () => {
    const { data, issues } = loadGameData({
      ecology: [
        {
          file: 'data/species/bad.ecology.json',
          json: { id: 'bad', nameKo: '', scientificName: 'X', residency: 'resident' },
        },
      ],
      balance: [],
      calendar: [],
      events: [],
    });

    expect(data).toBeUndefined();
    expect(issues.map((i) => `${i.file}@${i.at}`)).toContain('data/species/bad.ecology.json@id');
    expect(issues.every((i) => i.reason.length > 0)).toBe(true);
  });

  it('생태 파일이 없는 종을 이벤트가 가리키면 잡아낸다', () => {
    const { issues } = loadGameData({
      ecology: [],
      balance: [],
      calendar: [],
      events: [
        {
          file: 'data/events/ghost.json',
          json: [
            {
              id: 'ev.ghost.x',
              species: ['no-such-bird'],
              when: {},
              weight: 'common',
              title: 'ㄱ',
              body: 'ㄴ',
              options: [
                { id: 'a', text: 'ㄷ', effects: [] },
                { id: 'b', text: 'ㅁ', effects: [] },
              ],
              ecologyBasis: 'ㄹ',
              sources: ['SRC-TEST'],
              factCheck: 'verified',
            },
          ],
        },
      ],
    });

    expect(issues).toEqual([
      {
        file: 'data/events/ghost.json',
        at: '[0].species[0]',
        reason: '생태 파일이 없는 종이다: no-such-bird',
      },
    ]);
  });

  it('verified인 사실에 출처가 없으면 잡아낸다 (#56 값 단위 출처)', () => {
    const schema = fact({ value: z.string() });
    expect(schema.safeParse({ value: 'female', sources: [], factCheck: 'verified' }).success).toBe(
      false,
    );
    expect(
      schema.safeParse({ value: 'female', sources: [], factCheck: 'needs-review' }).success,
    ).toBe(true);
  });

  it('단계표의 시기 빠짐 · 중복 · 4단계, 단계표에 없는 국면을 잡아낸다 (#91)', () => {
    const periods = Array.from({ length: 24 }, (_, i) => ({ period: i + 1, steps: ['winter'] }));
    periods[6] = { period: 6, steps: ['nestSite'] }; // 6이 두 번, 7이 빠짐
    periods[9] = { period: 10, steps: ['nestling', 'nestling', 'nestling', 'nestling'] };
    const { issues } = loadGameData({
      ecology: [],
      balance: [],
      calendar: [
        {
          file: 'data/calendar/parus-minor.json',
          json: { speciesId: 'parus-minor', periods, rebrood: [{ steps: ['nestlng'] }] },
        },
      ],
      events: [],
    });
    expect(issues.map((i) => i.at)).toEqual([
      'periods[9].steps',
      'periods[6].period',
      'rebrood[0].steps[0]',
    ]);
  });

  it('이벤트가 그 종의 단계표에 없는 국면을 쓰면 잡아낸다 (#91)', () => {
    const periods = Array.from({ length: 24 }, (_, i) => ({ period: i + 1, steps: ['winter'] }));
    const { issues } = loadGameData({
      ecology: [],
      balance: [],
      calendar: [
        {
          file: 'data/calendar/parus-minor.json',
          json: { speciesId: 'parus-minor', periods, rebrood: [{ steps: ['molt'] }] },
        },
      ],
      events: [
        {
          file: 'data/events/parus-minor.json',
          json: [
            {
              id: 'ev.parus-minor.x',
              species: ['parus-minor'],
              when: { phaseAny: ['nestling'] },
              weight: 'common',
              title: 'ㄱ',
              body: 'ㄴ',
              options: [
                { id: 'a', text: 'ㄷ', effects: [] },
                { id: 'b', text: 'ㅁ', effects: [] },
              ],
              ecologyBasis: 'ㄹ',
              sources: ['SRC-TEST'],
              factCheck: 'verified',
            },
          ],
        },
      ],
    });
    expect(issues).toContainEqual({
      file: 'data/events/parus-minor.json',
      at: '[0].when.phaseAny[0]',
      reason: 'parus-minor의 단계표에 없는 국면이다: nestling',
    });
  });
});
