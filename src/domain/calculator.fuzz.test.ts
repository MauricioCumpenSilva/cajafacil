import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcReducer, initialCalc, entryCents, totalCents, SHORTCUTS_CENTS, MAX_INT_DIGITS, MAX_DEC_DIGITS } from './calculator.ts';
import type { CalcAction, CalcState } from './calculator.ts';
import { MAX_SALE_CENTS } from './money.ts';

/** Generador pseudoaleatorio con semilla fija: la prueba es repetible. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomAction(r: () => number): CalcAction {
  const x = r();
  if (x < 0.55) return { type: 'digit', digit: Math.floor(r() * 10) };
  if (x < 0.65) return { type: 'dot' };
  if (x < 0.8) return { type: 'backspace' };
  if (x < 0.9) return { type: 'plus' };
  if (x < 0.98) return { type: 'preset', cents: SHORTCUTS_CENTS[Math.floor(r() * SHORTCUTS_CENTS.length)] };
  return { type: 'clear' };
}

function assertInvariants(s: CalcState, trail: string) {
  const ctx = `tras ${trail}`;
  assert.ok(s.int.length <= MAX_INT_DIGITS, `enteros de más ${ctx}`);
  assert.ok(s.dec.length <= MAX_DEC_DIGITS, `decimales de más ${ctx}`);
  if (!s.hasDot) assert.equal(s.dec, '', `decimales sin punto ${ctx}`);
  assert.match(s.int, /^(|0|[1-9]\d*)$/, `ceros a la izquierda ${ctx}`);
  assert.match(s.dec, /^\d*$/, `decimales no numéricos ${ctx}`);
  assert.ok(Number.isInteger(entryCents(s)) && entryCents(s) >= 0, `entrada inválida ${ctx}`);
  for (const p of s.parts) assert.ok(Number.isInteger(p) && p > 0, `sumando inválido ${ctx}`);
  const t = totalCents(s);
  assert.ok(Number.isInteger(t) && t >= 0 && t <= MAX_SALE_CENTS, `total fuera de rango ${ctx}`);
}

test('5 000 secuencias aleatorias de teclas nunca rompen las reglas de la calculadora', () => {
  const r = mulberry32(2026);
  for (let n = 0; n < 5000; n++) {
    let s = initialCalc;
    const trail: string[] = [];
    for (let i = 0; i < 40; i++) {
      const a = randomAction(r);
      trail.push(a.type === 'digit' ? String(a.digit) : a.type);
      s = calcReducer(s, a);
      assertInvariants(s, trail.join(' '));
    }
  }
});

test('el reductor no modifica el estado anterior (inmutabilidad)', () => {
  const s: CalcState = { int: '12', dec: '', hasDot: false, parts: [250] };
  const copy = JSON.stringify(s);
  calcReducer(s, { type: 'digit', digit: 5 });
  calcReducer(s, { type: 'plus' });
  calcReducer(s, { type: 'backspace' });
  assert.equal(JSON.stringify(s), copy);
});
