import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

type Handler = (e: Record<string, unknown>) => void;

/** Ejecuta public/sw.js con un "navegador" falso para comprobar el modo sin conexión. */
function loadSw(opts: { offline: boolean }) {
  const handlers: Record<string, Handler> = {};
  const store = new Map<string, string>();
  const cache = {
    addAll: async (list: string[]) => { for (const u of list) store.set(new URL(u, 'https://app.test/').href, `shell:${u}`); },
    put: async (k: string | { url: string }, v: { body: string }) => { store.set(new URL(typeof k === 'string' ? k : k.url, 'https://app.test/').href, v.body); },
  };
  const caches = {
    open: async () => cache,
    keys: async () => ['viejo', 'cajafacil-v1'],
    delete: async (k: string) => { store.set('deleted:' + k, '1'); return true; },
    match: async (k: string | { url: string }) => {
      const v = store.get(new URL(typeof k === 'string' ? k : k.url, 'https://app.test/').href);
      return v === undefined ? undefined : { body: v };
    },
  };
  const state = { offline: opts.offline };
  const fetchFake = async (req: { url: string }) => {
    if (state.offline) throw new TypeError('Failed to fetch');
    const res = { ok: true, body: `red:${req.url}`, clone() { return { ...res }; } };
    return res;
  };
  const self = { location: { origin: 'https://app.test' }, addEventListener: (n: string, h: Handler) => { handlers[n] = h; }, skipWaiting: async () => {}, clients: { claim: async () => {} } };
  new Function('self', 'caches', 'fetch', 'URL', readFileSync('public/sw.js', 'utf8'))(self, caches, fetchFake, URL);
  const run = async (name: string, extra: Record<string, unknown> = {}) => {
    let result: unknown; let waited: Promise<unknown> | undefined;
    handlers[name]({ ...extra, waitUntil: (p: Promise<unknown>) => { waited = p; }, respondWith: (p: Promise<unknown>) => { result = p; } });
    return waited ? await waited : await (result as Promise<unknown>);
  };
  return { handlers, store, state, run };
}

test('instalación: guarda la página principal; activación: borra copias viejas', async () => {
  const sw = loadSw({ offline: false });
  await sw.run('install');
  assert.ok(sw.store.has('https://app.test/index.html'));
  await sw.run('activate');
  assert.ok(sw.store.has('deleted:viejo'));
  assert.ok(!sw.store.has('deleted:cajafacil-v1'));
});

test('sin internet: abrir la app sirve la copia guardada', async () => {
  const sw = loadSw({ offline: true });
  await sw.run('install');
  const res = await sw.run('fetch', { request: { method: 'GET', url: 'https://app.test/', mode: 'navigate' } }) as { body: string };
  assert.match(res.body, /shell:\.\/index\.html/);
});

test('con internet: abrir la app actualiza la copia guardada', async () => {
  const sw = loadSw({ offline: false });
  await sw.run('install');
  const res = await sw.run('fetch', { request: { method: 'GET', url: 'https://app.test/', mode: 'navigate' } }) as { body: string };
  assert.match(res.body, /^red:/);
  await new Promise((r) => setTimeout(r, 10));
  assert.match(sw.store.get('https://app.test/index.html') ?? '', /^red:/);
});

test('archivos: primero la copia guardada, y funcionan sin internet tras haberse visto una vez', async () => {
  const sw = loadSw({ offline: false });
  const req = { method: 'GET', url: 'https://app.test/assets/app.js', mode: 'cors' };
  await sw.run('fetch', { request: req });
  await new Promise((r) => setTimeout(r, 10));
  sw.state.offline = true;
  const res = await sw.run('fetch', { request: req }) as { body: string };
  assert.match(res.body, /^red:/);
});

test('no interfiere con peticiones que no son GET ni con otros sitios', () => {
  const sw = loadSw({ offline: false });
  let answered = false;
  const h = sw.handlers.fetch;
  h({ request: { method: 'POST', url: 'https://app.test/x', mode: 'cors' }, respondWith: () => { answered = true; } });
  h({ request: { method: 'GET', url: 'https://otro.com/x', mode: 'cors' }, respondWith: () => { answered = true; } });
  assert.equal(answered, false);
});

test('manifest e icono válidos para instalar la app', () => {
  const m = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as Record<string, unknown>;
  assert.equal(m.name, 'CajaFácil');
  assert.equal(m.display, 'standalone');
  assert.equal(m.start_url, './');
  assert.equal(m.lang, 'es');
  const icons = m.icons as { src: string }[];
  assert.ok(icons.length >= 1);
  for (const i of icons) assert.ok(existsSync('public/' + i.src.replace('./', '')), `falta ${i.src}`);
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /rel="manifest"/);
  assert.match(readFileSync('src/main.tsx', 'utf8'), /serviceWorker\.register\('\.\/sw\.js'\)/);
});
