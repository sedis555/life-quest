import { visualsByScenario } from './visuals.js';

const c = (id,label,detail,delta,lesson,unlock,xp=24,flags={}) => ({id,label,detail,delta,lesson,unlock,xp,flags});
export const scenarios = [
 {id:'first-pay',chapter:1,chain:1,title:'The first payday',category:'Money',difficulty:'Starter',icon:'₦',time:'Month 1',description:'Your first full salary has landed: ₦250,000. Rent, transport, family expectations, and a certification goal all have a claim on it.',context:'Illustrative salary and costs for this story. Your own priorities and numbers may be different.',choices:[
  c('celebrate','Make it a night to remember','Allocate ₦35,000 to celebrate, ₦100,000 to essentials, ₦30,000 to family, ₦25,000 to savings, and keep ₦60,000 flexible.',{cash:60000,savings:25000,energy:1,skills:{planning:1}},'Celebration can matter. Give it a limit before the excitement takes over.','rent-plan',24,{salaryPlan:'celebrate'}),
  c('family','Send more home','Contribute ₦50,000 to family, set aside ₦100,000 for essentials and ₦25,000 for savings; keep ₦75,000 flexible.',{cash:75000,savings:25000,relationships:1,skills:{communication:1}},'Generosity works best when it fits a repeatable plan.', 'rent-plan',24,{salaryPlan:'family'}),
  c('plan','Give every naira a role','Set aside ₦100,000 for essentials, ₦30,000 for family, ₦40,000 for your certification, and keep ₦80,000 flexible.',{cash:80000,savings:40000,goal:1,skills:{planning:2}},'A plan creates room for both obligations and your next step. The remaining ₦80,000 is calculated after the stated allocations.','rent-plan',32,{salaryPlan:'planned'})
 ]},
 {id:'rent-plan',chapter:1,chain:1,title:'Where will you live?',category:'Money',difficulty:'Starter',icon:'⌂',time:'Month 2',description:'You have a clearer picture of your income. A commute is draining your time, and a room closer to work costs more upfront.',context:'A friend has offered a shared room; living with family is also possible if it suits your situation.',choices:[
 c('family-home','Stay with family for now','Contribute ₦25,000 from available cash and keep your commute.',{cash:-25000,time:-1,relationships:1,skills:{planning:1}},'Lower housing costs can support a goal; agree on expectations and commute trade-offs.','urgent-repair'),
 c('shared-room','Take the shared room','Pay ₦55,000 toward rent and utilities; save commute time.',{cash:-55000,time:1,energy:1,goal:1,skills:{planning:1}},'The time saved has value too. Check that recurring costs remain affordable.','urgent-repair'),
 c('wait','Wait one month and compare','Move ₦20,000 from available cash into savings while you verify the full costs and house rules.',{cash:-20000,savings:20000,time:1,skills:{risk:1,planning:1}},'A short pause can uncover hidden costs, though the current commute continues.','urgent-repair')
 ]},
 {id:'urgent-repair',chapter:1,chain:1,title:'An unexpected repair',category:'Money',difficulty:'Starter',icon:'⚡',time:'Month 3',description:'Your laptop charger and battery fail the same week. The repair estimate is ₦28,000, and a deadline is close.',context:'Your current cash and savings remain visible in the dashboard. This decision does not assume you have a particular safety net.',choices:[
 c('repair','Repair it now','Pay ₦28,000 from cash and keep work moving.',{cash:-28000,career:1,energy:1,skills:{planning:1}},'Paying for a necessary tool can protect work time. Compare a repair quote first.','skill-investment'),
 c('borrow','Borrow a spare, then save for repair','Ask someone you trust for a temporary spare and move ₦12,000 from cash into a repair fund.',{cash:-12000,savings:12000,relationships:1,time:-1,skills:{communication:1}},'A temporary workaround buys time, but agree on a clear return plan.','skill-investment'),
 c('replace','Compare repair and replacement','Spend ₦4,000 on diagnosis before committing to either option.',{cash:-4000,time:-1,skills:{risk:1,planning:1}},'A diagnosis is useful when it changes the choice; deadlines still have a cost.','skill-investment')
 ]},
 {id:'skill-investment',chapter:1,chain:1,title:'Invest in your next skill',category:'Career',difficulty:'Steady',icon:'↗',time:'Month 4',description:'A certification could help you qualify for stronger roles. It costs ₦40,000 and takes two evenings a week for a month.',context:'A free learning path exists, but it takes longer. Neither route guarantees a job or raise.',choices:[
 c('course','Pay for the course','Use ₦40,000 from savings and protect two study evenings weekly.',{savings:-40000,goal:2,career:1,time:-1,skills:{planning:1}},'Paid structure may help you finish. Check the course quality and your budget first.','salary-review',30),
 c('free-path','Try the free path first','Use two evenings a week and keep your money available.',{time:-2,goal:1,career:1,skills:{resilience:1,planning:1}},'A slower low-cost route can be a good fit when cash is tight.','salary-review'),
 c('ask-support','Ask work to sponsor it','Prepare a short case linking the course to a team need.',{time:-1,reputation:1,career:1,skills:{communication:2}},'A clear proposal makes the request easier to evaluate; sponsorship is not guaranteed.','salary-review')
 ]},
 {id:'salary-review',chapter:1,chain:1,title:'The salary conversation',category:'Career',difficulty:'Steady',icon:'◎',time:'Month 6',description:'You have contributed consistently for six months. Your manager has scheduled a review and asks what support would help you grow.',context:'There is no guaranteed raise. You can negotiate scope, feedback, or a development plan too.',choices:[
 c('evidence','Bring evidence and a clear ask','Share two outcomes, a market-informed range, and a fallback development goal.',{career:2,reputation:1,skills:{communication:2,planning:1}},'Evidence and a specific ask improve the conversation; the decision remains shared.','side-business',34),
 c('scope','Ask for a growth plan','Request written milestones, feedback dates, and a review point.',{career:1,reputation:1,skills:{communication:1,planning:1}},'A dated plan turns a vague promise into something you can revisit.','side-business'),
 c('wait','Listen and prepare for next time','Ask for feedback and note what evidence to bring to the next review.',{career:1,time:1,skills:{resilience:1}},'Waiting can be strategic when you leave with useful feedback and a date.','side-business')
 ]},
 {id:'side-business',chapter:2,chain:1,title:'A side-business idea',category:'Business',difficulty:'Steady',icon:'✳',time:'Month 7',description:'A friend wants to sell locally made desk accessories online. They suggest splitting a first ₦60,000 stock order.',context:'You have not tested demand yet. Your job contract allows side projects with no conflict of interest.',choices:[
 c('pilot','Test demand with a small pilot','Spend ₦15,000 on samples and ask ten potential customers for feedback.',{cash:-15000,goal:1,career:1,skills:{risk:2,planning:1}},'A small test limits exposure while creating evidence. Ten opinions are a signal, not proof.','team-agreement',32,{businessStart:'pilot'}),
 c('full-order','Place the full order','Commit ₦60,000 and share the launch workload.',{cash:-60000,goal:2,time:-2,skills:{risk:-1,planning:1}},'A larger bet can speed up learning but concentrates more of your money and time.','team-agreement',24,{businessStart:'full-order'}),
 c('research','Map costs and roles first','Spend a week checking delivery costs, margins, responsibilities, and exit terms.',{time:-1,skills:{planning:2,risk:1}},'Clear unit costs and roles prevent avoidable misunderstandings.','team-agreement',24,{businessStart:'research'})
 ]},
 {id:'team-agreement',chapter:2,chain:1,title:'A difficult team conversation',category:'Relationships',difficulty:'Steady',icon:'◉',time:'Month 8',description:'Your co-founder has missed two customer follow-ups. You are frustrated, and the next delivery date is close.',context:'The working relationship matters, and so does the promise made to customers.',choices:[
 c('direct','Talk directly, with specifics','Name the missed follow-ups, ask what got in the way, and agree who owns the next steps.',{relationships:1,reputation:1,skills:{communication:2,emotional:1}},'Specific, curious conversations can protect trust while addressing the work.','business-pivot'),
 c('take-over','Handle the follow-ups yourself','Make sure customers hear back today, then revisit responsibilities.',{cash:0,time:-1,energy:-1,reputation:1,skills:{resilience:1}},'This protects the deadline, but doing it repeatedly may hide the underlying problem.','business-pivot'),
 c('pause','Pause new orders and reset roles','Tell customers about the delay and agree on a workable division of tasks.',{reputation:-1,relationships:1,time:1,skills:{planning:1,communication:1}},'A transparent pause can cost momentum and protect longer-term reliability.','business-pivot')
 ]},
 {id:'business-pivot',chapter:2,chain:1,title:'Read the signal',category:'Business',difficulty:'Stretch',icon:'⌁',time:'Month 9',description:'The pilot has mixed results. Several people liked the samples, but delivery costs leave a thin margin.',context:'You can adapt the offer, continue testing, or close this version. Prior work does not obligate you to keep investing.',choices:[
 c('adapt','Change to local pickup','Test one pickup day and revise the price before ordering more.',{cash:-5000,goal:1,skills:{risk:2,planning:1}},'An adjustment can improve the economics. Recalculate with real costs before scaling.','investment-offer',32),
 c('continue','Run one more small test','Spend ₦10,000 and track conversion and delivery costs carefully.',{cash:-10000,goal:1,skills:{risk:1,resilience:1}},'A second test can reduce uncertainty if you define what result would change your mind.','investment-offer'),
 c('close','Close the pilot cleanly','Settle shared costs and write down what you learned.',{relationships:1,energy:1,skills:{resilience:2,planning:1}},'Stopping can preserve resources for a better opportunity. Learning is still progress.','investment-offer')
 ]},
 {id:'investment-offer',chapter:2,chain:1,title:'The guaranteed return',category:'Critical thinking',difficulty:'Stretch',icon:'◇',time:'Month 10',description:'A group chat promises to double any contribution in 30 days. The organizer urges you to act today and show screenshots of payouts.',context:'Promises, urgency, and selective testimonials do not verify an investment. No investment return is guaranteed.',choices:[
 c('verify','Pause and independently verify','Do not send money yet. Check registration through official channels and ask how returns are generated.',{time:-1,skills:{risk:2,planning:1}},'Verification means using independent official sources. Screenshots and pressure are weak evidence.','family-boundary',36),
 c('small-bet','Send only what you can lose','Contribute ₦5,000 as a test, knowing it may not come back.',{cash:-5000,skills:{risk:-1}},'A small amount still carries risk. A displayed payout is not proof of a reliable scheme.','family-boundary'),
 c('decline','Decline and mute the pitch','Keep your money and tell the group you are not interested.',{reputation:1,energy:1,skills:{risk:1}},'Saying no is a valid choice, especially when basic details cannot be verified.','family-boundary')
 ]},
 {id:'family-boundary',chapter:2,chain:1,title:'The family request',category:'Family',difficulty:'Steady',icon:'♡',time:'Month 11',description:'A relative asks for a larger monthly contribution. You want to help, but the request would crowd out your own essentials.',context:'There are many ways to show care. You decide what you can sustain.',choices:[
 c('clear-limit','Set a clear monthly amount','Explain your limit kindly and offer a specific amount or practical alternative.',{cash:-10000,relationships:1,skills:{communication:2,planning:1}},'A concrete limit makes support more predictable and reduces resentment.','rest-week'),
 c('temporary-help','Offer a one-time contribution','Contribute ₦20,000 this month and explain that it is not a recurring amount.',{cash:-20000,relationships:1,energy:-1,skills:{communication:1}},'One-time help may meet an urgent need; make the boundary explicit.','rest-week'),
 c('review-budget','Review the request together','Ask what is most urgent and see whether a smaller shared plan helps.',{time:-1,relationships:1,skills:{planning:1,communication:1}},'Shared problem-solving can reveal options while preserving your own constraints.','rest-week')
 ]},
 {id:'rest-week',chapter:2,chain:1,title:'When the week gets full',category:'Personal growth',difficulty:'Starter',icon:'☾',time:'Month 12',description:'Work, family, and side projects have filled your calendar. You have one free evening and a deadline tomorrow.',context:'Energy is a game resource, not a health measure. A real person’s wellbeing deserves individualized care.',choices:[
 c('rest','Protect an evening to rest','Move one non-urgent task and keep the deadline task manageable.',{energy:2,time:1,skills:{resilience:1}},'Rest can support sustainable effort. Choose based on what truly needs to happen tomorrow.','new-role'),
 c('finish','Finish the urgent task tonight','Use the evening to meet the deadline, then schedule recovery time.',{energy:-2,career:1,skills:{planning:1}},'A short push may fit a real deadline; repeated late nights have a cost.','new-role'),
 c('renegotiate','Renegotiate the deadline','Explain the constraint early and propose a specific revised time.',{reputation:1,relationships:1,skills:{communication:2}},'Early communication gives others more room to respond.','new-role')
 ]},
 {id:'new-role',chapter:3,chain:1,title:'A new role, uncertain company',category:'Career',difficulty:'Stretch',icon:'⇧',time:'Year 2',description:'A smaller company offers a 25% pay increase and broader responsibility. Its runway and management approach are unclear.',context:'A higher salary is only one part of the offer. You can investigate, negotiate safeguards, or stay while exploring.',choices:[
 c('diligence','Ask careful questions first','Request clarity on role scope, pay timing, team turnover, and business runway.',{time:-1,career:1,skills:{risk:2,planning:1}},'Good diligence reduces uncertainty without making the decision for you.','mentor-meet',34),
 c('negotiate','Negotiate a review point','Ask for written role expectations and a 90-day check-in.',{career:1,reputation:1,skills:{communication:2}},'A review point creates a chance to assess the fit with actual experience.','mentor-meet'),
 c('stay','Stay while exploring options','Keep your current role and quietly compare other opportunities.',{energy:1,time:-1,skills:{planning:1,resilience:1}},'Stability can be valuable while you gather more information.','mentor-meet')
 ]},
 {id:'mentor-meet',chapter:3,chain:1,title:'Ask for a mentor’s perspective',category:'Career',difficulty:'Starter',icon:'✧',time:'Year 2',description:'Someone you respect offers 20 minutes to talk. You want advice but do not want to waste their time.',context:'A mentor can share perspective, not decide what is right for you.',choices:[
 c('specific-ask','Bring one focused question','Share the decision, your constraints, and what you have already considered.',{career:1,reputation:1,skills:{communication:1,planning:1}},'A focused question helps you get useful perspective and retain ownership.','relationship-check'),
 c('listen','Ask about their path','Invite them to share a relevant turning point and what they would investigate today.',{relationships:1,skills:{communication:1,risk:1}},'Stories offer ideas; your context may differ from theirs.','relationship-check'),
 c('follow-up','Send a short follow-up note','Thank them and summarize one action you plan to take.',{reputation:1,relationships:1,skills:{communication:1}},'A thoughtful follow-up turns a conversation into a continuing relationship.','relationship-check')
 ]},
 {id:'relationship-check',chapter:3,chain:1,title:'A friendship under strain',category:'Relationships',difficulty:'Steady',icon:'◌',time:'Year 2',description:'A close friend has cancelled plans several times. You miss them, and you are not sure whether to ask what is going on.',context:'You do not know the reason yet. Make space for their perspective and your own needs.',choices:[
 c('check-in','Check in without accusation','Say you miss them, ask how they are doing, and suggest a low-pressure plan.',{relationships:2,skills:{communication:2,emotional:1}},'A curious opening invites honesty without claiming to know the cause.','year-review'),
 c('direct-impact','Name the impact and ask','Explain how the cancellations affect you and ask what plans feel realistic.',{relationships:1,skills:{communication:2}},'Directness can clarify expectations while leaving room for their circumstances.','year-review'),
 c('space','Give them space for now','Pause invitations and check in again later if that feels right.',{relationships:-1,energy:1,skills:{resilience:1}},'Space can be respectful. Notice whether it is a boundary or an assumption.','year-review')
 ]},
 {id:'year-review',chapter:3,chain:1,title:'Your year in review',category:'Personal growth',difficulty:'Starter',icon:'✦',time:'Year 3',description:'A year has passed. Look back at the choices you made, the constraints you navigated, and one skill you want to strengthen next.',context:'A simulation cannot capture every factor in a real life. Your outcomes reflect the story’s rules and your choices within them.',choices:[
 c('plan-next','Choose one goal for next quarter','Write a goal that is specific, flexible, and small enough to revisit.',{goal:2,skills:{planning:2,resilience:1}},'A clear review loop helps translate experience into the next experiment.',null,40),
 c('ask-feedback','Ask someone you trust for feedback','Choose a focused question about one thing you are practicing.',{relationships:1,skills:{communication:1,emotional:1}},'Feedback is most useful when it is specific and considered alongside your own view.',null,35),
 c('celebrate-progress','Name what you handled well','Record one difficult choice, what shaped it, and what you learned.',{energy:1,skills:{resilience:2,emotional:1}},'Reflection gives credit to effort and keeps one outcome from defining your story.',null,35)
 ]},
];

