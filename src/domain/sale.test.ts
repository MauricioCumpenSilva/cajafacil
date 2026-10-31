import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSale, voidSale, dayTotals, localDayKey, sortRecent } from './sale.ts';
import { DomainError } from './errors.ts';
import { formatSoles } from './money.ts';

const now = new Date(2026, 9, 30, 15, 12);
const day = localDayKey(now);

test('formatSoles', () => {
  assert.equal(formatSoles(750), 'S/ 7.50');
  assert.equal(formatSoles(0), 'S/ 0.00');
  assert.equal(formatSoles(123456), 'S/ 1,234.56');
});

test('venta en efectivo calcula el vuelto', () => {
  const s = createSale({ amountCents: 750, method: 'efectivo', paidCents: 1000 }, now, 'a');
  assert.equal(s.changeCents, 250);
  assert.equal(s.status, 'guardada');
});

test('paga justo: vuelto 0', () => {
  assert.equal(createSale({ amountCents: 750, method: 'efectivo' }, now, 'a').changeCents, 0);
});

test('pago menor al total se rechaza con mensaje', () => {
  assert.throws(() => createSale({ amountCents: 1250, method: 'efectivo', paidCents: 1000 }, now, 'a'),
    (e: unknown) => e instanceof DomainError && e.code === 'PAGO_INSUFICIENTE' && e.message.length > 10);
});

test('monto 0 se rechaza', () => {
  assert.throws(() => createSale({ amountCents: 0, method: 'yape' }, now, 'a'),
    (e: unknown) => e instanceof DomainError && e.code === 'MONTO_INVALIDO');
});

test('fiado exige cliente', () => {
  assert.throws(() => createSale({ amountCents: 500, method: 'fiado' }, now, 'a'),
    (e: unknown) => e instanceof DomainError && e.code === 'FIADO_SIN_CLIENTE');
});

test('totales del día: efectivo + yape suman; fiado y anuladas no', () => {
  const a = createSale({ amountCents: 1250, method: 'efectivo' }, now, 'a');
  const b = createSale({ amountCents: 800, method: 'yape' }, now, 'b');
  const c = createSale({ amountCents: 500, method: 'fiado', customerId: 'luis' }, now, 'c');
  const d = voidSale(createSale({ amountCents: 2500, method: 'efectivo' }, now, 'd'), now);
  const t = dayTotals([a, b, c, d], day);
  assert.equal(t.totalCents, 2050);
  assert.equal(t.efectivoCents, 1250);
  assert.equal(t.yapeCents, 800);
  assert.equal(t.count, 2);
  assert.equal(t.voidedCount, 1);
});

test('anular resta del total y no se anula dos veces', () => {
  const a = createSale({ amountCents: 1000, method: 'efectivo' }, now, 'a');
  const v = voidSale(a, now);
  assert.equal(dayTotals([v], day).totalCents, 0);
  assert.throws(() => voidSale(v, now), (e: unknown) => e instanceof DomainError && e.code === 'YA_ANULADA');
});

test('ventas de otro día no cuentan', () => {
  const old = createSale({ amountCents: 1000, method: 'efectivo' }, new Date(2026, 9, 29, 10), 'o');
  assert.equal(dayTotals([old], day).totalCents, 0);
});

test('sortRecent pone la más nueva primero', () => {
  const a = createSale({ amountCents: 100, method: 'yape' }, new Date(2026, 9, 30, 9), 'a');
  const b = createSale({ amountCents: 100, method: 'yape' }, new Date(2026, 9, 30, 11), 'b');
  assert.deepEqual(sortRecent([a, b]).map((s) => s.id), ['b', 'a']);
});
