// Behavior test for sw.js with a mocked cache and network. Run: npm run test:sw
import fs from 'node:fs'; import vm from 'node:vm'; import assert from 'node:assert/strict';
const src = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const BASE = 'http://localhost/';
const store = new Map(); let fetched = []; let offline = false; let added = [];
const norm = (r) => new URL(typeof r === 'string' ? r : r.url, BASE).href;
const cache = {
  addAll: async (list) => { added.push(...list); },
  put: async (r, res) => { store.set(norm(r), res); },
};
const caches = {
  open: async () => cache,
  keys: async () => ['old'],
  delete: async () => true,
  match: async (r) => { const v = store.get(norm(r)); return v ? v.clone() : undefined; },
};
const handlers = {};
const self = { addEventListener: (t, f) => (handlers[t] = f), skipWaiting: async () => {}, clients: { claim: async () => {} }, location: { origin: 'http://localhost' } };
const fetchMock = async (r) => { fetched.push(norm(r)); if (offline) throw new TypeError('offline'); return new Response('net:' + norm(r)); };
vm.runInNewContext(src, { self, caches, fetch: fetchMock, URL, Response, Promise, console });

const flush = () => new Promise((r) => setTimeout(r, 10));
async function req(url, mode = 'no-cors') {
  let out, waits = [];
  const request = { url: new URL(url, BASE).href, method: 'GET', mode };
  handlers.fetch({ request, respondWith: (p) => (out = p), waitUntil: (p) => waits.push(p) });
  const res = out ? await out : null; await Promise.all(waits); await flush();
  return res ? await res.text() : null;
}

// install precache
let inst; handlers.install({ waitUntil: (p) => (inst = p) }); await inst;
assert.ok(added.length > 50 && added.length < 110, `precache size ${added.length}`);
assert.equal(added.filter((u) => u.includes('/data/')).length, 0, 'no json precached');
assert.equal(added.filter((u) => /asset\/equipment\/.*\.webp/.test(u)).length, 0, 'no equipment webp precached');

// analysis tools work offline: both pages, their stylesheet and entry module, and the static modules they import
const precached = new Set(added.map((u) => u.replace(BASE, './')));
for (const page of ['./ftir.html', './xrd.html']) assert.ok(precached.has(page), `${page} precached`);
for (const tool of ['ftir', 'xrd']) {
  const html = fs.readFileSync(new URL(`../${tool}.html`, import.meta.url), 'utf8');
  for (const [, href] of html.matchAll(/(?:href|src)="\.\/(tools\/[^"]+)"/g)) assert.ok(precached.has('./' + href), `${href} precached`);
  const entry = fs.readFileSync(new URL(`../tools/${tool}/app.js`, import.meta.url), 'utf8');
  for (const [, spec] of entry.matchAll(/from\s*'(\.{1,2}\/[^']+)'/g)) {
    const resolved = './' + new URL(spec, new URL(`./tools/${tool}/`, BASE)).href.replace(BASE, '');
    assert.ok(precached.has(resolved), `${resolved} (imported by ${tool}/app.js) precached`);
  }
}
assert.ok(!added.some((u) => u.includes('vendor/xlsx')), 'SheetJS loads on demand, not precached');

// immutable: /asset/ image fetched once
fetched = [];
assert.equal(await req('asset/equipment/beakers.webp'), 'net:' + BASE + 'asset/equipment/beakers.webp');
assert.equal(await req('asset/equipment/beakers.webp'), 'net:' + BASE + 'asset/equipment/beakers.webp');
assert.equal(fetched.length, 1, 'image fetched once, then cache-first');

// immutable: versioned URL fetched once
fetched = []; await req('script.min.js?v=7.4'); await req('script.min.js?v=7.4');
assert.equal(fetched.length, 1, 'versioned file fetched once');

// SWR: miss waits for network, hit returns cache AND refreshes in background
fetched = []; await req('thing.json'); assert.equal(fetched.length, 1);
store.set(BASE + 'thing.json', new Response('stale'));
assert.equal(await req('thing.json'), 'stale', 'serves stale');
assert.equal(fetched.length, 2, 'background revalidation happened');
assert.equal(await req('thing.json'), 'net:' + BASE + 'thing.json', 'next request sees refreshed copy');

// SWR offline with cached copy still works, without cache rejects
offline = true;
assert.equal(await req('thing.json'), 'net:' + BASE + 'thing.json');
await assert.rejects(() => req('never-cached.json'));

// navigation: network first, offline -> cached page -> index -> offline.html
offline = false; assert.equal(await req('rules.html', 'navigate'), 'net:' + BASE + 'rules.html');
offline = true; assert.equal(await req('rules.html', 'navigate'), 'net:' + BASE + 'rules.html', 'offline serves cached nav');
store.clear(); store.set(BASE + 'offline.html', new Response('OFFLINE'));
assert.equal(await req('other.html', 'navigate'), 'OFFLINE', 'falls back to offline.html');
console.log('sw logic: all assertions passed;', added.length, 'precache entries');
