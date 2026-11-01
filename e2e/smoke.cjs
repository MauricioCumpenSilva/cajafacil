const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:4173/index.html';
const fails = []; const oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); if (!c) console.log('  ✗', m); };

const auditFn = () => {
  const issues = [];
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const name = (el) => (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') && document.getElementById(el.getAttribute('aria-labelledby'))?.textContent || (el.labels && el.labels[0]?.textContent) || el.textContent || '').trim();
  document.querySelectorAll('a[href],button,input,select,textarea,summary').forEach((el) => {
    if (!vis(el) && !el.classList.contains('sr-only')) return;
    if (!name(el)) issues.push('sin nombre accesible: ' + el.outerHTML.slice(0, 80));
    if (el.classList.contains('sr-only')) return;
    const r = el.getBoundingClientRect();
    if (r.height < 44 - 0.5 || r.width < 44 - 0.5) issues.push(`área táctil pequeña ${Math.round(r.width)}x${Math.round(r.height)}: ${name(el).slice(0, 25)}`);
  });
  const h1 = document.querySelectorAll('main h1'); if (h1.length !== 1) issues.push('h1 en main: ' + h1.length);
  if (!document.title || document.title === 'undefined') issues.push('sin título');
  const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i); if (dup.length) issues.push('ids repetidos: ' + dup);
  if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) issues.push('desplazamiento horizontal');
  document.querySelectorAll('svg').forEach((s) => { if (!s.getAttribute('aria-hidden') && !s.getAttribute('aria-label')) issues.push('svg sin nombre'); });
  document.querySelectorAll('img').forEach((i) => { if (!i.hasAttribute('alt')) issues.push('img sin alt'); });
  // contraste de texto
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0.99) return c; } return { r: 255, g: 255, b: 255, a: 1 }; };
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent.trim(); const el = n.parentElement; if (!t || !el || !vis(el) || el.closest('.sr-only') || el.closest('[aria-hidden="true"]') && el.getAttribute('aria-hidden') && false) continue;
    const s = getComputedStyle(el); const fg = parse(s.color); const bg = bgOf(el); if (!fg) continue;
    const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(s.fontSize); const bold = parseInt(s.fontWeight) >= 700; const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5; const key = el.className + t.slice(0, 15);
    if (ratio < need && !seen.has(key)) { seen.add(key); issues.push(`contraste ${ratio.toFixed(2)}:1 (<${need}) "${t.slice(0, 25)}" ${s.color} sobre ${s.backgroundColor}`); }
    if (size < 14) issues.push(`texto pequeño ${size}px: ${t.slice(0, 20)}`);
  }
  return issues;
};

