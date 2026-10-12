import { templates } from './scenarios.js';

const numericKeys = new Set(['cash','savings','debt','time','energy','career','reputation','relationships','goal']);
const skillKeys = new Set(['planning','communication','risk','resilience','emotional']);

export function validateGeneratedScenario(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Scenario must be an object.');
  for (const key of ['title','category','description','context']) if (typeof value[key] !== 'string' || !value[key].trim()) throw new Error(`Scenario is missing ${key}.`);
  if (!Array.isArray(value.choices) || value.choices.length < 2 || value.choices.length > 4) throw new Error('A scenario must have two to four choices.');
  value.choices.forEach(choice => {
    for (const key of ['id','label','detail','lesson']) if (typeof choice[key] !== 'string' || !choice[key].trim()) throw new Error(`Choice is missing ${key}.`);
    if (choice.delta != null) for (const [key, amount] of Object.entries(choice.delta)) {
      if (key === 'skills') {
        if (!amount || typeof amount !== 'object' || Object.entries(amount).some(([skill,n]) => !skillKeys.has(skill) || !Number.isFinite(n) || n < 0 || n > 3)) throw new Error('Scenario contains unsupported skill changes.');
      } else if (!numericKeys.has(key) || !Number.isFinite(amount) || Math.abs(amount) > 1000000) throw new Error('Scenario contains an unsupported game-state change.');
    }
  });
  return structuredClone(value);
}

export async function createChallengeScenario({ templateId, description = '', provider } = {}) {
  const template = templates.find(item => item.id === templateId) || templates[0];
  if (provider) {
    const generated = await provider({ template, description: description.slice(0,500) });
    return validateGeneratedScenario(generated);
  }
  return {
    id: `challenge-${template.id}`, chapter: 0, category: template.category, title: template.title,
    difficulty: 'Your pace', icon: '◎', time: 'Reflection',
    description: description.trim() ? `You shared: “${description.trim().slice(0,500)}” This is a starting point to help you think through the situation.` : template.description,
    context: 'This exercise is not professional advice. Outcomes are possibilities, not guarantees.',
    choices: template.choices.map((label,index) => ({ id:`option-${index+1}`, label,
      detail:['Explore what this path would require.','Compare trade-offs and decide what evidence would help.','Consider a smaller step that preserves room to adjust.'][index],
      delta:{ goal:index === 0 ? 1 : 0 },
      lesson:['List the assumptions you would need to check before acting.','Consider short-term costs alongside longer-term flexibility.','A smaller next step may keep options open while you learn.'][index], xp:15,
    })),
  };
}

export const AI_CONFIG = Object.freeze({ enabled: Boolean(globalThis.process?.env?.AI_API_KEY), keyLocation: 'server environment only' });
