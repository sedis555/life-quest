import test from 'node:test';
import assert from 'node:assert/strict';
import { scenarios } from '../src/scenarios.js';
import { PROTAGONIST_SCENES, resolveScene } from '../src/scene-data.js';
import { defaultAvatar, renderSceneAvatar, normalizeAvatar } from '../src/avatar.js';

test('five connected authored scenes cover their real scenario choices with differentiated outcomes', () => {
  const required = ['first-pay','skill-investment','salary-review','side-business','team-agreement'];
  for (const id of required) {
    const scenario = scenarios.find(item => item.id === id);
    const visual = PROTAGONIST_SCENES[id];
    assert.ok(scenario && visual, `${id} is linked to a real journey scenario`);
    assert.ok(visual.environment && visual.setting && visual.decision);
    assert.deepEqual(Object.keys(visual.outcomes).sort(), scenario.choices.map(choice => choice.id).sort());
    for (const choice of scenario.choices) {
      const outcome = resolveScene(scenario, 'consequence', choice.id);
      assert.ok(outcome.title && outcome.prop);
      assert.ok(['neutral','thinking','working','celebrating','concerned','talking','studying','presenting'].includes(outcome.pose));
      assert.ok(['neutral','happy','curious','surprised','worried','reflective','confident'].includes(outcome.expression));
      assert.equal(outcome.phase, 'consequence');
    }
  }
});

test('decision preview and outcome scenes change pose without mutating saved avatar outfit', () => {
  const firstPay = scenarios.find(item => item.id === 'first-pay');
  const decision = resolveScene(firstPay, 'decision', 'celebrate');
  assert.equal(decision.pose, 'celebrating');
  assert.match(decision.title, /^Considering:/);
  const avatar = defaultAvatar('Mika');
  const before = structuredClone(avatar);
  const svg = renderSceneAvatar(avatar, {pose:decision.pose, expression:decision.expression, outfitStyle:'office'});
  assert.match(svg, /pose-celebrating/);
  assert.match(svg, /expression-happy/);
  assert.notEqual(normalizeAvatar(avatar).outfitStyle, 'office');
  assert.deepEqual(avatar, before);
  assert.equal(resolveScene({id:'not-authored'}, 'introduction'), null);
});