async function audit(page, label, w = 360) {
  await page.setViewportSize({ width: w, height: 740 });
  const issues = await page.evaluate(auditFn);
  ok(issues.length === 0, `a11y ${label} (${w}px)` + (issues.length ? ': ' + issues.join(' | ') : ''));
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const hash = () => page.evaluate(() => location.hash);
  const text = (t) => page.getByText(t, { exact: false }).first();
  const click = (name, opts = {}) => page.getByRole(opts.role || 'button', { name, exact: opts.exact ?? false }).first().click();

  await page.goto(BASE);
  ok(await page.locator('h1').innerText() === 'CajaFácil', 'Bienvenida muestra CajaFácil');
  await audit(page, 'Bienvenida');

  // --- Crear cuenta
  await click('Crear mi cuenta', { role: 'link' });
  await audit(page, 'Tus datos');
  await page.fill('#nombre', 'Flor'); await page.fill('#celular', '987654321');
  await click('Continuar'); ok((await hash()) === '#/codigo', 'va a /codigo');
  await audit(page, 'Código');
  await page.fill('#codigo', '123456'); await click('Continuar'); ok((await hash()) === '#/clave', 'va a /clave');
  for (const d of '123456') await page.locator('.keypad .key', { hasText: new RegExp('^' + d + '$') }).click();
  await audit(page, 'Clave');
  await page.locator('.btn--primary').click(); ok((await hash()) === '#/imagen', 'va a /imagen');
  await audit(page, 'Imagen');
  await page.getByText('Bodeguero', { exact: true }).click();
  await page.getByRole('button', { name: 'Empezar' }).click();
  ok(await page.getByText('Creando tu cuenta…').isVisible(), 'pantalla de espera "Creando tu cuenta…"');
  await page.waitForURL(/#\/inicio/, { timeout: 4000 });
  ok(await page.locator('h1').innerText() === 'Hola, Flor', 'Inicio: "Hola, Flor"');
  ok(await page.locator('.hello svg').count() === 1, 'Inicio muestra el avatar elegido');
  ok((await page.locator('.bubble').innerText()).includes('¡Hola, Flor! Lista para registrar tu nueva venta.'), 'globo: primera vez del día');
  ok(await page.locator('.btn--attention').count() === 1, 'Nueva venta resaltada');
  await audit(page, 'Inicio con globo');
  await page.screenshot({ path: 'e2e/inicio.png' });

  // --- Venta efectivo 7.50 con S/10
  await click('Nueva venta', { role: 'link' });
  ok((await page.locator('.process .step').innerText()).includes('Paso 1 de 3'), 'Paso 1 de 3');
  for (const k of ['7', '.', '5']) await page.locator('.keypad .key', { hasText: new RegExp('^' + (k === '.' ? '\\.' : k) + '$') }).click();
  ok((await page.locator('.display__amount').innerText()).includes('7.50'), 'monto 7.50');
  await audit(page, 'Nueva venta');
  await click('Siguiente');
  ok(await page.locator('.process .step', { hasText: 'Paso 2 de 3' }).waitFor({ timeout: 2000 }).then(() => true, () => false), 'Paso 2 de 3');
  await page.locator('.shortcuts .chip', { hasText: '10' }).first().click();
  ok((await page.locator('.change').innerText()).includes('2.50'), 'vuelto 2.50');
  await audit(page, 'Pago efectivo');
  await click('Guardar venta');
  await page.waitForURL(/#\/venta\/listo/);
  await audit(page, 'Venta guardada');

  // --- Fiado 20 con cliente nuevo
  await page.goto(BASE + '#/inicio');
  await click('Nueva venta', { role: 'link' });
  for (const k of ['2', '0']) await page.locator('.keypad .key', { hasText: new RegExp('^' + k + '$') }).click();
  await click('Siguiente'); await click('Fiado', { exact: true });
  await audit(page, 'Pago fiado');
  await click('Guardar fiado'); ok(await page.getByText('Elige a quién se le fía').isVisible(), 'exige elegir cliente');
  await click('+ Agregar cliente nuevo');
  await page.fill('#cliente-nuevo', 'luis'); await click('Guardar cliente');
  ok(await page.getByText('Ya tienes un cliente con ese nombre').isVisible(), 'rechaza cliente repetido');
  await audit(page, 'Cliente nuevo con error');
  await page.fill('#cliente-nuevo', 'Doña Rosa'); await click('Guardar cliente');
  ok(await page.getByText('Se anota como deuda de Doña Rosa').isVisible(), 'cliente nuevo queda elegido');
  await click('Guardar fiado'); await page.waitForURL(/#\/venta\/listo/);

  // --- Fiados y cobro
  await page.goto(BASE + '#/fiados');
  ok(await page.getByText('Doña Rosa').isVisible(), 'Fiados lista a Doña Rosa');
  await audit(page, 'Fiados');
  await page.getByText('Doña Rosa').first().click();
  await audit(page, 'Deudas de cliente');
  await page.locator('.sale-row').first().click();
  ok(await page.locator('.process .step', { hasText: 'Paso 3 de 4' }).waitFor({ timeout: 2000 }).then(() => true, () => false), 'Cobro: Paso 3 de 4');
  await click('Registrar cobro'); ok(await page.getByText('Elige cómo te pagó').isVisible(), 'exige forma de cobro');
  await click('Yape / Plin', { exact: true }); await audit(page, 'Cobrar fiado');
  await click('Registrar cobro');
  ok(await page.getByText('Registrando cobro…').isVisible(), 'espera "Registrando cobro…"');
  await page.waitForURL(/#\/fiados\/cobrado\//); await audit(page, 'Cobro registrado');
  await page.goto(BASE + '#/inicio');
  ok((await page.locator('.amount').first().innerText()) === 'S/ 27.50', 'Inicio suma 7.50 + fiado cobrado 20.00');
  await page.goto(BASE + '#/balance'); await audit(page, 'Balance');
  await page.goto(BASE + '#/ventas'); await audit(page, 'Ventas de hoy');
  await page.locator('.sale-row').first().click(); await audit(page, 'Detalle');
  await click('Anular venta', { role: 'link' }); await audit(page, 'Anular');
  await click('Sí, anular'); await page.waitForURL(/#\/ventas\/anuladas/);
  await audit(page, 'Anuladas');
  await page.goto(BASE + '#/cuenta'); await audit(page, 'Mi cuenta');
  await page.goto(BASE + '#/ayuda'); await audit(page, 'Ayuda');

  // --- Reabrir la app el mismo día
  await page.goto(BASE + '#/inicio'); await page.reload();
  const b = await page.locator('.bubble').innerText();
  ok(b.includes('¡Hola de nuevo, Flor! Sigue registrando tus ventas.') && b.includes('Hoy llevas'), 'globo "Hola de nuevo" al reabrir: ' + b.replace(/\n/g, ' '));
  await click('Entendido'); ok(await page.locator('.bubble').count() === 0, 'el globo se cierra');

  // --- Ayuda guiada
  await page.goto(BASE + '#/venta'); await page.getByRole('button', { name: 'Ayuda' }).click();
  ok(await page.locator('.help-sheet').isVisible(), 'abre ventana de ayuda');
  ok(await page.locator('.help-target').count() === 1, 'resalta el elemento del paso');
  await page.locator('.help-sheet').getByRole('button', { name: 'Siguiente' }).click(); ok(await page.locator('.help-target.shortcuts').waitFor({ timeout: 2000 }).then(() => true, () => false), 'el resalte cambia de paso');
  await audit(page, 'Ayuda abierta');
  await page.keyboard.press('Escape'); ok(await page.locator('.help-sheet').count() === 0, 'Escape cierra la ayuda');
  ok(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) === 'Ayuda', 'el foco vuelve al botón ?');

  // --- Teclado: se puede llegar a todo con Tab y siempre hay foco visible
  await page.goto(BASE + '#/inicio'); await page.reload(); 
  let badFocus = 0; for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); badFocus += await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return 0; const s = getComputedStyle(e); return (s.outlineStyle === 'none' || parseFloat(s.outlineWidth) < 2) ? 1 : 0; }); }
  ok(badFocus === 0, 'foco visible en 12 Tab seguidos (fallos: ' + badFocus + ')');

  // --- Reflow a 320 px y zoom
  for (const r of ['#/inicio', '#/venta', '#/fiados', '#/balance']) { await page.goto(BASE + r); await audit(page, r, 320); }
  ok(errors.length === 0, 'sin errores de consola/página' + (errors.length ? ': ' + errors.join(' | ') : ''));

  // --- Bloqueo por clave (con reloj controlado)
  const p2 = await ctx.newPage(); await p2.clock.install();
  await p2.goto(BASE + '#/'); await p2.evaluate(() => localStorage.setItem('cajafacil.session.v1', '0')); await p2.goto(BASE + '#/entrar'); await p2.reload();
  for (let i = 0; i < 3; i++) { await p2.fill('#login-celular', '987654321'); await p2.fill('#login-clave', '000000'); await p2.getByRole('button', { name: /Entrar|Espera/ }).click(); }
  ok(await p2.locator('.wait').isVisible(), 'tras 3 fallos aparece la espera');
  ok(await p2.getByRole('button', { name: /Espera 30 s|Espera 29 s/ }).isDisabled(), 'botón desactivado con cuenta regresiva');
  await audit(p2, 'Login bloqueado');
  await p2.clock.fastForward(5000); ok(/Espera 2[0-5] s/.test(await p2.locator('.btn--primary').innerText()), 'la cuenta regresiva baja');
  await p2.clock.fastForward(31000);
  ok(await p2.getByText('Ya puedes intentar de nuevo.').isVisible(), 'avisa cuando termina la espera');
  await p2.fill('#login-celular', '987654321'); await p2.fill('#login-clave', '123456'); await p2.getByRole('button', { name: 'Entrar' }).click();
  ok(await p2.getByText('Entrando…').isVisible(), 'espera "Entrando…"');
  await p2.clock.fastForward(1000); await p2.waitForURL(/#\/inicio/);

  console.log(`\n${oks.length} correctas, ${fails.length} con fallo`);
  await browser.close(); process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error('ERROR', e.message.split('\n').slice(0, 6).join('\n')); process.exit(2); });
