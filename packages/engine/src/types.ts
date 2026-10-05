import type { StatName } from '@wb/schema';
import type { RngState } from './rng.ts';

/** 런 하나의 설정 (03-contracts 3장) */
export interface RunConfig {
  speciesId: string;
  seed: string;
  startSex?: 'female' | 'male';
  mode: 'free' | 'weekly';
  /** 주간 시드 모드일 때 */
  weeklyId?: string;
}

/** 달력 위치. 1년 = 24시기(반 달), 시기 안은 단계로 쪼갠다 (gdd 4.2장) */
export interface CalendarAt {
  year: number;
  /** 1~24 (1 = 1월 상반) */
  period: number;
  /** 시기 안의 몇 번째 단계인지. 1부터 */
  step: number;
}

/** 지금 고를 수 있는 선택 하나 (03-contracts 3장) */
export interface Choice {
  id: string;
  kind:
    | 'node'
    | 'action'
    | 'eventOption'
    | 'seasonPolicy'
    | 'mateCandidate'
    | 'mateOrder'
    | 'nestSite'
    | 'clutchSize'
    | 'parentingPolicy'
    | 'secondBrood'
    | 'inheritance'
    | 'migration';
  label: string;
  /** 고를 수 없는 이유. 예: 생물학적으로 불가능한 짝 지시 */
  disabled?: { reason: string };
}

/** 선택의 예상 결과. **난수를 쓰지 않는다** (엔진 원칙 2) */
export interface Preview {
  /** 0~1. 화면에서 반올림해 보여 준다 */
  deathRisk: number;
  broodRisk?: number;
  /** 예상 에너지 변화 범위 [최소, 최대] */
  energyDelta: [number, number];
  statGains?: Partial<Record<StatName, number>>;
  /** 짝 지시 수락률 */
  mateAcceptance?: number;
  /** "배가 고파 위험한 곳을 골랐다" 같은 설명 */
  notes: string[];
}

/** 모든 판정이 남기는 기록. 이야기 피드 · QA 분석 · 버그 재현에 쓴다 (엔진 원칙 5) */
export interface LogEntry {
  at: CalendarAt;
  type: string;
  text: string;
  deltas?: Record<string, number>;
  /** 사망·실패 원인 (QA 분석용) */
  cause?: string;
}

/**
 * 조작 중인 개체. 세부 스탯·특성의 규칙은 디자인의 상태 기계 명세를 기다린다.
 * 잠정(#5)
 */
export interface Bird {
  speciesId: string;
  sex: 'female' | 'male';
  /** 만 나이(년) */
  age: number;
  energy: number;
  stats: Partial<Record<StatName, number>>;
}

/**
 * 런의 전체 상태. 저장 파일의 `state`가 이것이다.
 *
 * 난수 상태가 안에 있으므로 같은 상태 + 같은 선택은 항상 같은 결과를 낸다.
 * 짝 · 새끼 · 가계도 · 세계(장소·환경)의 모양은 디자인의 상태 기계 명세(#5)와
 * 함께 M1에 채운다. 잠정(#5)
 */
export interface RunState {
  config: RunConfig;
  rng: RngState;
  at: CalendarAt;
  player: Bird;
  /** 점수 = 총 번식 수 (gdd 11.1장 [확정]) */
  totalBreeding: number;
  gameOver: boolean;
  /** 남긴 판정 기록. 저장 파일에 함께 들어가 이야기 피드가 이어진다 */
  log: LogEntry[];
}

/** 화면이 그대로 그리는 형태. 화면은 확률·점수를 계산하지 않는다 (엔진 원칙, 03-contracts 1.5) */
export interface ViewModel {
  at: CalendarAt;
  speciesId: string;
  player: Bird;
  totalBreeding: number;
  gameOver: boolean;
  /** 최근 판정 기록 — 이야기 피드 */
  recentLog: LogEntry[];
}

/** `act`의 결과 */
export interface ActResult {
  state: RunState;
  log: LogEntry[];
}
