// Add only original or properly licensed, locally hosted audio files here.
// Empty pools intentionally mean "no soundtrack installed"; the game never
// substitutes a repetitive tone or oscillator chord for missing music.
export const MUSIC_TRACKS = Object.freeze({
  menu: [],
  journey: [],
  challenges: [],
  decisions: [],
  outcomes: [],
  achievements: [],
  alternatives: [],
});

export function chooseTrack(pool, previous = '') {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  const safe = pool.filter(track => typeof track === 'string' && /^\/assets\/audio\/[a-z0-9/_-]+\.(?:mp3|ogg|m4a|wav)$/i.test(track));
  if (!safe.length) return null;
  const choices = safe.length > 1 ? safe.filter(track => track !== previous) : safe;
  return choices[Math.floor(Math.random() * choices.length)];
}

export function audioSceneForScreen({ screen, branch = 'main', hasChoice = false } = {}) {
  if (screen === 'futures') return 'alternatives';
  if (screen === 'result') return branch === 'challenge' ? 'challenges' : 'outcomes';
  if (screen === 'scenario') {
    if (branch === 'challenge') return 'challenges';
    if (branch === 'alternative' && !hasChoice) return 'alternatives';
    return hasChoice ? 'decisions' : 'journey';
  }
  if (screen === 'challenge') return 'challenges';
  return 'menu';
}
