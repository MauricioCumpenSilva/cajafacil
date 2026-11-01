import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attemptLogin } from './account.ts';
import type { Account } from './account.ts';
import { initialLockout, isLocked, lockDurationMs, registerFailure, remainingMs, attemptsLeft } from './lockout.ts';

const acc: Account = { name: 'Flor', phone: '987654321', pin: '123456', avatar: 'bodeguera' };
const T0 = 1_000_000;

test('duración del bloqueo crece y tiene tope de 5 minutos', () => {
  assert.equal(lockDurationMs(2), 0);
  assert.equal(lockDurationMs(3), 30_000);
  assert.equal(lockDurationMs(6), 60_000);
  assert.equal(lockDurationMs(9), 120_000);
  assert.equal(lockDurationMs(12), 240_000);
  assert.equal(lockDurationMs(15), 300_000);
  assert.equal(lockDurationMs(60), 300_000);
});

test('los dos primeros errores avisan cuántos intentos quedan', () => {
  const a = attemptLogin(acc, initialLockout, '987654321', '000000', T0);
  assert.equal(a.result.ok, false);
  assert.match(a.result.ok ? '' : a.result.message, /Te quedan 2 intentos/);
  const b = attemptLogin(acc, a.lockout, '987654321', '000000', T0 + 1000);
  assert.match(b.result.ok ? '' : b.result.message, /Te queda 1 intento/);
  assert.equal(isLocked(b.lockout, T0 + 1000), false);
});

test('el tercer error bloquea 30 segundos y la clave correcta tampoco entra', () => {
  let l = initialLockout;
  for (let i = 0; i < 3; i++) l = attemptLogin(acc, l, '987654321', '000000', T0).lockout;
  assert.equal(isLocked(l, T0), true);
  assert.equal(remainingMs(l, T0), 30_000);
  const during = attemptLogin(acc, l, '987654321', '123456', T0 + 10_000);
  assert.equal(during.result.ok, false);
  if (!during.result.ok) {
    assert.equal(during.result.reason, 'bloqueado');
    assert.match(during.result.message, /20 segundos/);
  }
});

test('pasado el tiempo se puede entrar y el contador se reinicia', () => {
  let l = initialLockout;
  for (let i = 0; i < 3; i++) l = attemptLogin(acc, l, '987654321', '000000', T0).lockout;
  const ok = attemptLogin(acc, l, '987654321', '123456', T0 + 30_001);
  assert.equal(ok.result.ok, true);
  assert.deepEqual(ok.lockout, initialLockout);
});

test('equivocarse otra vez tras el bloqueo: siguiente ronda de 60 s', () => {
  let l = initialLockout;
  for (let i = 0; i < 3; i++) l = attemptLogin(acc, l, '987654321', '000000', T0).lockout;
  const t1 = T0 + 31_000;
  assert.equal(attemptsLeft(l), 3);
  for (let i = 0; i < 3; i++) l = attemptLogin(acc, l, '987654321', '000000', t1).lockout;
  assert.equal(remainingMs(l, t1), 60_000);
});

test('sin cuenta creada no suma intentos fallidos', () => {
  const r = attemptLogin(null, initialLockout, '987654321', '123456', T0);
  assert.equal(r.result.ok, false);
  assert.equal(r.lockout.failures, 0);
});

test('registerFailure no baja el bloqueo vigente en fallos intermedios', () => {
  const l = registerFailure(registerFailure(registerFailure(initialLockout, T0), T0), T0);
  assert.equal(l.lockedUntil, T0 + 30_000);
});
