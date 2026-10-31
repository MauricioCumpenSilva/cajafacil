import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcReducer, initialCalc, totalCents, entryText, canContinue } from './calculator.ts';
import type { CalcAction, CalcState } from './calculator.ts';

const run = (actions: CalcAction[], from: CalcState = initialCalc) => actions.reduce(calcReducer, from);
const d = (n: number): CalcAction => ({ type: 'digit', digit: n });
const dot: CalcAction = { type: 'dot' };
const back: CalcAction = { type: 'backspace' };

test('escribir 1 y luego 2 da 12 (no reemplaza)', () => {
  const s = run([d(1), d(2)]);
  assert.equal(totalCents(s), 1200);
  assert.equal(entryText(s), '12');
});

test('punto decimal permite 10.70', () => {
  const s = run([d(1), d(0), dot, d(7), d(0)]);
  assert.equal(totalCents(s), 1070);
  assert.equal(entryText(s), '10.70');
});

test('un decimal se interpreta como décimas: 7.5 = 750 céntimos', () => {
  assert.equal(totalCents(run([d(7), dot, d(5)])), 750);
});

test('máximo 2 decimales y un solo punto', () => {
  const s = run([d(1), dot, d(2), d(3), d(4), dot]);
  assert.equal(entryText(s), '1.23');
});

test('punto primero escribe 0.', () => {
  assert.equal(entryText(run([dot, d(5)])), '0.5');
});

test('ceros a la izquierda no se acumulan', () => {
  assert.equal(entryText(run([d(0), d(0), d(5)])), '5');
});

test('límite de 5 dígitos enteros', () => {
  const s = run([d(1), d(2), d(3), d(4), d(5), d(6)]);
  assert.equal(entryText(s), '12345');
});

test('borrar quita el último dígito, luego el punto', () => {
  assert.equal(entryText(run([d(1), d(2), back])), '1');
  assert.equal(entryText(run([d(1), dot, d(5), back])), '1.');
  assert.equal(entryText(run([d(1), dot, d(5), back, back])), '1');
});

test('atajos se suman al monto', () => {
  const s = run([{ type: 'preset', cents: 250 }, { type: 'preset', cents: 500 }]);
  assert.equal(totalCents(s), 750);
});

test('el botón + suma lo escrito como sumando y limpia la entrada', () => {
  const s = run([d(1), d(2), { type: 'plus' }, d(3)]);
  assert.equal(totalCents(s), 1500);
  assert.deepEqual(s.parts, [1200]);
  assert.equal(entryText(s), '3');
});

test('+ sin nada escrito no hace nada', () => {
  assert.deepEqual(run([{ type: 'plus' }]), initialCalc);
});

test('borrar con entrada vacía quita el último sumando', () => {
  const s = run([{ type: 'preset', cents: 250 }, { type: 'preset', cents: 500 }, back]);
  assert.equal(totalCents(s), 250);
});

test('no se puede continuar con total 0', () => {
  assert.equal(canContinue(initialCalc), false);
  assert.equal(canContinue(run([d(1)])), true);
});

test('clear reinicia', () => {
  assert.deepEqual(run([d(5), { type: 'clear' }]), initialCalc);
});
