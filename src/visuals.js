const art = {
  'first-pay': {
    characters: ['player-ayo'],
    setting: 'A modest, cared-for apartment in Lagos at dusk; city roofs beyond the window, compact dining table, warm light.',
    image: 'assets/visuals/first-pay.svg',
    prompt: 'Cinematic editorial illustration for a Nigerian life-simulation game: a thoughtful young Nigerian professional in a rust overshirt sits at a small dining table in a modest Lagos apartment at dusk, reviewing a simple pay envelope and budget notebook; city rooftops through the window, a plant, warm table lamp. Natural human proportions, subtle painterly texture, dignified everyday realism, restrained teal and amber palette, wide 16:9 composition, no text, logos, stereotypes or melodrama.',
    options: {
      celebrate: ['payday-celebrate', 'A small, joyful celebration with a friend after setting a clear limit.', 'warm'],
      family: ['payday-family', 'The player discusses a thoughtful family contribution over a calm phone call.', 'care'],
      plan: ['payday-plan', 'The player calmly divides the first salary between essentials, savings and a learning goal.', 'focused'],
    },
  },
  'rent-plan': {
    characters: ['player-ayo'],
    setting: 'A shared apartment viewing in an ordinary Lagos neighborhood, late afternoon; lived-in details and a glimpse of the street.',
    image: 'assets/visuals/rent-plan.svg',
    prompt: 'Cinematic editorial illustration for a Nigerian life-simulation game: the same young Nigerian professional in a rust overshirt stands inside a simple, clean shared apartment in Lagos, considering a room and commute trade-off; open doorway, practical furniture, city rooftops outside, late-afternoon light. Human and grounded, consistent player character, subtle painterly realism, no luxury clichés, no text or logos, wide 16:9.',
    options: {
      'family-home': ['rent-family-home', 'The player shares a practical conversation at home while keeping the familiar commute.', 'care'],
      'shared-room': ['rent-shared-room', 'The player sets down a bag in a modest shared room closer to work.', 'warm'],
      wait: ['rent-compare', 'The player checks the full rent and utility costs before making a move.', 'focused'],
    },
  },
  'urgent-repair': {
    characters: ['player-ayo', 'repair-technician'],
    setting: 'A small neighborhood electronics repair shop; careful diagnosis of a laptop before a work deadline.',
    image: 'assets/visuals/urgent-repair.svg',
    prompt: 'Cinematic editorial illustration for a Nigerian life-simulation game: the same young Nigerian professional in a rust overshirt talks with a neighborhood electronics repair technician across a workbench, a laptop open for careful diagnosis, modest Lagos repair shop with tools and daylight. Respectful, believable, calm urgency, continuity in the player’s face and clothing, no poverty tropes, no text or brands, wide 16:9.',
    options: {
      repair: ['repair-now', 'A repaired laptop is tested at the shop counter before the player returns to work.', 'warm'],
      borrow: ['repair-borrow', 'The player accepts a temporary spare laptop and agrees when to return it.', 'care'],
      replace: ['repair-diagnose', 'The technician checks the laptop before the player commits to a larger expense.', 'focused'],
    },
  },
  'skill-investment': {
    characters: ['player-ayo'],
    setting: 'A small Lagos apartment study corner after work; notebook, laptop and a softly lit evening window.',
    image: 'assets/visuals/skill-investment.svg',
    prompt: 'Cinematic editorial illustration for a Nigerian life-simulation game: the same young Nigerian professional in a rust overshirt studies at a compact home desk after work, laptop, open notebook and a course outline, Lagos evening visible through the window. Quiet determination rather than guaranteed success, consistent character design, natural warm light, editorial painterly realism, no text, logos or stereotypes, wide 16:9.',
    options: {
      course: ['study-course', 'The player follows a structured course lesson at the desk, with study time planned.', 'focused'],
      'free-path': ['study-free', 'The player works through a free lesson and keeps the study notes organized.', 'care'],
      'ask-support': ['study-sponsor', 'The player prepares a concise course proposal before a workplace conversation.', 'warm'],
    },
  },
  'salary-review': {
    characters: ['player-ayo', 'manager-nneka'],
    setting: 'A bright, modest Lagos office meeting room; two colleagues across a small table reviewing notes.',
    image: 'assets/visuals/salary-review.svg',
    prompt: 'Cinematic editorial illustration for a Nigerian life-simulation game: the same young Nigerian professional in a rust overshirt meets with a Nigerian woman manager in a modest modern Lagos office, both seated across a small table with prepared notes, engaged and respectful. Daylight, believable workplace, consistent player appearance, emotionally nuanced natural expressions, no corporate luxury clichés, text or logos, wide 16:9.',
    options: {
      evidence: ['review-evidence', 'The player shares concise evidence and a clear request in a respectful review.', 'focused'],
      scope: ['review-growth-plan', 'The player and manager write down development milestones and a review date.', 'care'],
      wait: ['review-prepare', 'The player listens, notes feedback, and agrees on what to bring next time.', 'warm'],
    },
  },
};

export const visualsByScenario = Object.fromEntries(Object.entries(art).map(([scenarioId, data]) => {
  const reference = (key, outcomeId, description, prompt, tone = 'neutral') => ({
    scenarioId, imageKey: key, outcomeId,
    asset: `/${data.image}`,
    alt: description,
    sceneDescription: description,
    prompt: prompt || data.prompt,
    characterIds: [...data.characters],
    tone,
  });
  const choices = Object.fromEntries(Object.entries(data.options).map(([choiceId, [outcomeId, description, tone]]) => [
    choiceId,
    reference(choiceId, outcomeId, description,
      `${data.prompt} Depict this specific choice consequence: ${description} Keep the same player character, age range, face and rust overshirt.`, tone),
  ]));
  return [scenarioId, {
    scenarioId,
    characterIds: [...data.characters],
    sceneDescription: data.setting,
    introduction: reference('introduction', `${scenarioId}-introduction`, data.setting, data.prompt),
    decision: reference('decision', `${scenarioId}-decision`, `Decision moment: ${data.setting}`, `${data.prompt} Frame the quiet instant before a consequential choice.`),
    choices,
  }];
}));

export const VISUAL_ART_DIRECTION = 'Cinematic editorial illustration; consistent young Nigerian professional in rust overshirt, natural expressions and anatomy; contemporary everyday Lagos locations; soft teal shadows and warm amber highlights; grounded, respectful, no text or logos.';

export function validVisualAsset(value) {
  return typeof value === 'string' && value.startsWith('/assets/generated/') &&
    !value.includes('..') && !value.includes('\\') && /\.(png|webp|jpg|jpeg)$/i.test(value);
}
