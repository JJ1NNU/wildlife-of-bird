/**
 * 무작위 봇 v0 (#81, test-strategy 4장).
 * 고를 수 있는 선택(= `previews`의 키) 중 하나를 고르게 뽑는다. 쓰임: 무오류 검사, "1~3년 안에 게임 오버" 확인.
 * 항목이 있는 선택(육아 방침)은 잠기지 않은 항목마다 값을 고르게 뽑아 조합 id로 낸다 (#224).
 *
 * 난수는 `Math.random`이 아니라 엔진의 시드 난수를 고정 시드로 쓴다. 봇은 판의 시드를 볼 수 없으므로
 * 난수 흐름은 판을 넘어 이어진다 — 같은 명령(같은 봇 버전 · 판 수 · 시드 접두어)이면 같은 결과다.
 * 리플레이는 판 기록의 선택 열을 재생하므로 봇과 무관하다.
 */

import { nextInt, seedFromString } from '@wb/engine';
import type { Bot } from '@wb/sim';

let rng = seedFromString('qa-random');

function pick<T>(list: T[]): T {
  const rolled = nextInt(rng, 0, list.length - 1);
  rng = rolled.state;
  return list[rolled.value] as T;
}

const bot: Bot = {
  id: 'random',
  version: '0.2.0',
  choose({ choices, previews }) {
    const id = pick([...previews.keys()]);
    const items = choices.find((c) => c.id === id)?.items?.filter((i) => !i.locked) ?? [];
    if (items.length === 0) return id;
    return `${id}?${items.map((i) => `${i.item}=${pick(i.options)}`).join('&')}`;
  },
};

export default bot;
