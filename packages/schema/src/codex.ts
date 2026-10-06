import { z } from 'zod';
import { EventId } from './events.ts';
import { fact } from './fact.ts';
import { NodeId } from './nodes.ts';
import { PredatorId } from './predators.ts';
import { SpeciesId } from './species.ts';

/** 도감 항목의 분류 (03-contracts 4.4) */
export const CodexKind = z.enum(['species', 'predator', 'node', 'phenomenon']);
export type CodexKind = z.infer<typeof CodexKind>;

/**
 * 해금 조건 잠정(#155) — 조건은 design 몫. 가리키는 id는 검증기가 실제 데이터와 맞춰 본다.
 * - `run-start`: 그 종으로 런을 시작하면
 * - `predator-met`: 그 포식자를 만나면
 * - `node-visited`: 그 장소에 가면
 * - `event-seen`: 이벤트 중 하나를 보면
 */
export const CodexUnlock = z.discriminatedUnion('on', [
  z.object({ on: z.literal('run-start'), species: SpeciesId }).strict(),
  z.object({ on: z.literal('predator-met'), predator: PredatorId }).strict(),
  z.object({ on: z.literal('node-visited'), node: NodeId }).strict(),
  z.object({ on: z.literal('event-seen'), events: z.array(EventId).min(1) }).strict(),
]);
export type CodexUnlock = z.infer<typeof CodexUnlock>;

/**
 * 도감 항목 하나 — `data/codex/<kind>.<target>.json` (소유: content). 03-contracts 4.4.
 * `id`는 `cx.` + 파일 이름(확장자 뺀). 현상은 대상 데이터가 없어 `target` 없이 이름만 쓴다.
 */
export const CodexEntry = z
  .object({
    id: z
      .string()
      .regex(
        /^cx\.(species|predator|node|phenomenon)\.[a-z0-9]+(-[a-z0-9]+)*$/,
        'cx.<분류>.<이름> 형식',
      ),
    kind: CodexKind,
    /** 종·포식자·장소의 id. 현상은 없다 */
    target: z.string().min(1).optional(),
    nameKo: z.string().min(1),
    /** 종만 — 도감 머리글 */
    scientificName: z.string().min(1).optional(),
    body: z.string().min(1),
    unlock: CodexUnlock,
    basis: fact({}),
  })
  .strict()
  .superRefine((entry, ctx) => {
    if (!entry.id.startsWith(`cx.${entry.kind}.`)) {
      ctx.addIssue({ code: 'custom', path: ['id'], message: `분류(${entry.kind})와 id가 다르다` });
    }
    if (entry.kind === 'phenomenon') {
      if (entry.target !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['target'], message: '현상에는 target이 없다' });
      }
    } else if (entry.id !== `cx.${entry.kind}.${entry.target}`) {
      ctx.addIssue({
        code: 'custom',
        path: ['target'],
        message: `id는 cx.${entry.kind}.<target>이어야 한다`,
      });
    }
    if ((entry.kind === 'species') !== (entry.scientificName !== undefined)) {
      ctx.addIssue({
        code: 'custom',
        path: ['scientificName'],
        message: '학명은 종 항목에만, 종 항목에는 반드시 쓴다',
      });
    }
  });
export type CodexEntry = z.infer<typeof CodexEntry>;
