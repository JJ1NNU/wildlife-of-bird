import type { LogEntry, RunConfig } from '@wb/engine';
import { act, getChoices, getView, newRun, preview } from '@wb/engine';
import type { GameData } from '@wb/schema';
import type { Bot } from './bot.ts';

/** 런 한 판의 결과. 지표는 QA의 요구(#19·#21)에 맞춰 M1에 늘린다. */
export interface RunResult {
  config: RunConfig;
  botName: string;
  /** 점수 = 총 번식 수 (gdd 11.1장) */
  totalBreeding: number;
  yearsSurvived: number;
  steps: number;
  log: LogEntry[];
}

/** 한 판을 게임 오버까지(또는 `maxSteps`까지) 돌린다. */
export function runOne(config: RunConfig, data: GameData, bot: Bot, maxSteps: number): RunResult {
  let state = newRun(config, data);
  let steps = 0;

  while (!state.gameOver && steps < maxSteps) {
    const choices = getChoices(state, data);
    if (choices.length === 0) break;
    const previews = new Map(choices.map((c) => [c.id, preview(state, c.id, data)]));
    const choiceId = bot.choose({ view: getView(state, data), choices, previews });
    if (!choices.some((c) => c.id === choiceId)) {
      throw new Error(`봇 ${bot.name}이 고를 수 없는 선택을 돌려줬다: ${choiceId}`);
    }
    state = act(state, choiceId, data).state;
    steps += 1;
  }

  return {
    config,
    botName: bot.name,
    totalBreeding: state.totalBreeding,
    yearsSurvived: state.at.year - 1,
    steps,
    log: state.log,
  };
}
