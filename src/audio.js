import { MUSIC_TRACKS, chooseTrack } from './audio-catalog.js';

const PREF_KEY = 'life-quest-audio-v1';
const defaults = { music: true, effects: true, musicVolume: 0.2, effectsVolume: 0.28, muted: false };
let prefs = loadPrefs();
let context = null;
let master = null;
let currentScene = 'menu';
let audioReady = false;
let players = [];
let activePlayer = -1;
let activeTrack = '';
let activeScene = '';
let playRequestToken = 0;
const deckRequests = [0, 0];
let fadeTimer = null;
let fadeToken = 0;
let lastCue = '';
let cueAt = 0;
const activeVoices = new Set();

function loadPrefs() {
  try {
    const stored = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
    return {
      music: typeof stored.music === 'boolean' ? stored.music : defaults.music,
      effects: typeof stored.effects === 'boolean' ? stored.effects : defaults.effects,
      muted: typeof stored.muted === 'boolean' ? stored.muted : defaults.muted,
      musicVolume: clamp(stored.musicVolume, defaults.musicVolume),
      effectsVolume: clamp(stored.effectsVolume, defaults.effectsVolume),
    };
  } catch { return { ...defaults }; }
}
function clamp(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : fallback;
}
function save() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* Storage may be disabled. */ } }
function ensureAudio() {
  if (context) return context;
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  try {
    context = new AudioContextClass();
    master = context.createGain(); master.gain.value = prefs.muted ? 0 : 0.8; master.connect(context.destination);
    return context;
  } catch { return null; }
}
function makePlayers() {
  if (players.length || typeof Audio === 'undefined') return;
  try {
    players = [new Audio(), new Audio()];
    players.forEach(player => {
      player.preload = 'none';
      // Audio files should be supplied with clean loop points; keep one bed
      // stable per scene rather than changing music mid-reading.
      player.loop = true;
      player.addEventListener('error', () => {
        if (player === players[activePlayer]) { activeTrack = ''; activeScene = ''; }
      });
    });
  } catch { players = []; }
}
function desiredMusicVolume() { return prefs.music && !prefs.muted ? prefs.musicVolume : 0; }
function cancelFade() { fadeToken++; if (fadeTimer) clearInterval(fadeTimer); fadeTimer = null; }
function fadePair(incoming, outgoing, duration, done) {
  cancelFade();
  const token = fadeToken;
  const start = performance.now();
  const incomingStart = incoming.volume;
  const outgoingStart = outgoing?.volume || 0;
  fadeTimer = setInterval(() => {
    if (token !== fadeToken) return;
    const progress = Math.min(1, (performance.now() - start) / duration);
    incoming.volume = Math.max(0, Math.min(1, incomingStart + (desiredMusicVolume() - incomingStart) * progress));
    if (outgoing && outgoing !== incoming) outgoing.volume = Math.max(0, outgoingStart * (1 - progress));
    if (progress >= 1) {
      clearInterval(fadeTimer); fadeTimer = null;
      if (outgoing && outgoing !== incoming) { outgoing.pause(); outgoing.removeAttribute('src'); outgoing.load(); }
      done?.();
    }
  }, 35);
}
function stopPlayers(duration = 240) {
  cancelFade();
  playRequestToken++;
  if (!players.length) return;
  const playing = players.filter(player => !player.paused);
  if (playing.length && duration) {
    const starts = new Map(playing.map(player => [player, player.volume]));
    const start = performance.now(); const token = fadeToken;
    fadeTimer = setInterval(() => {
      if (token !== fadeToken) return;
      const progress = Math.min(1, (performance.now() - start) / duration);
      playing.forEach(player => { player.volume = Math.max(0, starts.get(player) * (1 - progress)); });
      if (progress >= 1) { clearInterval(fadeTimer); fadeTimer = null; players.forEach(player => { player.pause(); player.removeAttribute('src'); player.load(); }); }
    }, 35);
  } else players.forEach(item => { item.pause(); item.removeAttribute('src'); item.load(); });
  activeTrack = '';
  activeScene = '';
}
function pick(scene) {
  return chooseTrack(MUSIC_TRACKS[scene], activeTrack);
}
async function playTrack(track) {
  if (!audioReady || !prefs.music || prefs.muted || !track || typeof Audio === 'undefined') return;
  makePlayers();
  if (players.length !== 2 || activeTrack === track && !players[activePlayer]?.paused) return;
  const request = ++playRequestToken;
  cancelFade();
  const nextIndex = activePlayer === 0 ? 1 : 0;
  const next = players[nextIndex];
  const old = players[activePlayer];
  const token = fadeToken;
  deckRequests[nextIndex] = request;
  next.pause(); next.src = track; next.currentTime = 0; next.volume = 0;
  try {
    await next.play();
    if (token !== fadeToken || request !== playRequestToken) {
      if (deckRequests[nextIndex] === request) next.pause();
      return;
    }
    activeTrack = track;
    activeScene = currentScene;
    activePlayer = nextIndex;
    fadePair(next, old && !old.paused ? old : null, 850);
  } catch {
    next.pause(); next.removeAttribute('src');
    if (request === playRequestToken) { activeTrack = ''; activeScene = ''; }
    // Audio failure never blocks the game or triggers another request loop.
  }
}
function syncMusic() {
  if (!audioReady) return;
  if (prefs.muted || !prefs.music) { stopPlayers(); return; }
  const currentPlayer = players[activePlayer];
  if (activeScene === currentScene && activeTrack && currentPlayer && !currentPlayer.paused) {
    currentPlayer.volume = desiredMusicVolume();
    return;
  }
  const track = pick(currentScene);
  if (track) playTrack(track);
  else stopPlayers();
}

