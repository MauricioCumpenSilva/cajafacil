import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkLogin, validateCode, validateName, validatePhone, validatePin } from './account.ts';
import type { Account } from './account.ts';

const acc: Account = { name: 'Flor', phone: '987654321', pin: '123456', avatar: 'bodeguera' };

test('nombre: mínimo 2 letras', () => {
  assert.notEqual(validateName(' a '), null);
  assert.equal(validateName('Flor'), null);
});

test('celular: 9 números empezando con 9, acepta espacios', () => {
  assert.equal(validatePhone('987 654 321'), null);
  assert.notEqual(validatePhone('87654321'), null);
  assert.notEqual(validatePhone('187654321'), null);
});

test('código de demostración 123456', () => {
  assert.equal(validateCode('123 456'), null);
  assert.notEqual(validateCode('111111'), null);
});

test('clave: exactamente 6 números', () => {
  assert.equal(validatePin('123456'), null);
  assert.notEqual(validatePin('12345'), null);
  assert.notEqual(validatePin('12345a'), null);
});

test('Ya tengo cuenta: sin cuenta creada no entra', () => {
  const r = checkLogin(null, '987654321', '123456');
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.reason, 'sin-cuenta');
});

test('login correcto y con datos errados', () => {
  assert.equal(checkLogin(acc, '987 654 321', '123456').ok, true);
  const bad = checkLogin(acc, '987654321', '000000');
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.equal(bad.reason, 'datos-incorrectos');
});
