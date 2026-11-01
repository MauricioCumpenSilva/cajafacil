import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const read = (p: string) => readFileSync(p, 'utf8');
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const tsx = walk('src').filter((f) => f.endsWith('.tsx'));
const app = read('src/App.tsx');

const routes = new Set<string>(['/']);
for (const m of app.matchAll(/<Route path="([^"]+)"/g)) if (m[1] !== '*') routes.add('/' + m[1]);

const toRegex = (r: string) => new RegExp('^' + r.replace(/:[a-z]+/gi, '[^/]+') + '$');
const matchesRoute = (path: string) => [...routes].some((r) => toRegex(r).test(path));

function targets(): { file: string; path: string }[] {
  const out: { file: string; path: string }[] = [];
  for (const f of tsx) {
    const src = read(f);
    const rx = [
      /\bto="(\/[^"]*)"/g, /\bto=\{`(\/[^`]*)`\}/g,
      /navigate\('(\/[^']*)'/g, /navigate\(`(\/[^`]*)`/g, /<Navigate to="(\/[^"]*)"/g,
    ];
    for (const r of rx) for (const m of src.matchAll(r)) out.push({ file: f, path: m[1].replace(/\$\{[^}]*\}/g, 'x') });
  }
  return out;
}

test('todo enlace o navegación apunta a una ruta que existe', () => {
  const t = targets();
  assert.ok(t.length > 10, 'se esperaban muchos destinos');
  for (const { file, path } of t) assert.ok(matchesRoute(path), `${file}: la ruta ${path} no existe en App.tsx`);
});

test('ninguna pantalla "Pending" sin construir queda en las etapas 3 y 4', () => {
  for (const m of app.matchAll(/<Pending title="([^"]+)" stage=\{(\d)\}/g)) assert.ok(Number(m[2]) >= 5, `${m[1]} debería estar hecha`);
});

test('las rutas fijas van antes de :id (ventas/anuladas)', () => {
  assert.ok(app.indexOf('ventas/anuladas') < app.indexOf('ventas/:id"'));
});

test('todo <button> declara su tipo (evita enviar formularios sin querer)', () => {
  for (const f of tsx) for (const m of read(f).matchAll(/<button\b[^>]*>/g)) assert.match(m[0], /type=/, `${f}: ${m[0].slice(0, 60)}`);
});

test('index.html declara idioma español', () => {
  assert.match(read('index.html'), /<html[^>]*lang="es"/);
});

test('tamaños: texto base ≥ 14 px y área táctil ≥ 44 px', () => {
  const tokens = read('src/styles/tokens.css');
  assert.ok(Number(/--font-base:\s*(\d+)px/.exec(tokens)?.[1]) >= 14);
  assert.ok(Number(/--tap:\s*(\d+)px/.exec(tokens)?.[1]) >= 44);
  for (const m of read('src/styles/global.css').matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) assert.ok(Number(m[1]) >= 14, `font-size ${m[1]}px`);
});

function lum(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('contraste WCAG AA (≥ 4.5:1) en los pares de color del texto', () => {
  const tk: Record<string, string> = {};
  for (const m of read('src/styles/tokens.css').matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) tk[m[1]] = m[2];
  const pairs: [string, string][] = [
    ['color-text', 'color-bg'], ['color-text', 'color-surface'], ['color-text-soft', 'color-bg'], ['color-text-soft', 'color-surface'],
    ['color-primary-contrast', 'color-primary'], ['color-primary', 'color-surface'], ['color-info', 'color-surface'],
    ['color-danger', 'color-surface'], ['color-danger', 'color-bg'], ['color-yape', 'color-surface'], ['color-fiado', 'color-surface'],
    ['color-text', 'color-warn-bg'], ['color-fiado', 'color-warn-bg'],
  ];
  for (const [fg, bg] of pairs) {
    assert.ok(tk[fg] && tk[bg], `falta token ${fg} o ${bg}`);
    assert.ok(ratio(tk[fg], tk[bg]) >= 4.5, `${fg} sobre ${bg}: ${ratio(tk[fg], tk[bg]).toFixed(2)}:1`);
  }
  for (const c of ['color-info', 'color-danger', 'color-yape', 'color-fiado']) {
    assert.ok(ratio('#ffffff', tk[c]) >= 4.5, `blanco sobre ${c}: ${ratio('#ffffff', tk[c]).toFixed(2)}:1`);
  }
});
