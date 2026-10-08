import type { GameData, GameEvent } from '@wb/schema';
import { describe, expect, it } from 'vitest';
import type { EventContext } from '../src/events.ts';
import {
  applyEffects,
  checkChance,
  drawStepEvent,
  eventCandidates,
  pickEvent,
  resolveOption,
  whenHolds,
} from '../src/events.ts';
import { foodModFactor, riskModFactor } from '../src/formulas.ts';
import { act, getChoices, getView, newRun } from '../src/index.ts';
import { nextFloat } from '../src/rng.ts';
import { f, fullData, testData } from './fixture.ts';

const ctx: EventContext = {
  phase: 'winter',
  phaseLastStep: false,
  habitats: ['forest'],
  period: 2,
  sex: 'female',
  age: 0,
  hasMate: false,
  hasBrood: false,
  energyRatio: 0.5,
  actions: ['forage'],
};

describe('조건 when (03-events 4장 예시)', () => {
  it('winter · ageMax 0 — 나이 0 참, 나이 1 거짓', () => {
    const when = { phaseAny: ['winter' as const], ageMax: 0 };
    expect(whenHolds(when, ctx)).toBe(true);
    expect(whenHolds(when, { ...ctx, age: 1 })).toBe(false);
  });
  it('period 23~4는 해를 넘긴다 — 2 참, 10 거짓', () => {
    const when = { periodFrom: 23, periodTo: 4 };
    expect(whenHolds(when, ctx)).toBe(true);
    expect(whenHolds(when, { ...ctx, period: 10 })).toBe(false);
  });
  it('hasBrood · energyBelow 0.3 — 새끼 있음, 에너지 15/67 → 참', () => {
    expect(
      whenHolds(
        { hasBrood: true, energyBelow: 0.3 },
        { ...ctx, hasBrood: true, energyRatio: 15 / 67 },
      ),
    ).toBe(true);
  });
});

describe('추첨 (03-events 3.1 예시)', () => {
  const ev = (id: string, weight: GameEvent['weight']): GameEvent => ({
    ...(fullData.events[0] as GameEvent),
    id,
    weight,
    when: {},
  });
  const [a, b, c] = [ev('ev.t.a', 'common'), ev('ev.t.b', 'uncommon'), ev('ev.t.c', 'rare')];

  it('가중치 10 : 4 : 1 → A가 뽑힐 확률 10/15', () => {
    expect(pickEvent([a, b, c], testData.effects.eventWeight, 10 / 15 - 1e-9)?.id).toBe('ev.t.a');
    expect(pickEvent([a, b, c], testData.effects.eventWeight, 10 / 15)?.id).toBe('ev.t.b');
  });
  it('쿨다운이 남은 이벤트는 후보가 아니다 → 이벤트 없음', () => {
    const cands = eventCandidates([a], 'step', 'parus-minor', ctx, { 'ev.t.a': 7 });
    expect(cands).toEqual([]);
    expect(pickEvent(cands, testData.effects.eventWeight, 0.1)).toBeUndefined();
  });
});

describe('추첨 난수 순서 (03-events 3.1)', () => {
  const run = newRun({ speciesId: 'parus-minor', seed: 'draw', mode: 'free' }, testData);
  const ev = { ...(fullData.events[0] as GameEvent), id: 'ev.t.a', when: {} };
  const withChance = (chancePerStep: number, events: GameEvent[]): GameData => ({
    ...testData,
    events,
    formulas: { ...f, events: { ...f.events, chancePerStep } },
  });
  const after = (n: number) =>
    Array.from({ length: n }).reduce<typeof run.rng>((r) => nextFloat(r).state, run.rng);

  it('u₁에서 끝나면 난수 1개, 이벤트 없음', () => {
    const out = drawStepEvent(run, withChance(0, [ev]), ['action.forage']);
    expect(out.event).toBeUndefined();
    expect(out.state.rng).toEqual(after(1));
  });
  it('후보가 없어도 u₁은 쓴다 — 난수 1개', () => {
    const out = drawStepEvent(run, withChance(1, [ev]), ['action.forage'], { 'ev.t.a': 3 });
    expect(out.event).toBeUndefined();
    expect(out.state.rng).toEqual(after(1));
  });
  it('당첨이면 u₁ → u₂ — 난수 2개', () => {
    const out = drawStepEvent(run, withChance(1, [ev]), ['action.forage']);
    expect(out.event?.id).toBe('ev.t.a');
    expect(out.state.rng).toEqual(after(2));
  });
});

