import type { GameData } from '@wb/schema';
import { t } from './text.ts';

/**
 * 로그 `cause`(`<이유>` 또는 `<이유>:<포식자 id>`)를 화면 글로 (#513) — 문구 data/text/cause.json.
 * 포식자 글이 없으면 이유 글, 그것도 없으면 undefined(로그의 `text`를 그대로 쓴다)
 */
export function causeText(
  kind: 'brood' | 'death',
  cause: string | undefined,
  data: GameData,
): string | undefined {
  if (!cause) return undefined;
  const [base, predatorId] = cause.split(':');
  const key = `cause.${kind}.${base}`;
  if (predatorId) {
    const predator = data.predators.get(predatorId)?.nameKo ?? predatorId;
    const s = t(`${key}.predator`, { predator });
    if (s !== `${key}.predator`) return s;
  }
  const s = t(key);
  return s === key ? undefined : s;
}
