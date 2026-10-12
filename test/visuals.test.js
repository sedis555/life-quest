import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scenarios } from '../src/scenarios.js';
import { validVisualAsset, visualsByScenario } from '../src/visuals.js';
import { handleVisualGeneration } from '../server/visual-generation.js';

function request(body = {}, authorization = '') {
  return {
    url: '/api/visuals/generate', method: 'POST', headers: { authorization },
    async *[Symbol.asyncIterator]() { yield Buffer.from(JSON.stringify(body)); },
  };
}
function response() {
  return { status: 0, headers: {}, body: '', writeHead(status, headers) { this.status=status; this.headers=headers; }, end(body) { this.body=body; } };
}

test('five connected story scenes carry introduction, decision, character and per-choice outcome art', async () => {
  const covered = scenarios.filter(scene => scene.visuals);
  assert.equal(covered.length, 5);
  for (const scene of covered) {
    await access(new URL(`../${visualsByScenario[scene.id].introduction.asset.slice(1)}`, import.meta.url));
    const visual = scene.visuals;
    assert.ok(visual.introduction.asset.endsWith(`${scene.id}.svg`));
    assert.equal(visual.introduction.scenarioId, scene.id);
    assert.equal(visual.decision.imageKey, 'decision');
    assert.ok(visual.characterIds.length > 0);
    assert.ok(visual.sceneDescription);
    assert.ok(visual.introduction.prompt.length > 80);
    assert.deepEqual(Object.keys(visual.choices).sort(), scene.choices.map(x => x.id).sort());
    assert.equal(new Set(Object.values(visual.choices).map(x=>x.outcomeId)).size, scene.choices.length);
    for (const choice of Object.values(visual.choices)) {
      assert.equal(choice.scenarioId, scene.id);
      assert.ok(choice.alt && choice.prompt && choice.asset.startsWith('/assets/visuals/'));
    }
  }
});

test('generated asset references are restricted to cached local image paths', () => {
  assert.equal(validVisualAsset('/assets/generated/first-pay--celebrate.png'), true);
  for (const bad of ['https://outside.example/image.png','/assets/generated/../secret.png','/assets/visuals/first-pay.svg','/assets/generated/manifest.json']) {
    assert.equal(validVisualAsset(bad), false);
  }
});

test('optional image generation is off by default and does not call a provider', async () => {
  const res = response();
  let calls = 0;
  await handleVisualGeneration(request({ scenarioId:'first-pay', imageKey:'celebrate' }), res, { env:{}, fetchImpl:async()=>{calls++;} });
  assert.equal(res.status, 503);
  assert.match(res.body, /not configured/);
  assert.equal(calls, 0);
});

test('authenticated image generation validates the scene, caches locally and reuses the image', async () => {
  const root = await mkdtemp(join(tmpdir(), 'life-quest-visual-'));
  const env = {
    LIFE_QUEST_VISUAL_API_URL:'https://images.example/v1/generations',
    LIFE_QUEST_VISUAL_API_KEY:'server-secret',
    LIFE_QUEST_VISUAL_ADMIN_TOKEN:'admin-secret',
  };
  let calls = 0; let requestOptions;
  const png = Buffer.alloc(45);
  Buffer.from('89504e470d0a1a0a','hex').copy(png,0);
  png.writeUInt32BE(13,8); png.write('IHDR',12,'ascii'); png.writeUInt32BE(1,16); png.writeUInt32BE(1,20);
  png[24]=8; png[25]=2; png.writeUInt32BE(0,33); png.write('IEND',37,'ascii');
  const fetchImpl = async (_url, options) => {
    calls++; requestOptions=options;
    return new Response(JSON.stringify({data:[{b64_json:png.toString('base64')}]}), {status:200});
  };
  try {
    const denied = response();
    await handleVisualGeneration(request({scenarioId:'first-pay',imageKey:'celebrate'}), denied, {root,env,fetchImpl});
    assert.equal(denied.status,401);
    assert.equal(calls,0);

    const unknown = response();
    await handleVisualGeneration(request({scenarioId:'not-a-scene',imageKey:'celebrate'},'Bearer admin-secret'), unknown, {root,env,fetchImpl});
    assert.equal(unknown.status,404);
    assert.equal(calls,0);

    const first = response();
    await handleVisualGeneration(request({scenarioId:'first-pay',imageKey:'celebrate'},'Bearer admin-secret'), first, {root,env,fetchImpl});
    assert.equal(first.status,201);
    assert.deepEqual(JSON.parse(first.body), {asset:'/assets/generated/first-pay--celebrate.png',cached:false});
    assert.equal(requestOptions.headers.Authorization,'Bearer server-secret');
    assert.equal(JSON.parse(requestOptions.body).prompt.includes('Nigerian life-simulation game'),true);
    assert.equal(JSON.parse(requestOptions.body).prompt.includes('small, joyful celebration'),true);
    const manifest = JSON.parse(await readFile(join(root,'assets','generated','manifest.json'),'utf8'));
    assert.equal(manifest['first-pay:celebrate'],'/assets/generated/first-pay--celebrate.png');

    const second = response();
    await handleVisualGeneration(request({scenarioId:'first-pay',imageKey:'celebrate'},'Bearer admin-secret'), second, {root,env,fetchImpl});
    assert.equal(second.status,200);
    assert.deepEqual(JSON.parse(second.body), {asset:'/assets/generated/first-pay--celebrate.png',cached:true});
    assert.equal(calls,1);
  } finally { await rm(root,{recursive:true,force:true}); }
});