describe('선택지 적용 (03-events 5장)', () => {
  const run = newRun({ speciesId: 'parus-minor', seed: 'option', mode: 'free' }, testData);
  const energy = (sign: 'gain' | 'loss') => ({ type: 'energy', tier: 'small', sign }) as const;
  const ev: GameEvent = {
    ...(fullData.events[0] as GameEvent),
    options: [
      {
        id: 'try',
        text: '시도한다',
        check: { stat: 'vigilance', difficulty: 'medium' },
        onSuccess: [energy('gain')],
        onFail: [energy('loss')],
      },
    ],
  };
  const clamp = (p: number): GameData => ({
    ...testData,
    formulas: { ...f, events: { ...f.events, checkMin: p, checkMax: p } },
  });
  const low = { ...run, player: { ...run.player, energy: 20 } };

  it('판정 성공 → onSuccess, 실패 → onFail (판정 난수 1개 뒤 효과)', () => {
    const win = resolveOption(low, ev, 'try', clamp(1));
    expect(win.success).toBe(true);
    expect(win.state.player.energy).toBeGreaterThan(20);
    const lose = resolveOption(low, ev, 'try', clamp(0));
    expect(lose.success).toBe(false);
    expect(lose.state.player.energy).toBeLessThan(20);
    expect(lose.state.rng).toEqual(nextFloat(low.rng).state);
  });
});

describe('판정형 성공 확률 (03-events 5.2 예시)', () => {
  const d = testData.effects.checkDifficulty;
  it.each([
    [70, d.medium, 0.9],
    [46, d.medium, 0.54],
    [30, d.high, 0.1],
    [95, d.low, 0.95],
  ])('스탯 %d, 난이도 %d → %d', (stat, difficulty, p) => {
    expect(checkChance(f, stat, difficulty ?? 0)).toBeCloseTo(p);
  });
});

