import type { GameData } from '@wb/schema';
import { advance } from './calendar.ts';
import { nextChance, seedFromString } from './rng.ts';
import type {
  ActResult,
  Choice,
  LogEntry,
  Preview,
  RunConfig,
  RunState,
  ViewModel,
} from './types.ts';

/**
 * 엔진 API — 일곱 개의 순수 함수 (엔진 원칙 1, 03-contracts 3장).
 *
 * M0에서는 **형이 확정**이고 속은 최소다. 행동·판정·에너지·위험·이벤트·번식 같은
 * 실제 규칙은 디자인 명세가 나오는 M1에 채운다(#21). 지금 돌려주는 선택과 수치는
 * 자리표시이며, 결정론과 저장/불러오기 왕복만 진짜로 보장한다.
 */

/** 저장 형식 버전. 형식이 바뀌면 올린다 (03-contracts 6장) */
export const SAVE_VERSION = 1;

/** 새 런을 시작한다. 같은 설정이면 언제나 같은 초기 상태. */
export function newRun(config: RunConfig, data: GameData): RunState {
  const ecology = data.ecology.get(config.speciesId);
  if (!ecology) {
    throw new Error(
      `생태 데이터가 없는 종이다: ${config.speciesId} (data/species/${config.speciesId}.ecology.json)`,
    );
  }
  return {
    config,
    rng: seedFromString(`${config.speciesId}:${config.seed}`),
    at: { year: 1, period: 1, step: 1 },
    player: {
      speciesId: config.speciesId,
      // 런 시작 상태: 모든 종은 '첫 번식기를 앞둔 젊은 성조' (gdd 4.1장)
      sex: config.startSex ?? 'female',
      age: 1,
      energy: 50,
      stats: {},
    },
    totalBreeding: 0,
    gameOver: false,
    log: [],
  };
}

/** 지금 고를 수 있는 모든 선택. */
export function getChoices(state: RunState, _data: GameData): Choice[] {
  if (state.gameOver) return [];
  // 잠정(#5): 행동 목록의 주인은 디자인의 단계표(`data/calendar/`)다.
  return [
    { id: 'action.forage', kind: 'action', label: '채식' },
    { id: 'action.rest', kind: 'action', label: '휴식' },
  ];
}

/** 선택의 예상 결과. 난수를 쓰지 않으므로 몇 번 불러도 같은 값이다 (엔진 원칙 2). */
export function preview(state: RunState, choiceId: string, data: GameData): Preview {
  const choice = getChoices(state, data).find((c) => c.id === choiceId);
  if (!choice) throw new Error(`지금 고를 수 없는 선택이다: ${choiceId}`);
  // 잠정(#6): 공식은 디자인의 위험·에너지 명세를 기다린다.
  return { deathRisk: 0, energyDelta: [0, 0], notes: [] };
}

/** 선택을 실행하고 한 단계 진행한다. 모든 판정은 `LogEntry`를 남긴다 (엔진 원칙 5). */
export function act(state: RunState, choiceId: string, data: GameData): ActResult {
  if (state.gameOver) throw new Error('이미 끝난 런이다');
  const choice = getChoices(state, data).find((c) => c.id === choiceId);
  if (!choice) throw new Error(`지금 고를 수 없는 선택이다: ${choiceId}`);

  const at = advance(state.at);
  // 잠정(#6): 위험 판정의 공식은 디자인 명세를 기다린다. 지금은 난수를 한 번 당겨
  // 결정론 경로만 실제로 만들어 둔다.
  const rolled = nextChance(state.rng, 0);
  const log: LogEntry[] = [{ at, type: 'action', text: choice.label }];

  return {
    state: { ...state, rng: rolled.state, at, gameOver: rolled.value, log: [...state.log, ...log] },
    log,
  };
}

/**
 * 화면이 그대로 그리는 형태. 부족하면 클라이언트가 이슈로 요청한다.
 * 복사본을 돌려준다 — 화면·봇이 고쳐도 `RunState`가 바뀌지 않게(결정론, #33).
 */
export function getView(state: RunState, _data: GameData): ViewModel {
  return structuredClone({
    at: state.at,
    speciesId: state.config.speciesId,
    player: state.player,
    totalBreeding: state.totalBreeding,
    gameOver: state.gameOver,
    recentLog: state.log.slice(-20),
  });
}

/** 저장 문자열. 버전을 함께 적는다 (03-contracts 6장). */
export function serialize(state: RunState): string {
  return JSON.stringify({ saveVersion: SAVE_VERSION, state });
}

/**
 * 저장 문자열을 상태로. 버전이 다르면 던진다 —
 * 친구 알파(M3) 전에는 화면이 "새 게임 시작"을 안내하면 충분하고,
 * 알파 이후 형식이 바뀔 때부터 마이그레이션을 만든다 (엔진 원칙 6).
 */
export function deserialize(text: string, _data: GameData): RunState {
  const parsed = JSON.parse(text) as { saveVersion?: number; state?: RunState };
  if (parsed.saveVersion !== SAVE_VERSION) {
    throw new Error(
      `저장 형식이 다르다: 저장 ${String(parsed.saveVersion)} / 지금 ${SAVE_VERSION}. 새 게임을 시작해야 한다`,
    );
  }
  if (!parsed.state) throw new Error('저장 파일에 state가 없다');
  return parsed.state;
}
