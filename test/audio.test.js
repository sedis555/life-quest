import test from 'node:test';
import assert from 'node:assert/strict';
import { MUSIC_TRACKS, audioSceneForScreen, chooseTrack } from '../src/audio-catalog.js';
import { audioAvailability, audioPreferences, updateAudioPreference } from '../src/audio.js';

test('music catalog safely reports no soundtrack until licensed files are installed', () => {
  assert.deepEqual(Object.keys(MUSIC_TRACKS), ['menu','journey','challenges','decisions','outcomes','achievements','alternatives']);
  assert.ok(Object.values(MUSIC_TRACKS).every(pool => pool.length === 0));
  assert.equal(chooseTrack(MUSIC_TRACKS.menu), null);
  assert.equal(audioAvailability(), 'missing');
});

test('track selection stays local and avoids immediate repeats', () => {
  assert.equal(chooseTrack(['/assets/audio/menu/a.mp3', '/assets/audio/menu/b.ogg'], '/assets/audio/menu/a.mp3'), '/assets/audio/menu/b.ogg');
  assert.equal(chooseTrack(['/remote/music.mp3', '../music.mp3']), null);
});

test('each game mode and phase selects its own music state', () => {
  assert.equal(audioSceneForScreen({screen:'welcome'}), 'menu');
  assert.equal(audioSceneForScreen({screen:'scenario',branch:'main'}), 'journey');
  assert.equal(audioSceneForScreen({screen:'scenario',branch:'main',hasChoice:true}), 'decisions');
  assert.equal(audioSceneForScreen({screen:'scenario',branch:'challenge'}), 'challenges');
  assert.equal(audioSceneForScreen({screen:'scenario',branch:'alternative'}), 'alternatives');
  assert.equal(audioSceneForScreen({screen:'result',branch:'main'}), 'outcomes');
  assert.equal(audioSceneForScreen({screen:'futures'}), 'alternatives');
});

test('audio settings remain independently adjustable and muted by master preference', () => {
  const previous = globalThis.localStorage;
  const store = {};
  Object.defineProperty(globalThis, 'localStorage', {configurable:true,value:{setItem:(key,value)=>{store[key]=value;}}});
  try {
    updateAudioPreference('music', false);
    updateAudioPreference('effectsVolume', 0.73);
    updateAudioPreference('musicVolume', 2);
    updateAudioPreference('muted', true);
    const expected = {music:false,effects:true,musicVolume:1,effectsVolume:0.73,muted:true};
    assert.deepEqual(audioPreferences(), expected);
    assert.deepEqual(JSON.parse(store['life-quest-audio-v1']), expected);
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else Object.defineProperty(globalThis, 'localStorage', {configurable:true,value:previous});
  }
});