describe('효과 (03-events 6.1 예시)', () => {
  const run = newRun({ speciesId: 'parus-minor', seed: 'effects', mode: 'free' }, testData);
  const at = (energy: number) => ({ ...run, player: { ...run.player, energy } });

  it('에너지 20, energy medium loss → 8', () => {
    const out = applyEffects(at(20), [{ type: 'energy', tier: 'medium', sign: 'loss' }], testData);
    expect(out.state.player.energy).toBe(8);
    expect(out.death).toBeUndefined();
  });
  it('에너지 10, energy large loss → 아사, 뒤 효과는 버린다', () => {
    const out = applyEffects(
      at(10),
      [
        { type: 'energy', tier: 'large', sign: 'loss' },
        { type: 'riskMod', tier: 'high' },
      ],
      testData,
    );
    expect(out.death).toBe('starvation');
    expect(out.state.periodMods).toBeUndefined();
  });
  it('foodMod medium loss 두 번 → 섭취 × 0.49, riskMod high → 위험 × 2.0', () => {
    const loss = { type: 'foodMod', tier: 'medium', sign: 'loss' } as const;
    const { state } = applyEffects(run, [loss, loss, { type: 'riskMod', tier: 'high' }], testData);
    expect(foodModFactor(testData.effects.foodMod, state.periodMods?.food ?? [])).toBeCloseTo(0.49);
    expect(riskModFactor(testData.effects.riskMod, state.periodMods?.risk ?? [])).toBe(2);
  });
  it('deathRisk — 맞으면 원인 predation:<predator>', () => {
    const sure = {
      ...testData,
      effects: { ...testData.effects, deathRisk: { low: 1, medium: 1, high: 1 } },
    };
    const out = applyEffects(
      run,
      [{ type: 'deathRisk', tier: 'high', cause: 'predation', predator: 'snake' }],
      sure,
    );
    expect(out.death).toBe('predation:snake');
  });
  it('injury — 남은 부상 단계와 새 값 중 큰 쪽', () => {
    const hurt = applyEffects(run, [{ type: 'injury', tier: 'medium' }], testData).state;
    expect(hurt.injury).toBe(3);
    expect(applyEffects(hurt, [{ type: 'injury', tier: 'small' }], testData).state.injury).toBe(3);
    expect(applyEffects(hurt, [{ type: 'injury', tier: 'large' }], testData).state.injury).toBe(4);
  });
  const brood = (chicks: number) => ({
    ...run,
    nest: { site: 'deep', node: 'village-farmland', eggs: chicks, chicks },
  });
  it('새끼 7, chickLoss medium → 3마리 사망, 4마리 남음', () => {
    const out = applyEffects(brood(7), [{ type: 'chickLoss', tier: 'medium' }], testData);
    expect(out.state.nest?.chicks).toBe(4);
  });
  it('fledgeEarly + chickLoss small — 새끼 7 → 둥지에 조기 이소 표시, 2마리 사망', () => {
    const out = applyEffects(
      brood(7),
      [{ type: 'fledgeEarly' }, { type: 'chickLoss', tier: 'small' }],
      testData,
    );
    expect(out.state.nest).toMatchObject({ fledgedEarly: true, chicks: 5 });
  });
  it('새끼 1, chickLoss small → 전멸 → B-5(둥지를 거둔다)', () => {
    const out = applyEffects(brood(1), [{ type: 'chickLoss', tier: 'small' }], testData);
    expect(out.state.nest).toBeUndefined();
    expect(out.log).toMatchObject([{ type: 'brood', cause: 'chickLoss' }]);
  });
  it('broodRisk — 맞으면 알·새끼 전멸 → B-5', () => {
    const sure = {
      ...testData,
      effects: { ...testData.effects, broodRisk: { low: 1, medium: 1, high: 1 } },
    };
    const out = applyEffects(brood(5), [{ type: 'broodRisk', tier: 'low' }], sure);
    expect(out.state.nest).toBeUndefined();
    expect(out.log).toMatchObject([{ type: 'brood', cause: 'broodRisk' }]);
    const marten = applyEffects(
      brood(5),
      [{ type: 'broodRisk', tier: 'low', predator: 'marten' }],
      sure,
    );
    expect(marten.log).toMatchObject([{ type: 'brood', cause: 'broodRisk:marten' }]);
  });
});

