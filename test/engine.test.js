import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, applyChoice, compareStates } from '../src/engine.js';
import { scenarios, scenarioForPlayer } from '../src/scenarios.js';
import { createChallengeScenario, validateGeneratedScenario } from '../src/ai-service.js';

test('choice applies deterministic balances and records effects', () => {
  const s = scenarios.find(x => x.id === 'first-pay');
  const start = freshState();
  const choice = s.choices.find(x => x.id === 'plan');
  const a = applyChoice(start,s,choice);
  const b = applyChoice(start,s,choice);
  assert.equal(a.cash,145000);
  assert.equal(a.savings,120000);
  assert.deepEqual({...a,history:a.history.map(({at,...entry})=>entry)},{...b,history:b.history.map(({at,...entry})=>entry)});
  assert.equal(a.history.length,1);
  assert.ok(a.pending.includes('rent-plan'));
  assert.equal(start.history.length,0);
});

test('negative balance and invalid choices are rejected without mutating state', () => {
  const start=freshState(); start.cash=0;
  const s=scenarios.find(x=>x.id==='side-business');
  assert.throws(()=>applyChoice(start,s,s.choices.find(x=>x.id==='full-order')),/more cash/);
  assert.throws(()=>applyChoice(start,s,{id:'invented'}),/available options/);
  assert.equal(start.cash,0);
});

test('completed scenarios leave the queue and each salary budget balances to ₦250,000', () => {
  const start=freshState();const payday=scenarios.find(s=>s.id==='first-pay');
  for(const choice of payday.choices){
    const updated=applyChoice(start,payday,choice);
    assert.deepEqual(updated.pending,['rent-plan']);
    const allocated=choice.delta.cash+choice.delta.savings;
    const spend={celebrate:165000,family:150000,plan:130000}[choice.id];
    assert.equal(allocated+spend,250000);
  }
  const rent=scenarios.find(s=>s.id==='rent-plan');
  assert.equal(rent.choices.find(c=>c.id==='family-home').delta.savings,undefined);
});

test('onboarding resources personalize the first-pay scenario without breaking its budget', () => {
  const player=freshState('Nia','student',{monthlyIncome:100000,cash:9000,savings:12000});
  const payday=scenarioForPlayer(scenarios.find(s=>s.id==='first-pay'),player);
  assert.equal(player.cash,9000);
  assert.equal(player.savings,12000);
  assert.match(payday.description,/₦100,000/);
  for(const choice of payday.choices){
    const balance=choice.delta.cash+choice.delta.savings;
    const spend={celebrate:66000,family:60000,plan:52000}[choice.id];
    assert.equal(balance+spend,100000);
  }
});

test('the complete 15-scenario journey advances without repeating its current event', () => {
  let state=freshState(); let current=scenarios.find(x=>x.id==='first-pay'); let count=0;
  while(current && count<scenarios.length){const choice=current.id==='first-pay'?current.choices.find(x=>x.id==='plan'):current.choices.find(x=>{try{applyChoice(state,current,x);return true;}catch{return false;}});assert.ok(choice,`expected an affordable choice in ${current.id}`);const previous=current.id;state=applyChoice(state,current,choice);assert.notEqual(state.pending[0],previous,'the current event must not remain at the front of the queue');current=scenarios.find(x=>x.id===state.pending.at(-1));count++;}
  assert.equal(count,scenarios.length);
  assert.equal(state.pending.length,0);
  assert.equal(state.completed.length,scenarios.length);
  assert.ok(state.energy<=10);
});

test('business choice flags persist into the following decision', () => {
  const state=freshState();const business=scenarios.find(s=>s.id==='side-business');
  const researched=applyChoice(state,business,business.choices.find(c=>c.id==='research'));
  assert.equal(researched.flags.businessStart,'research');
  assert.match(scenarioForPlayer(scenarios.find(s=>s.id==='team-agreement'),researched).description,/neither has contacted suppliers/);
});

test('alternative outcome is a separate branch; original state remains unchanged', () => {
  const base=freshState(); const s=scenarios[0]; const original=applyChoice(base,s,s.choices.find(x=>x.id==='plan'),'main');
  const alt=applyChoice(base,s,s.choices.find(x=>x.id==='celebrate'),'alt-123');
  assert.equal(original.history[0].branch,'main');
  assert.equal(alt.history[0].branch,'alt-123');
  assert.equal(original.cash,145000);
  assert.equal(original.savings,120000);
  assert.equal(alt.cash,125000);
  assert.equal(alt.savings,105000);
  assert.equal(base.history.length,0);
  const comparison=compareStates(original,alt);
  assert.equal(comparison.find(row=>row.key==='cash').difference,-20000);
  assert.equal(comparison.find(row=>row.key==='savings').difference,-15000);
});

test('business decisions change later events instead of replaying one generic scene', () => {
  const team=scenarios.find(s=>s.id==='team-agreement');
  const pivot=scenarios.find(s=>s.id==='business-pivot');
  const researchedTeam=scenarioForPlayer(team,{flags:{businessStart:'research'}});
  const researchedPivot=scenarioForPlayer(pivot,{flags:{businessStart:'research'}});
  const stockPivot=scenarioForPlayer(pivot,{flags:{businessStart:'full-order'}});
  assert.match(researchedTeam.description,/neither has contacted suppliers/);
  assert.match(researchedPivot.context,/No inventory/);
  assert.match(stockPivot.description,/stock order is still unsold/);
  assert.notEqual(researchedPivot.choices[0].label,stockPivot.choices[0].label);
});

test('built-in challenge fallback and scenario schema validation', async () => {
  const scenario=await createChallengeScenario({templateId:'budget-template',description:'save monthly'});
  assert.match(scenario.description,/save monthly/);
  assert.equal(validateGeneratedScenario(scenario).choices.length,3);
  await assert.rejects(createChallengeScenario({templateId:'budget-template',provider:async()=>({...scenario,choices:[]})}),/two to four choices/);
  await assert.rejects(createChallengeScenario({templateId:'budget-template',provider:async()=>({...scenario,choices:[...scenario.choices.slice(0,2),{...scenario.choices[2],delta:{admin:50}}]})}),/unsupported game-state/);
});
