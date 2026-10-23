// Converts the master PNGs in docs/brand/masters/ into the WebP sizes the home page uses.
//   node scripts/build-tiles.mjs            convert every master
//   node scripts/build-tiles.mjs --check    report masters that violate the brand rules
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mastersDir = path.join(root, 'docs', 'brand', 'masters');
const outDir = path.join(root, 'asset', 'tiles');
const sizes = [256, 512];

// Backdrop measured from the approved anchor (tile-elements): top and bottom edge colors.
const backdrop = { top: [0xe3, 0xfa, 0xf4], bottom: [0xb1, 0xe9, 0xd5] };
const tolerance = 18;

const masters = fs.readdirSync(mastersDir).filter(name => /^tile-[a-z-]+\.png$/.test(name)).sort();
if (!masters.length) throw new Error(`no tile-*.png masters in ${mastersDir}`);

const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= tolerance);

async function edgeColor(image, y) {
  // Mean color of a thin horizontal band, away from the corners where the object never reaches.
  const { width, height } = await image.metadata();
  // stats() ignores extract(), so the band has to be materialized first.
  const region = await image.clone().extract({ left: Math.round(width * 0.1), top: y(height), width: Math.round(width * 0.8), height: 6 }).toBuffer();
  const band = await sharp(region).stats();
  return band.channels.slice(0, 3).map(channel => Math.round(channel.mean));
}

const problems = [];
for (const name of masters) {
  const image = sharp(path.join(mastersDir, name));
  const { width, height } = await image.metadata();
  if (width !== height) problems.push(`${name}: not square (${width}x${height})`);
  const top = await edgeColor(image, () => 4);
  const bottom = await edgeColor(image, h => h - 12);
  if (!near(top, backdrop.top)) problems.push(`${name}: top backdrop rgb(${top}) differs from the anchor`);
  if (!near(bottom, backdrop.bottom)) problems.push(`${name}: bottom backdrop rgb(${bottom}) differs from the anchor`);
}

if (process.argv.includes('--check')) {
  if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
  console.log(`${masters.length} master(s) match the brand rules`);
} else {
  fs.mkdirSync(outDir, { recursive: true });
  for (const name of masters) {
    const base = name.replace(/\.png$/, '');
    for (const size of sizes) {
      const file = path.join(outDir, `${base}-${size}.webp`);
      await sharp(path.join(mastersDir, name)).resize(size, size, { fit: 'cover' }).webp({ quality: 82, effort: 6 }).toFile(file);
      console.log(`${path.relative(root, file)}  ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
    }
  }
  for (const problem of problems) console.warn(`warning  ${problem}`);
}
