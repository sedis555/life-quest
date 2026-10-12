import { timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { basename, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { VISUAL_ART_DIRECTION, validVisualAsset, visualsByScenario } from '../src/visuals.js';

const MAX_REQUEST = 4_096;
const MAX_IMAGE = 8 * 1024 * 1024;

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
function secureEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}
async function bodyJson(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_REQUEST) throw new Error('Request is too large.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
function referenceFor(scenarioId, imageKey) {
  const visual = visualsByScenario[scenarioId];
  if (!visual) return null;
  if (imageKey === 'introduction' || imageKey === 'decision') return visual[imageKey];
  return visual.choices[imageKey] || null;
}
function cachePath(root, scenarioId, imageKey) {
  const filename = `${scenarioId}--${imageKey}.png`;
  const target = resolve(root, 'assets', 'generated', filename);
  const base = resolve(root, 'assets', 'generated') + sep;
  if (!target.startsWith(base) || basename(target) !== filename) throw new Error('Invalid cache destination.');
  return { target, asset: `/assets/generated/${filename}` };
}
function pngFromProvider(data) {
  const value = data?.data?.[0]?.b64_json;
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length > Math.ceil(MAX_IMAGE * 4 / 3)) return null;
  const image = Buffer.from(value, 'base64');
  if (image.length < 45 || image.length > MAX_IMAGE || image.toString('hex', 0, 8) !== '89504e470d0a1a0a' ||
      image.readUInt32BE(8) !== 13 || image.toString('ascii', 12, 16) !== 'IHDR' ||
      image.readUInt32BE(16) < 1 || image.readUInt32BE(20) < 1 || image.readUInt32BE(16) > 8192 || image.readUInt32BE(20) > 8192 ||
      image.toString('ascii', image.length - 8, image.length - 4) !== 'IEND') return null;
  return image;
}

// Explicitly opt-in admin endpoint. The browser never calls it or receives either server secret.
export async function handleVisualGeneration(req, res, { root = process.cwd(), env = process.env, fetchImpl = fetch } = {}) {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname !== '/api/visuals/generate') return false;
  if (req.method !== 'POST') { json(res, 405, { error: 'Use POST.' }); return true; }
  const { LIFE_QUEST_VISUAL_API_URL: providerUrl, LIFE_QUEST_VISUAL_API_KEY: apiKey, LIFE_QUEST_VISUAL_ADMIN_TOKEN: adminToken } = env;
  if (!providerUrl || !apiKey || !adminToken) { json(res, 503, { error: 'Optional visual generation is not configured.' }); return true; }
  if (!secureEqual(req.headers.authorization?.replace(/^Bearer\s+/i, ''), adminToken)) { json(res, 401, { error: 'Unauthorized.' }); return true; }
  let input;
  try { input = await bodyJson(req); } catch { json(res, 400, { error: 'Send a small JSON body with scenarioId and imageKey.' }); return true; }
  if (!input || typeof input.scenarioId !== 'string' || typeof input.imageKey !== 'string') { json(res, 400, { error: 'scenarioId and imageKey are required.' }); return true; }
  const reference = referenceFor(input.scenarioId, input.imageKey);
  if (!reference) { json(res, 404, { error: 'No approved image prompt exists for that scene.' }); return true; }
  const { target, asset } = cachePath(root, input.scenarioId, input.imageKey);
  const manifestPath = resolve(root, 'assets', 'generated', 'manifest.json');
  try {
    const bytes = await readFile(target);
    if (pngFromProvider({ data: [{ b64_json: bytes.toString('base64') }] })) { json(res, 200, { asset, cached: true }); return true; }
  } catch { /* Cache miss. */ }
  let parsedUrl;
  try { parsedUrl = new URL(providerUrl); } catch { json(res, 503, { error: 'Visual provider URL is invalid.' }); return true; }
  if (parsedUrl.protocol !== 'https:' && !['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname)) { json(res, 503, { error: 'Visual provider must use HTTPS.' }); return true; }
  let upstream;
  try {
    upstream = await fetchImpl(parsedUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `${VISUAL_ART_DIRECTION} ${reference.prompt}`, response_format: 'b64_json', output_format: 'png' }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch { json(res, 502, { error: 'Image provider could not be reached.' }); return true; }
  if (!upstream.ok) {
    json(res, upstream.status === 429 ? 429 : 502, { error: upstream.status === 429 ? 'Image provider rate limit reached.' : 'Image provider rejected the generation request.' });
    return true;
  }
  let response;
  try {
    const text = await upstream.text();
    if (text.length > MAX_IMAGE * 2) throw new Error('Provider response too large.');
    response = JSON.parse(text);
  } catch { json(res, 502, { error: 'Image provider returned an invalid response.' }); return true; }
  const image = pngFromProvider(response);
  if (!image) { json(res, 502, { error: 'Image provider response did not contain a valid PNG image.' }); return true; }
  try {
    await mkdir(resolve(root, 'assets', 'generated'), { recursive: true });
    const tempImage = `${target}.${randomUUID()}.tmp`;
    await writeFile(tempImage, image, { flag: 'wx' });
    await rename(tempImage, target);
    let manifest = {};
    try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')); } catch { }
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) manifest = {};
    manifest[`${input.scenarioId}:${input.imageKey}`] = asset;
    const tempManifest = `${manifestPath}.${randomUUID()}.tmp`;
    await writeFile(tempManifest, JSON.stringify(manifest, null, 2));
    await rename(tempManifest, manifestPath);
  } catch { json(res, 500, { error: 'Generated image could not be cached.' }); return true; }
  if (!validVisualAsset(asset)) { json(res, 500, { error: 'Cached asset reference failed validation.' }); return true; }
  json(res, 201, { asset, cached: false });
  return true;
}
