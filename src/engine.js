export const freshState = (name = 'Ayo', stage = 'graduate', resources = {}) => ({
  profile: { name, stage, monthlyIncome: validStart(resources.monthlyIncome,250000) },
  cash: validStart(resources.cash,65000), savings: validStart(resources.savings,80000), debt: 0, time: 8, energy: 7,
  career: 1, reputation: 1, relationships: 2, goal: 0,
  skills: { planning: 0, communication: 0, risk: 0, resilience: 0 }, xp: 0, level: 1,
  chapter: 0, completed: [], history: [], pending: [], branchLog: [], flags: {}, mode: 'journey',
});

function validStart(value, fallback) { return Number.isFinite(value) && value >= 0 && value <= 100000000 ? Math.round(value) : fallback; }

export function applyChoice(state, scenario, choice, branch = 'main') {
  if (!choice || !scenario.choices.some(option => option.id === choice.id)) throw new Error('Choose one of the available options.');
  const delta = choice.delta || {};
  const allowed = new Set(['cash','savings','debt','time','energy','career','reputation','relationships','goal','skills']);
  for (const key of Object.keys(delta)) if (!allowed.has(key)) throw new Error(`Unsupported game-state change: ${key}.`);
  for (const key of ['cash', 'savings', 'debt', 'time', 'energy', 'career', 'reputation', 'relationships', 'goal']) {
    if (delta[key] != null && (!Number.isFinite(delta[key]) || Math.abs(delta[key]) > 10000000)) throw new Error(`Invalid change to ${key}.`);
  }
  if (delta.skills != null && (!delta.skills || typeof delta.skills !== 'object' || Object.entries(delta.skills).some(([skill, points]) => !['planning','communication','risk','resilience','emotional'].includes(skill) || !Number.isFinite(points) || Math.abs(points) > 5))) throw new Error('Invalid skill update.');
  for (const key of ['cash', 'savings', 'time', 'energy']) {
    if ((state[key] || 0) + (delta[key] || 0) < 0) throw new Error(`This choice needs more ${key} than you have.`);
  }
  const next = structuredClone(state);
  for (const [key, amount] of Object.entries(delta)) {
    if (key === 'skills') for (const [skill, points] of Object.entries(amount)) next.skills[skill] = Math.max(0, (next.skills[skill] || 0) + points);
    else if (['cash','savings','debt','time','energy','career','reputation','relationships','goal'].includes(key)) {
      next[key] = Math.max(key === 'debt' ? 0 : 0, (next[key] || 0) + amount);
      if (key === 'energy') next.energy = Math.min(10, next.energy);
    }
  }
  next.xp += choice.xp || 20;
  next.level = 1 + Math.floor(next.xp / 100);
  next.completed = [...new Set([...next.completed, scenario.id])];
  next.history.push({ scenarioId: scenario.id, choiceId: choice.id, title: scenario.title, choice: choice.label, delta: structuredClone(delta), branch, at: Date.now() });
  next.pending = next.pending.filter(id => id !== scenario.id && !next.completed.includes(id));
  if (choice.unlock && !next.completed.includes(choice.unlock) && !next.pending.includes(choice.unlock)) next.pending.push(choice.unlock);
  if (choice.flags) next.flags = { ...next.flags, ...structuredClone(choice.flags) };
  if (scenario.chapter != null) next.chapter = Math.max(next.chapter, scenario.chapter);
  return next;
}

export function money(n) { return new Intl.NumberFormat('en-NG', { style:'currency', currency:'NGN', maximumFractionDigits:0 }).format(n); }

export function compareStates(a, b) {
  const metrics=['cash','savings','debt','time','career','reputation','relationships','goal'].map(key => ({ key, original:a[key] || 0, alternative:b[key] || 0, difference:(b[key] || 0) - (a[key] || 0) }));
  const skillNames=new Set([...Object.keys(a.skills||{}),...Object.keys(b.skills||{})]);
  for(const skill of skillNames)metrics.push({key:`skill: ${skill}`,original:a.skills?.[skill]||0,alternative:b.skills?.[skill]||0,difference:(b.skills?.[skill]||0)-(a.skills?.[skill]||0)});
  return metrics;
}
