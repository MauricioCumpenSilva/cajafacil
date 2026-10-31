import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paymentStatus } from './payment.ts';

test('sin elegir con cuánto pagó', () => {
  assert.deepEqual(paymentStatus(750, null), { kind: 'sin-elegir' });
});
test('billete menor al total: falta', () => {
  assert.deepEqual(paymentStatus(1250, 1000), { kind: 'falta', missingCents: 250 });
});
test('paga justo: vuelto 0', () => {
  assert.deepEqual(paymentStatus(750, 750), { kind: 'ok', changeCents: 0 });
});
test('billete mayor: vuelto', () => {
  assert.deepEqual(paymentStatus(750, 1000), { kind: 'ok', changeCents: 250 });
});