for (const scenario of scenarios) {
  if (visualsByScenario[scenario.id]) scenario.visuals = visualsByScenario[scenario.id];
}

export const templates = [
 {id:'budget-template',title:'Save for a certification',category:'Money',description:'You want to save for a course while handling monthly expenses.',choices:['Build a monthly savings plan','Compare a lower-cost course','Delay enrollment and set a review date']},
 {id:'offer-template',title:'A higher-paying job offer',category:'Career',description:'You have an offer with higher pay and some uncertainty.',choices:['Research the company and role','Negotiate a written review point','Stay while exploring options']},
 {id:'family-template',title:'Family expects more support',category:'Family',description:'You want to help family while keeping your own budget workable.',choices:['Set a sustainable contribution','Offer one-time help with a clear limit','Review the urgent need together']},
 {id:'side-template',title:'Start a side business',category:'Business',description:'You want to test a small business without risking too much upfront.',choices:['Run a small demand test','Map costs and roles first','Set a budget you can afford to lose']},
 {id:'relationship-template',title:'A difficult conversation',category:'Relationships',description:'You need to raise a concern while protecting a relationship.',choices:['Describe the specific impact','Ask what is happening first','Agree on a practical next step']},
 {id:'time-template',title:'Too much on your plate',category:'Personal growth',description:'Several priorities compete for limited time and energy.',choices:['Protect one focused work block','Renegotiate a deadline early','Drop or defer a lower-priority task']},
];

