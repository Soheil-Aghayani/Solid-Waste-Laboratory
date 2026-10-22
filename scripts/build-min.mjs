import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skip = new Set(['node_modules', '.git', 'tmp', 'test-results']);

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let built = 0;
for (const file of walk(root)) {
  const match = file.match(/^(.*)\.min\.(js|css)$/);
  if (!match) continue;
  const [, base, ext] = match;
  const sourcePath = `${base}.${ext}`;
  if (!fs.existsSync(sourcePath)) continue;
  const { code } = await transform(fs.readFileSync(sourcePath, 'utf8'), {
    loader: ext,
    minify: true,
    legalComments: 'none',
    charset: 'utf8',
  });
  fs.writeFileSync(file, code);
  built += 1;
  console.log(`min  ${path.relative(root, file)}`);
}
console.log(`${built} files minified`);