describe('루틴에 연결 — 칸마다 추첨 · 이벤트로 멈춤 · 다시 채우기 (03-contracts 3장)', () => {
  const ev = { ...(fullData.events[0] as GameEvent), id: 'ev.t.a', when: {} };
  const data: GameData = {
    ...testData,
    events: [ev],
    formulas: { ...f, events: { ...f.events, chancePerStep: 1 } },
  };
  const start = newRun({ speciesId: 'parus-minor', seed: 'routine', mode: 'free' }, data);
  const n = getView(start, data).routine?.slots ?? 0;
  let s = start;
  for (let i = 0; i < n; i++) s = act(s, 'action.rest', data).state;

  it('첫 칸 판정 뒤 당첨 → 그 단계에 멈추고 eventOption만 준다', () => {
    expect(n).toBeGreaterThan(1);
    expect(s.at).toEqual(start.at);
    expect(s.gate).toEqual({ kind: 'event', id: 'ev.t.a' });
    expect(getChoices(s, data).map((c) => [c.id, c.kind])).toEqual(
      ev.options.map((o) => [`event.${o.id}`, 'eventOption']),
    );
    expect(s.log.map((l) => l.type)).toEqual(['decision', 'slot', 'event']);
    expect(s.eventCooldown).toEqual({ 'ev.t.a': f.events.cooldownSteps });
  });

  it('고르면 남은 칸 다시 채우기 — 제안값 = 원래 계획의 남은 칸, 실행은 replan 1건(결정 아님)', () => {
    const picked = act(s, `event.${ev.options[1]?.id}`, data).state;
    const view = getView(picked, data).routine;
    expect(view).toMatchObject({ slots: n - 1, filled: [], replan: true });
    expect(view?.suggested).toEqual(Array(n - 1).fill('action.rest'));
    let r = picked;
    for (let i = 0; i < n - 1; i++) r = act(r, 'action.rest', data).state;
    const types = r.log.map((l) => l.type);
    expect(types.filter((t) => t === 'decision')).toHaveLength(1);
    expect(types.filter((t) => t === 'replan')).toHaveLength(1);
    expect(types.filter((t) => t === 'event')).toHaveLength(2);
    expect(r.log.filter((l) => l.type === 'slot').map((l) => l.slot)).toEqual(
      Array.from({ length: n }, (_, i) => i + 1),
    );
    // 다시 채운 칸은 추첨하지 않는다 → 다음 단계로, 쿨다운 1 줄어 후보 없음
    expect(r.at).not.toEqual(start.at);
    expect(r.paused).toBeUndefined();
    expect(r.eventCooldown).toEqual({ 'ev.t.a': f.events.cooldownSteps - 1 });
  });

  it('선택지 카드 효과 숫자 — 고정은 effects, 판정형은 onSuccess·onFail (03-events 5.3)', () => {
    const t = data.effects;
    const shown: GameEvent = {
      ...ev,
      options: [
        {
          id: 'fixed',
          text: '고정',
          effects: [
            { type: 'energy', tier: 'medium', sign: 'loss' },
            { type: 'foodMod', tier: 'medium', sign: 'loss' },
          ],
        },
        {
          id: 'check',
          text: '판정',
          check: { stat: 'vigilance', difficulty: 'medium' },
          onSuccess: [{ type: 'riskMod', tier: 'high' }],
          onFail: [{ type: 'deathRisk', tier: 'medium', cause: 'predation' }],
        },
      ],
    };
    const d: GameData = { ...data, events: [shown] };
    const gate = getView({ ...s, gate: { kind: 'event', id: shown.id } }, d).gate;
    expect(gate?.kind === 'event' && gate.cards).toEqual([
      {
        choiceId: 'event.fixed',
        effects: [
          { type: 'energy', delta: -t.energy.medium },
          { type: 'foodMod', factor: 1 - t.foodMod.medium },
        ],
      },
      {
        choiceId: 'event.check',
        chance: expect.any(Number),
        onSuccess: [{ type: 'riskMod', factor: 1 + t.riskMod.high }],
        onFail: [{ type: 'deathRisk', chance: t.deathRisk.medium, cause: 'predation' }],
      },
    ]);
  });

  it('칸 이벤트로 injury small(2) → 그 단계 끝에는 줄지 않고 다음 두 단계 뒤 낫는다 (03-events 6.1 v0.1.2)', () => {
    const hurt: GameEvent = {
      ...ev,
      options: [{ id: 'hurt', text: '다쳤다', effects: [{ type: 'injury', tier: 'small' }] }],
    };
    const d: GameData = { ...data, events: [hurt] };
    let r = act(s, 'event.hurt', d).state;
    expect(r.injury).toBe(2);
    for (let i = 0; i < n - 1; i++) r = act(r, 'action.rest', d).state;
    expect(r.at).not.toEqual(start.at);
    expect(r.injury).toBe(2);
    expect(r.injuryFresh).toBeUndefined();
  });
});