export function scenarioForPlayer(scenario, player) {
  const flags = player.flags || {};
  const copy = { ...scenario, choices: scenario.choices.map(choice => ({ ...choice })) };
  if (scenario.id === 'first-pay') {
    const income = Number.isFinite(player.profile?.monthlyIncome) ? player.profile.monthlyIncome : 250000;
    const n = amount => Math.round(income * amount / 1000) * 1000;
    const fmt = amount => `₦${new Intl.NumberFormat('en-NG').format(amount)}`;
    const essentials=n(.40), familyA=n(.12), celebration=n(.14), saveA=n(.10), cashA=income-essentials-familyA-celebration-saveA;
    const familyB=n(.20), saveB=n(.10), cashB=income-essentials-familyB-saveB;
    const familyC=n(.12), goalC=n(.16), cashC=income-essentials-familyC-goalC;
    copy.description = `Your first full take-home pay in this story is ${fmt(income)}. Transport, family expectations, and a certification goal all have a claim on it.`;
    copy.context = 'The budget examples below use percentages of the fictional income you set at onboarding. Your own priorities and costs may differ.';
    copy.choices[0] = { ...copy.choices[0], detail:`Allocate ${fmt(celebration)} to celebrate, ${fmt(essentials)} to essentials, ${fmt(familyA)} to family, ${fmt(saveA)} to savings, and keep ${fmt(cashA)} flexible.`, delta:{...copy.choices[0].delta,cash:cashA,savings:saveA} };
    copy.choices[1] = { ...copy.choices[1], detail:`Contribute ${fmt(familyB)} to family, set aside ${fmt(essentials)} for essentials and ${fmt(saveB)} for savings; keep ${fmt(cashB)} flexible.`, delta:{...copy.choices[1].delta,cash:cashB,savings:saveB} };
    copy.choices[2] = { ...copy.choices[2], detail:`Set aside ${fmt(essentials)} for essentials, ${fmt(familyC)} for family, ${fmt(goalC)} for your certification, and keep ${fmt(cashC)} flexible.`, delta:{...copy.choices[2].delta,cash:cashC,savings:goalC} };
  }
  if (scenario.id === 'team-agreement' && flags.businessStart === 'research') {
    copy.title = 'Agree on the next step';
    copy.description = 'You and your friend researched the desk-accessory idea, but neither has contacted suppliers yet. You disagree about who should own the next step.';
    copy.context = 'There are no customers or orders yet. Clarify a small commitment before putting money at risk.';
    copy.choices[0] = { ...copy.choices[0], label:'Agree on ownership and a date', detail:'Name the research still needed, assign an owner, and choose a date to compare findings.' };
    copy.choices[1] = { ...copy.choices[1], label:'Gather the supplier quotes yourself', detail:'Take ownership of one bounded task, then revisit how future work is shared.' };
    copy.choices[2] = { ...copy.choices[2], label:'Pause until roles are clear', detail:'Tell your friend you want responsibilities agreed before the idea moves further.' };
  }
  if (scenario.id === 'team-agreement' && flags.businessStart === 'pilot') {
    copy.description = 'Your small sample test is underway. Your co-founder has not followed up with two people who asked to see the samples, and you are frustrated.';
    copy.context = 'The pilot is small and no full stock order has been placed. You want to learn from potential customers without damaging the working relationship.';
    copy.choices[0] = { ...copy.choices[0], detail:'Name the two missed sample follow-ups, ask what got in the way, and agree who contacts them today.' };
    copy.choices[1] = { ...copy.choices[1], detail:'Contact the two people today, then revisit how follow-up work is divided.' };
    copy.choices[2] = { ...copy.choices[2], detail:'Pause sample requests, explain the delay, and reset responsibilities before continuing.' };
  }
  if (scenario.id === 'business-pivot' && flags.businessStart === 'full-order') {
    copy.description = 'Most of the first ₦60,000 stock order is still unsold. Delivery costs make the original online offer hard to price, and another order would put more cash at risk.';
    copy.context = 'The stock purchase is already spent. These options focus on learning from or closing this first batch; no resale income is assumed.';
    copy.choices[0] = { ...copy.choices[0], label:'Offer local pickup for this stock', detail:'Spend ₦5,000 testing a pickup day and a revised price before ordering again.' };
    copy.choices[1] = { ...copy.choices[1], label:'Test demand before another order', detail:'Spend ₦10,000 on a focused promotion and track paid orders, not likes.' };
    copy.choices[2] = { ...copy.choices[2], label:'Close the pilot and settle up', detail:'Agree how to account for remaining stock and shared costs before ending the test.' };
  }
  if (scenario.id === 'business-pivot' && flags.businessStart === 'research') {
    copy.description = 'Your cost research found that delivery would leave a thin margin. You have not tested customer demand yet, so this is the moment to run a small test or pause.';
    copy.context = 'No inventory has been purchased and no revenue is assumed. Choose a limited experiment or keep your money available.';
    copy.choices[0] = { ...copy.choices[0], label:'Test local pickup with a few samples', detail:'Spend ₦5,000 testing whether pickup improves the offer before buying stock.' };
    copy.choices[1] = { ...copy.choices[1], label:'Run a small first demand test', detail:'Spend ₦10,000, track paid interest, and decide in advance what result would justify another step.' };
    copy.choices[2] = { ...copy.choices[2], label:'Pause before spending', detail:'Write down what evidence would make this business worth revisiting.' };
  }
  return copy;
}
