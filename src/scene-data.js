// Reusable authored scene directions for the connected protagonist-focused story.
// The scenario engine remains the authority for choices and numeric consequences.
const scene = (environment, setting, decision, outfitStyle, outcomes) => ({environment, setting, decision, outfitStyle, outcomes});

export const PROTAGONIST_SCENES = Object.freeze({
  'first-pay': scene('home', 'A modest Lagos apartment at dusk, with city rooftops through the window.', 'Your salary has arrived. Family, essentials, and your own plans all matter.', null, {
    celebrate:{pose:'celebrating',expression:'happy',title:'A small celebration, within a limit',prop:'A friend shares a warm toast while the budget notebook stays open.',icon:'✦'},
    family:{pose:'talking',expression:'reflective',title:'A thoughtful family conversation',prop:'A calm phone call makes room for both care and a sustainable contribution.',icon:'⌁'},
    plan:{pose:'working',expression:'confident',title:'Giving each naira a role',prop:'The player divides essentials, savings, family support, and learning in a notebook.',icon:'₦'},
  }),
  'skill-investment': scene('study', 'A compact study corner after work, with a laptop, course notes, and an evening window.', 'A new qualification takes money or time, and neither route guarantees a raise.', 'smart', {
    course:{pose:'studying',expression:'confident',title:'Building a study routine',prop:'An open course lesson and notebook turn the purchase into a weekly plan.',icon:'▤'},
    'free-path':{pose:'studying',expression:'curious',title:'Learning at your own pace',prop:'Free lesson notes stay open beside a carefully protected savings balance.',icon:'⌕'},
    'ask-support':{pose:'presenting',expression:'confident',title:'Making a clear case for support',prop:'The player brings a short course proposal to a workplace conversation.',icon:'↗'},
  }),
  'salary-review': scene('office', 'A bright, practical Lagos meeting room; two colleagues sit across a small table.', 'The review can open a conversation about evidence, scope, and support.', 'office', {
    evidence:{pose:'presenting',expression:'confident',title:'Making a specific, evidence-based ask',prop:'Prepared notes outline outcomes, a range, and a fallback goal.',icon:'▤'},
    scope:{pose:'talking',expression:'curious',title:'Agreeing on a growth plan',prop:'The manager and player map milestones and a date to review them.',icon:'⌁'},
    wait:{pose:'talking',expression:'reflective',title:'Listening and preparing',prop:'Feedback is captured in notes for a more informed next conversation.',icon:'✎'},
  }),
  'side-business': scene('business', 'A small local retail workspace with sample desk accessories and a shared notebook.', 'Demand is untested. Start small, commit more, or learn before spending.', null, {
    pilot:{pose:'working',expression:'curious',title:'Testing a small pilot',prop:'A few product samples are arranged for customer feedback.',icon:'◇'},
    'full-order':{pose:'working',expression:'worried',title:'Committing to the first stock order',prop:'Inventory, a delivery note, and a thin-margin worksheet make the exposure visible.',icon:'▦'},
    research:{pose:'thinking',expression:'reflective',title:'Checking costs and responsibilities',prop:'Delivery costs, unit margins, and clear roles are written down before a purchase.',icon:'⌕'},
  }),
  'team-agreement': scene('conversation', 'A quiet café table in Lagos, where two collaborators can talk without an audience.', 'A deadline is close, and the working relationship still matters.', null, {
    direct:{pose:'talking',expression:'confident',title:'A direct, curious conversation',prop:'Both collaborators review the missed follow-ups and agree on who owns the next step.',icon:'⌁'},
    'take-over':{pose:'working',expression:'worried',title:'Protecting today’s customer deadline',prop:'The player follows up with customers, while the role imbalance remains to revisit.',icon:'↗'},
    pause:{pose:'talking',expression:'reflective',title:'Resetting the work before continuing',prop:'The pair pauses new orders and makes a clear customer update and role plan.',icon:'Ⅱ'},
  }),
});

export function resolveScene(scenario, phase = 'introduction', choiceId = '') {
  const data = PROTAGONIST_SCENES[scenario?.id];
  if (!data) return null;
  const outcome = data.outcomes[choiceId];
  if (phase === 'consequence' && outcome) {
    return {...data, phase, ...outcome, sceneDescription:outcome.prop};
  }
  if (phase === 'decision' && outcome) {
    return {...data, phase, ...outcome, title:`Considering: ${outcome.title}`, sceneDescription:outcome.prop};
  }
  return {
    ...data,
    phase,
    title:phase === 'decision' ? 'A moment to choose' : 'The situation',
    pose:phase === 'decision' ? 'thinking' : 'neutral',
    expression:phase === 'decision' ? 'reflective' : 'curious',
    sceneDescription:phase === 'decision' ? data.decision : data.setting,
    icon:phase === 'decision' ? '…' : '✦',
  };
}
