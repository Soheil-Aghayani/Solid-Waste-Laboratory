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

// Inline local @import rules, re-basing relative url() so assets resolve from the importing file.
function inlineImports(code, fromDir) {
  return code.replace(/@import\s+['"]([^'"]+)['"];?/g, (_, rel) => {
    const importPath = path.resolve(fromDir, rel);
    const base = path.relative(fromDir, path.dirname(importPath)).split(path.sep).join('/');
    return fs.readFileSync(importPath, 'utf8').replace(
      /url\((['"]?)(?![a-z]+:|\/|data:)([^'")]+)\1\)/gi,
      (_m, q, u) => `url(${q}${base}/${u}${q})`,
    );
  });
}

let built = 0;
for (const file of walk(root)) {
  const match = file.match(/^(.*)\.min\.(js|css)$/);
  if (!match) continue;
  const [, base, ext] = match;
  const sourcePath = `${base}.${ext}`;
  if (!fs.existsSync(sourcePath)) continue;
  const source = fs.readFileSync(sourcePath, 'utf8');
  const { code } = await transform(ext === 'css' ? inlineImports(source, path.dirname(sourcePath)) : source, {
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
