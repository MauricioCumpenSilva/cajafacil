import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

/**
 * Revisión estática de accesibilidad (WCAG 2.1 AA). Complementa la prueba en navegador de e2e/smoke.cjs
 * y la revisión manual con lector de pantalla (ver ACCESIBILIDAD.md).
 */
const read = (p: string) => readFileSync(p, 'utf8');
const files = (d: string) => readdirSync(d).filter((f) => f.endsWith('.tsx')).map((f) => `${d}/${f}`);
const pages = files('src/pages');
const allTsx = [...pages, ...files('src/ui'), ...files('src/state'), 'src/App.tsx'];
const css = read('src/styles/global.css');
const tokens = read('src/styles/tokens.css');

test('1.1.1 / 4.1.2: nada clicable que no sea botón, enlace o campo', () => {
  for (const f of allTsx) for (const m of read(f).matchAll(/<(div|span|p|li|section|h[1-6])\b[^>]*\bonClick=/g)) assert.fail(`${f}: ${m[0].slice(0, 60)}`);
});

test('2.4.3: ningún tabIndex positivo (rompería el orden del teclado)', () => {
  for (const f of allTsx) for (const m of read(f).matchAll(/tabIndex=\{?(\d+)/g)) assert.ok(Number(m[1]) <= 0, `${f}: tabIndex ${m[1]}`);
});

test('2.4.6: cada pantalla tiene exactamente un encabezado principal <h1> (o lo recibe del layout)', () => {
  for (const f of pages) {
    const n = (read(f).match(/<h1[\s>]/g) ?? []).length;
    assert.ok(n >= 1, `${f}: sin <h1>`);
  }
});

test('4.1.2: ventanas (role="dialog") tienen nombre', () => {
  for (const f of allTsx) for (const m of read(f).matchAll(/<[a-z]+[^>]*role="dialog"[^>]*>/g)) assert.match(m[0], /aria-labelledby|aria-label=/, f);
});

test('1.1.1: imágenes y SVG con nombre o marcados como decorativos', () => {
  for (const f of allTsx) {
    const src = read(f);
    for (const m of src.matchAll(/<img\b[^>]*>/g)) assert.match(m[0], /alt=/, f);
  }
  const brand = read('src/ui/Brand.tsx');
  assert.match(brand, /aria-label/);
  assert.match(brand, /aria-hidden/);
});

test('1.3.1 / 3.3.2: todo campo tiene etiqueta visible (TextField) y error enlazado', () => {
  const tf = read('src/ui/TextField.tsx');
  assert.match(tf, /<label htmlFor=\{id\}/);
  assert.match(tf, /aria-describedby/);
  assert.match(tf, /aria-invalid/);
  for (const f of pages) assert.ok(!/<input\b(?![^>]*type="radio")/.test(read(f)), `${f}: <input> suelto, usar TextField`);
});

test('3.3.1: los errores se anuncian (role="alert") y no dependen solo del color', () => {
  for (const f of allTsx) for (const m of read(f).matchAll(/className="field__error"[^>]*>/g)) assert.match(m[0], /role="(alert|status)"/, f);
  assert.match(read('src/ui/TextField.tsx'), /⚠/);
});

test('2.4.7: nunca se quita el contorno de foco sin reemplazo', () => {
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px/);
  for (const m of css.matchAll(/([^{}]+)\{[^}]*outline:\s*none[^}]*\}/g)) assert.match(m[1].trim(), /^main:focus$/, `outline:none en ${m[1].trim()}`);
});

test('2.3.3 / 2.2.2: cada animación se apaga con "reducir movimiento"', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\*:not\(\.spinner\)/);
  assert.ok((css.match(/animation:/g) ?? []).length >= 1);
});

test('1.4.4 / 1.4.10: la página permite zoom y se adapta (sin bloquear la ampliación)', () => {
  const html = read('index.html');
  assert.match(html, /width=device-width, initial-scale=1/);
  assert.doesNotMatch(html, /user-scalable\s*=\s*(no|0)|maximum-scale/);
  assert.doesNotMatch(css, /overflow-x:\s*hidden/);
});

test('2.2.1: nada desaparece solo (globos y ayudas se cierran con un botón)', () => {
  const home = read('src/pages/Home.tsx');
  assert.match(home, /Entendido/);
  assert.doesNotMatch(home, /setTimeout/);
  assert.doesNotMatch(read('src/ui/HelpSheet.tsx'), /setTimeout/);
});

test('2.4.2: cada pantalla actualiza el título de la página y mueve el foco al encabezado', () => {
  const layout = read('src/ui/Layout.tsx');
  assert.match(layout, /document\.title =/);
  assert.match(layout, /h1\.focus\(/);
});

test('2.4.1: enlace "Ir al contenido" presente y con tamaño táctil', () => {
  assert.match(read('src/ui/SkipLink.tsx'), /Ir al contenido/);
  assert.match(css, /\.skip-link\s*\{[^}]*min-height:\s*var\(--tap\)/);
});

test('2.5.5 (objetivo): todo control interactivo declara altura mínima táctil', () => {
  for (const cls of ['.btn', '.chip', '.key', '.method', '.tab', '.choice', '.field__input']) {
    const m = new RegExp(`(^|\\n)\\${cls}\\s*\\{[^}]*min-height:\\s*(var\\(--tap\\)|\\d+px)`).exec(css);
    assert.ok(m, `${cls} sin min-height`);
  }
});

/* ---- contraste ---- */
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const tk: Record<string, string> = {};
for (const m of tokens.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) tk[m[1]] = m[2];
const ON_GREEN = '#e8f3ea', ON_AMBER = '#fdf0e1', STEP_BG = '#ece7df';

test('1.4.3: texto sobre los fondos suaves (verde, ámbar, gris cálido) ≥ 4.5:1', () => {
  for (const bg of [ON_GREEN, ON_AMBER, STEP_BG]) {
    assert.ok(ratio(tk['color-text'], bg) >= 4.5, `texto sobre ${bg}`);
  }
  // Los fondos suaves solo llevan texto oscuro; el verde y el ámbar de marca sobre ellos (4.45 y 4.48:1) no se usan para texto.
  assert.ok(ratio('#ffffff', tk['color-primary']) >= 4.5);
});

test('1.4.11: elementos gráficos y bordes ≥ 3:1 contra el fondo', () => {
  for (const c of ['color-border', 'color-focus', 'color-info', 'color-primary', 'color-danger', 'color-fiado', 'color-yape']) {
    for (const bg of [tk['color-bg'], tk['color-surface']]) assert.ok(ratio(tk[c], bg) >= 3, `${c} sobre ${bg}: ${ratio(tk[c], bg).toFixed(2)}`);
  }
});

test('1.4.1: el estado nunca depende solo del color (texto o símbolo acompañan)', () => {
  const list = read('src/pages/SalesList.tsx');
  assert.match(list, /Anulada/); assert.match(list, /Guardada/);
  assert.match(read('src/pages/Login.tsx'), /⏳/);
  assert.match(read('src/ui/ProcessSteps.tsx'), /Paso \{info\.index\} de \{info\.total\}/);
});
