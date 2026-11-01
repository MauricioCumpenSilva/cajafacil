import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HELP, PROCESSES, ROUTE_PATTERNS, helpFor, matchPattern, shouldOfferFirstTime, stepFor } from './guide.ts';

const app = readFileSync('src/App.tsx', 'utf8');
const appRoutes = new Set<string>(['/']);
for (const m of app.matchAll(/<Route path="([^"]+)"/g)) if (m[1] !== '*') appRoutes.add('/' + m[1]);

test('las rutas de la guía son exactamente las de App.tsx', () => {
  assert.deepEqual([...ROUTE_PATTERNS].sort(), [...appRoutes].sort());
});

test('toda pantalla tiene ayuda con pasos de texto no vacío', () => {
  for (const p of ROUTE_PATTERNS) {
    const h = HELP[p];
    assert.ok(h, `falta ayuda para ${p}`);
    assert.ok(h.steps.length >= 1, `${p} sin pasos`);
    for (const s of h.steps) assert.ok(s.text.trim().length > 5, `${p}: paso vacío`);
  }
});

test('matchPattern: fijas antes que con parámetro y tolera "/" final', () => {
  assert.equal(matchPattern('/ventas/anuladas'), '/ventas/anuladas');
  assert.equal(matchPattern('/ventas/abc123'), '/ventas/:id');
  assert.equal(matchPattern('/ventas/abc123/anular'), '/ventas/:id/anular');
  assert.equal(matchPattern('/fiados/luis'), '/fiados/:cliente');
  assert.equal(matchPattern('/fiados/cobro/xyz'), '/fiados/cobro/:id');
  assert.equal(matchPattern('/fiados/cobrado/xyz'), '/fiados/cobrado/:id');
  assert.equal(matchPattern('/venta/'), '/venta');
  assert.equal(matchPattern('/no-existe'), null);
  assert.equal(helpFor('/no-existe'), null);
});

test('pasos de proceso: numeración y total correctos', () => {
  assert.deepEqual([stepFor('/venta')?.index, stepFor('/venta')?.total], [1, 3]);
  assert.deepEqual([stepFor('/venta/pago')?.index, stepFor('/venta/pago')?.total], [2, 3]);
  assert.equal(stepFor('/venta/listo')?.label, 'Listo');
  assert.deepEqual([stepFor('/crear')?.index, stepFor('/imagen')?.index, stepFor('/imagen')?.total], [1, 4, 4]);
  assert.deepEqual([stepFor('/fiados/cobro/zz')?.index, stepFor('/fiados/cobro/zz')?.total], [3, 4]);
  assert.equal(stepFor('/ventas/q1/anular')?.name, 'Anular venta');
  assert.equal(stepFor('/inicio'), null);
  assert.equal(stepFor('/balance'), null);
});

test('ninguna pantalla pertenece a dos procesos y cada paso es una ruta real', () => {
  const seen = new Set<string>();
  for (const p of PROCESSES) for (const s of p.steps) {
    assert.ok(appRoutes.has(s.route), `${s.route} no existe`);
    assert.ok(!seen.has(s.route), `${s.route} repetida`);
    seen.add(s.route);
  }
});

test('ayuda de primera vez: se ofrece una sola vez por pantalla', () => {
  assert.equal(shouldOfferFirstTime('/venta', []), true);
  assert.equal(shouldOfferFirstTime('/venta', ['/venta']), false);
  assert.equal(shouldOfferFirstTime('/venta/listo', []), false);
  assert.equal(shouldOfferFirstTime('/nada', []), false);
});

test('los resaltados usan clases que existen en los estilos o en las pantallas', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');
  const code = ['src/pages', 'src/ui'].flatMap((d) => readdirSyncSafe(d)).map((f) => readFileSync(f, 'utf8')).join('\n');
  for (const [p, h] of Object.entries(HELP)) for (const s of h?.steps ?? []) {
    if (!s.target) continue;
    for (const sel of s.target.split(',')) {
      const t = sel.trim();
      const cls = /^\.([\w-]+)$/.exec(t)?.[1];
      if (cls) assert.ok(css.includes('.' + cls) || code.includes(cls), `${p}: la clase .${cls} no existe`);
      const id = /^#([\w-]+)$/.exec(t)?.[1];
      if (id) assert.ok(code.includes(`id="${id}"`), `${p}: el id #${id} no existe`);
    }
  }
});

import { readdirSync } from 'node:fs';
function readdirSyncSafe(d: string): string[] { return readdirSync(d).filter((f) => f.endsWith('.tsx')).map((f) => `${d}/${f}`); }
