import type { Phase, StatName } from '@wb/schema';
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
  /** 현재값. 잠재력을 넘지 않는다 (01-formulas 1.1) */
  stats: Partial<Record<StatName, number>>;
  /** 스탯마다의 상한. 유전되는 것은 이것뿐이다 (01-formulas 5장) */
  potential: Partial<Record<StatName, number>>;
  /** 0~`feather.max` (01-formulas 2.6) */
  feather: number;
  /** 경험 연수 = `period 1`을 지난 횟수 (01-formulas 2.2) */
  expYears: number;
}

/** 플레이어의 짝 (04-breeding 2장). 짝 지시·번식은 이 값을 쓴다 */
export interface Mate {
  sex: 'female' | 'male';
  age: number;
  expYears: number;
  potential: Partial<Record<StatName, number>>;
  stats: Partial<Record<StatName, number>>;
  /** 실제 성격. 수락률은 늘 이것으로 계산한다(2.5) */
  personality: 'bold' | 'shy';
  /** 성격이 '확인'됐나. 아니면 화면은 힌트만 보여 준다 */
  personalityKnown: boolean;
  bond: number;
}

/** 짝 후보 카드 하나 — 만들 때 신호까지 한 번 정해 고정한다 (04-breeding 2.2·2.3) */
export interface MateCandidate extends Mate {
  /** 잠재력 평균. 화면에 숫자로 나오지 않는다 */
  quality: number;
  /** 2.4 상호 선택 — 아니면 고를 수 없다 */
  accepts: boolean;
  /** 깃 선명도 오차 `정규(0, mate.signalSd)` */
  plumageNoise: number;
  /** 성격 힌트(`mate.hintAccuracy` 확률로 맞는 쪽) */
  hint: 'bold' | 'shy';
}

/** 열려 있는 관문. 열려 있으면 `getChoices`는 관문의 선택지만 준다 (03-contracts 3장) */
export type Gate = { kind: 'mateCandidate'; candidates: MateCandidate[] };

/** 화면 S-20 카드 — 신호만, 실제 값은 없다 (04-breeding 2.3) */
export interface MateCandidateCard {
  choiceId: string;
  /** 깃 선명도 등급 = 품질 + 오차 */
  plumage: string;
  /** 노래 등급 = 과시 현재값 */
  song: string;
  age: number;
  hint: 'bold' | 'shy';
  accepts: boolean;
}

/**
 * 런의 전체 상태. 저장 파일의 `state`가 이것이다.
 *
 * 난수 상태가 안에 있으므로 같은 상태 + 같은 선택은 항상 같은 결과를 낸다.
 * 짝 · 새끼 · 가계도 · 환경은 그 규칙을 구현할 때(M1, #21) 더한다.
 */
export interface RunState {
  config: RunConfig;
  rng: RngState;
  at: CalendarAt;
  /** 그 해의 실제 단계표 — 시기마다 단계별 국면 (00-core-loop 8장, `yearCalendar`) */
  calendar: Phase[][];
  /** 지금 장소 id (`data/nodes/`) */
  node: string;
  /** 지금 장소에 도착한 뒤 지난 단계 수. 도착한 단계가 0 (01-formulas 2.3 고갈) */
  stay: number;
  player: Bird;
  mate?: Mate;
  /** 열려 있는 관문. 관문이 열린 단계에 머물러 있다 — 관문을 고르면 다음 단계로 간다 */
  gate?: Gate;
  /** 점수 = 총 번식 수 (gdd 11.1장 [확정]) */
  totalBreeding: number;
  gameOver: boolean;
  /** 남긴 판정 기록. 저장 파일에 함께 들어가 이야기 피드가 이어진다 */
  log: LogEntry[];
}

/** 화면이 그대로 그리는 형태. 화면은 확률·점수를 계산하지 않는다 (엔진 원칙, 03-contracts 1.5) */
export interface ViewModel {
  at: CalendarAt;
  /** 지금 단계의 국면 */
  phase: Phase;
  speciesId: string;
  /** 지금 장소 id — 이름은 `data.nodes` */
  node: string;
  player: Bird;
  /** 에너지의 상한(지방 상한, 01-formulas 2.1) */
  energyCap: number;
  totalBreeding: number;
  gameOver: boolean;
  /** 열려 있는 관문의 카드. 지금은 짝 후보(S-20)만 */
  gate?: { kind: 'mateCandidate'; cards: MateCandidateCard[] };
  /** 최근 판정 기록 — 이야기 피드 */
  recentLog: LogEntry[];
}

/** `act`의 결과 */
export interface ActResult {
  state: RunState;
  log: LogEntry[];
}
