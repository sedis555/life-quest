import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = resolve(root, 'assets/icons');
const font = {
  L:['10000','10000','10000','10000','10000','10000','11111'],
  Q:['01110','10001','10001','10001','10101','10010','01101'],
};
const colors = {background:[8,13,24], cyan:[90,225,234], gold:[240,191,108]};

function roundedDistance(px, py, left, top, right, bottom, radius) {
  const cx = (left + right) / 2, cy = (top + bottom) / 2;
  const qx = Math.abs(px - cx) - (right - left) / 2 + radius;
  const qy = Math.abs(py - cy) - (bottom - top) / 2 + radius;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}
function pixelFor(x, y, size, maskable) {
  const p = colors.background;
  const scale = size / 5 / 17;
  const cell = scale * 5;
  const glyphWidth = cell * 11;
  const startX = (size - glyphWidth) / 2;
  const startY = (size - cell * 7) / 2 + cell * 0.1;
  const left = maskable ? size * .245 : size * .15;
  const top = maskable ? size * .245 : size * .15;
  const right = size - left, bottom = size - top;
  const edge = Math.max(1.5, size * .013);
  const dist = roundedDistance(x + .5, y + .5, left, top, right, bottom, size * .115);
  const border = !maskable && Math.abs(dist) <= edge;
  if (border) return colors.cyan;
  for (const [letter, offset] of [['L',0],['Q',6]]) {
    const row = Math.floor((y - startY) / cell);
    const col = Math.floor((x - startX) / cell) - offset;
    if (row >= 0 && row < 7 && col >= 0 && col < 5 && font[letter][row][col] === '1') return colors.cyan;
  }
  const sparkX = size * .77, sparkY = size * .23, spark = size * .018;
  if (Math.abs(x + .5 - sparkX) <= spark && Math.abs(y + .5 - sparkY) <= spark) return colors.gold;
  return p;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type), length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([name,data])));
  return Buffer.concat([length,name,data,crc]);
}
function png(size, maskable = false) {
  const header = Buffer.alloc(13); header.writeUInt32BE(size,0); header.writeUInt32BE(size,4);
  header[8]=8; header[9]=6;
  const raw = Buffer.alloc((size*4+1)*size);
  for(let y=0;y<size;y++) {
    const row=y*(size*4+1); raw[row]=0;
    for(let x=0;x<size;x++) {
      const color=pixelFor(x,y,size,maskable), at=row+1+x*4;
      raw[at]=color[0]; raw[at+1]=color[1]; raw[at+2]=color[2]; raw[at+3]=255;
    }
  }
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}

export async function generateIcons(dir = iconsDir) {
  await mkdir(dir,{recursive:true});
  await Promise.all([
    writeFile(resolve(dir,'icon-192.png'),png(192)),
    writeFile(resolve(dir,'icon-512.png'),png(512)),
    writeFile(resolve(dir,'icon-maskable-512.png'),png(512,true)),
    writeFile(resolve(dir,'apple-touch-icon.png'),png(180,true)),
  ]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await generateIcons();
}
