import test from 'node:test';
import assert from 'node:assert/strict';
import { AVATAR_OPTIONS, defaultAvatar, normalizeAvatar, randomAvatar, renderAvatar } from '../src/avatar.js';

test('default and restored avatar configurations are complete, bounded, and forward-compatible', () => {
  const avatar = defaultAvatar('Mika');
  assert.equal(avatar.displayName, 'Mika');
  assert.equal(avatar.pronouns, '');
  assert.equal(avatar.skinTone, 'medium');
  assert.equal(normalizeAvatar({displayName:' A very long player character name '}, 'Player').displayName, 'A very long player chara');
  assert.equal(normalizeAvatar({skinTone:'not-a-real-tone', hairstyle:'unknown'}, 'Player').skinTone, 'medium');
  assert.equal(normalizeAvatar({pronouns:'she/her', topColor:'blue'}).pronouns, 'she/her');
  assert.equal(normalizeAvatar(null).hairstyle, 'curls');
});

test('appearance options are available to every avatar without gender gating', () => {
  assert.ok(AVATAR_OPTIONS.skinTone.length >= 6);
  assert.deepEqual(AVATAR_OPTIONS.hairstyle.map(x => x.id), ['short','fade','curls','braids','locs','afro','long-straight','long-wavy','ponytail','shaved']);
  assert.ok(AVATAR_OPTIONS.outfitStyle.some(x => x.id === 'office'));
  assert.ok(AVATAR_OPTIONS.accessory.some(x => x.id === 'glasses'));
});

test('randomizer selects valid options and SVG renderer uses distinct, sanitized layers', () => {
  const avatar = randomAvatar('Rae', () => 0.35);
  for (const [category, options] of Object.entries(AVATAR_OPTIONS)) assert.ok(options.some(option => option.id === avatar[category]));
  const first = renderAvatar({...avatar, displayName:'<script>alert(1)</script>'}, 'avatar-test');
  const second = renderAvatar({...avatar, skinTone:'ebony'}, 'avatar-test');
  assert.match(first, /<svg class="avatar-test pose-neutral expression-neutral"/);
  assert.doesNotMatch(first, /<script>/);
  assert.match(first, /avatar-\d+-skin/);
  assert.notEqual(first.match(/id="([^"]+-skin)"/)?.[1], second.match(/id="([^"]+-skin)"/)?.[1]);
  assert.match(second, /#4e3028/);
});