export function unlockAudio() {
  const ctx = ensureAudio();
  audioReady = true;
  if (ctx?.state === 'suspended') ctx.resume().then(syncMusic).catch(() => {});
  else syncMusic();
  return Boolean(ctx || typeof Audio !== 'undefined');
}

export function setAudioScene(scene) {
  if (!Object.hasOwn(MUSIC_TRACKS, scene) || currentScene === scene) return;
  currentScene = scene;
  if (audioReady) syncMusic();
}
export function audioPreferences() { return { ...prefs }; }
export function audioAvailability() {
  const tracks = MUSIC_TRACKS[currentScene] || [];
  return tracks.length ? 'available' : 'missing';
}
export function updateAudioPreference(key, value) {
  if (key === 'music' || key === 'effects' || key === 'muted') prefs[key] = Boolean(value);
  if (key === 'musicVolume' || key === 'effectsVolume') prefs[key] = clamp(value);
  save();
  if (master && context) master.gain.setTargetAtTime(prefs.muted ? 0 : 0.8, context.currentTime, 0.06);
  if (prefs.music && !prefs.muted && !audioReady) unlockAudio();
  else syncMusic();
  players.forEach(player => { if (player === players[activePlayer] && !player.paused) player.volume = desiredMusicVolume(); });
}

function tone(frequency, { duration = 0.14, type = 'sine', volume = 0.13, endFrequency } = {}) {
  if (!audioReady || !prefs.effects || prefs.muted) return;
  const ctx = ensureAudio(); if (!ctx) return;
  if (ctx.state !== 'running') { ctx.resume().then(() => tone(frequency, { duration, type, volume, endFrequency })).catch(() => {}); return; }
  const now = ctx.currentTime; const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(frequency, now);
  if (endFrequency) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration);
  gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime(volume * prefs.effectsVolume * 0.4, now + 0.016);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain); gain.connect(master); activeVoices.add(osc);
  osc.start(now); osc.stop(now + duration + 0.03);
  osc.onended = () => { activeVoices.delete(osc); try { osc.disconnect(); gain.disconnect(); } catch {} };
}
const cuePhrases = {
  select: [[659.25]],
  confirm: [[392, 587.33], [440, 659.25]],
  reveal: [[329.63, 440], [293.66, 392]],
  achievement: [[523.25, 659.25, 783.99], [587.33, 739.99, 880]],
  chapter: [[392, 493.88, 587.33, 783.99], [440, 554.37, 659.25, 880]],
  'dialog-open': [[523.25, 659.25]],
  'dialog-close': [[392, 329.63]],
  error: [[196, 155.56]],
  success: [[587.33, 783.99]],
  discovery: [[440, 554.37, 739.99], [392, 523.25, 659.25]],
};
export function playCue(name) {
  const now = Date.now();
  if (name === lastCue && now - cueAt < 100) return;
  lastCue = name; cueAt = now;
  const variants = cuePhrases[name]; if (!variants) return;
  const phrase = variants[Math.floor(Math.random() * variants.length)];
  const type = name === 'error' ? 'triangle' : 'sine';
  phrase.forEach((frequency, index) => setTimeout(() => tone(frequency, {
    duration: name === 'achievement' || name === 'chapter' ? 0.29 : 0.17,
    type,
    volume: name === 'select' ? 0.09 : 0.15,
    endFrequency: name === 'error' ? frequency * 0.82 : undefined,
  }), index * 78));
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopPlayers(300);
    else if (audioReady) syncMusic();
  });
  window.addEventListener('pagehide', () => {
    cancelFade(); players.forEach(player => { player.pause(); player.removeAttribute('src'); });
    activeVoices.forEach(voice => { try { voice.stop(); } catch {} }); activeVoices.clear();
    context?.close().catch(() => {});
  });
}
