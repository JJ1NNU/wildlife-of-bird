import { createHash } from 'node:crypto';
import type { CalendarAt, LogEntry, RunConfig, RunState } from '@wb/engine';
import {
  act,
  deserialize,
  getChoices,
  getView,
  newRun,
  PERIODS_PER_YEAR,
  preview,
  serialize,
} from '@wb/engine';
import type { GameData } from '@wb/schema';
import type { Bot } from './bot.ts';

/** 판 상한: 100년 = 2400시기. 넘으면 그 판은 오류다 — 무한 루프 방지 (#33) */
export const MAX_PERIODS = 2400;

/** 판 기록 한 줄 (JSONL). `gameVersion`·`commit`은 CLI가 붙인다 (#33 3절) */
export interface RunRecord {
  config: RunConfig;
  bot: { id: string; version: string };
  /** 고른 선택 id 순서대로. `config`와 함께 리플레이 입력이다 */
  choices: string[];
  result: { totalBreeding: number; gameOver: boolean; endAt: CalendarAt };
  /** 오류로 끊긴 판이면 이유. 정상이면 null */
  error: { message: string; at: CalendarAt; stack?: string } | null;
  /** 마지막 상태 `serialize` 결과의 SHA-256 */
  finalStateHash: string;
  log: LogEntry[];
}

/** 상태 해시. 리플레이 비교에 쓴다 */
export function stateHash(state: RunState): string {
  return createHash('sha256').update(serialize(state)).digest('hex');
}

function periodIndex(at: CalendarAt): number {
  return (at.year - 1) * PERIODS_PER_YEAR + at.period;
}

/**
 * 한 판을 게임 오버까지 돌린다. 봇 오류 · 엔진 예외 · 선택 0개 · 상한 도달은
 * 던지지 않고 `error`에 적는다 — 러너가 다음 판으로 넘어갈 수 있게.
 */
export function runOne(config: RunConfig, data: GameData, bot: Bot): RunRecord {
  let state = newRun(config, data);
  const choices: string[] = [];
  let error: RunRecord['error'] = null;

  try {
    while (!state.gameOver) {
      if (periodIndex(state.at) > MAX_PERIODS) throw new Error(`상한 ${MAX_PERIODS}시기에 닿았다`);
      const available = getChoices(state, data);
      if (available.length === 0) throw new Error('게임 오버가 아닌데 고를 선택이 없다');
      const previews = new Map(
        available.filter((c) => !c.disabled).map((c) => [c.id, preview(state, c.id, data)]),
      );
      const choiceId = bot.choose({ view: getView(state, data), choices: available, previews });
      // 조합 id(`parentingPolicy?intensity=high` 등)는 `?` 앞 id로 확인한다 — 잘못된 조합은 `act`가 던진다 (#224)
      if (!previews.has(choiceId.split('?')[0] as string)) {
        throw new Error(`봇 ${bot.id}이 고를 수 없는 선택을 돌려줬다: ${choiceId}`);
      }
      state = act(state, choiceId, data).state;
      choices.push(choiceId);
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    error = { message: err.message, at: state.at, ...(err.stack ? { stack: err.stack } : {}) };
  }

  return {
    config,
    bot: { id: bot.id, version: bot.version },
    choices,
    result: { totalBreeding: state.totalBreeding, gameOver: state.gameOver, endAt: state.at },
    error,
    finalStateHash: stateHash(state),
    log: state.log,
  };
}

/**
 * 판 기록의 `config` + `choices`를 다시 재생한 마지막 상태의 해시.
 * `resumeAt`을 주면 그 선택 수만큼 진행한 뒤 `serialize` → `deserialize`로 끊었다 이어 간다
 * (저장/불러오기 왕복, test-strategy T3). 엔진 예외는 그대로 던진다.
 */
export function replay(
  record: Pick<RunRecord, 'config' | 'choices'>,
  data: GameData,
  resumeAt?: number,
): string {
  let state = newRun(record.config, data);
  for (const [i, choiceId] of record.choices.entries()) {
    if (i === resumeAt) state = deserialize(serialize(state), data);
    state = act(state, choiceId, data).state;
  }
  return stateHash(state);
}
