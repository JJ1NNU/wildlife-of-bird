/** QA 평균 봇의 `node:path` 대신(bot-shim/fs.ts 참고). 뿌리는 빈 경로, 나머지는 `/`로 잇는다. */
const join = (...parts: string[]) => parts.filter(Boolean).join('/');
const resolve = (..._parts: unknown[]) => '';

export default { join, resolve };
