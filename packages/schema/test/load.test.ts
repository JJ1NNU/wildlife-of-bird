import { describe, expect, it } from 'vitest';
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
              options: [{ id: 'a', text: 'ㄷ', effects: [] }],
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
});
