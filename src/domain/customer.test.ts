import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_CUSTOMERS, SEED_CUSTOMERS, addCustomer, isValidCustomerList, nameKey, normalizeName, validateCustomerName } from './customer.ts';
import { InMemoryCustomerRepository, LocalStorageCustomerRepository } from '../data/customerRepository.ts';

test('se puede agregar un cliente con cualquier nombre válido', () => {
  const r = addCustomer(SEED_CUSTOMERS, '  doña   Rosa ', () => 'c1');
  assert.equal(r.ok, true);
  if (r.ok) { assert.equal(r.customer.name, 'doña Rosa'); assert.equal(r.list.length, 3); assert.equal(SEED_CUSTOMERS.length, 2); }
});

test('nombres aceptados: tildes, ñ, números, punto y guion', () => {
  for (const n of ['Peña', 'Don José', 'Tienda 2', 'M. Torres', "O'Brien", 'Ana-Lucía']) assert.equal(validateCustomerName(n, []), null, n);
});

test('nombres rechazados con mensaje claro', () => {
  assert.match(validateCustomerName('', []) ?? '', /nombre del cliente/);
  assert.match(validateCustomerName(' a ', []) ?? '', /mínimo 2/);
  assert.match(validateCustomerName('x'.repeat(31), []) ?? '', /muy largo/);
  assert.match(validateCustomerName('Luis <script>', []) ?? '', /letras y números/);
  assert.match(validateCustomerName('😀😀', []) ?? '', /letras y números/);
});

test('no permite duplicados aunque cambien mayúsculas, tildes o espacios', () => {
  assert.match(validateCustomerName('LUIS', SEED_CUSTOMERS) ?? '', /Ya tienes/);
  assert.match(validateCustomerName('  carmen ', SEED_CUSTOMERS) ?? '', /Ya tienes/);
  assert.equal(nameKey('Peña'), nameKey('pena'));
  assert.equal(normalizeName('  a   b '), 'a b');
});

test('tope de clientes', () => {
  const many = Array.from({ length: MAX_CUSTOMERS }, (_, i) => ({ id: String(i), name: `Cliente ${i}` }));
  assert.match(validateCustomerName('Otro', many) ?? '', /muchos clientes/);
});

test('lista guardada: valida forma e ids repetidos', () => {
  assert.equal(isValidCustomerList([{ id: 'a', name: 'Ana' }]), true);
  assert.equal(isValidCustomerList([{ id: 'a', name: 'Ana' }, { id: 'a', name: 'Beto' }]), false);
  assert.equal(isValidCustomerList([{ id: '', name: 'Ana' }]), false);
  assert.equal(isValidCustomerList([{ id: 'a', name: '  ' }]), false);
  assert.equal(isValidCustomerList('x'), false);
  assert.equal(isValidCustomerList([null]), false);
});

test('repositorio en memoria arranca con los clientes de ejemplo y guarda nuevos', () => {
  const repo = new InMemoryCustomerRepository();
  assert.equal(repo.load().length, 2);
  repo.save([...repo.load(), { id: 'n', name: 'Nuevo' }]);
  assert.equal(repo.load().length, 3);
});

test('repositorio local: persiste, y datos dañados vuelven a los de ejemplo', () => {
  const data = new Map<string, string>();
  const fake = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); } };
  Object.defineProperty(globalThis, 'localStorage', { value: fake, configurable: true, writable: true });
  try {
    new LocalStorageCustomerRepository().save([{ id: 'z', name: 'Zoila' }]);
    assert.deepEqual(new LocalStorageCustomerRepository().load(), [{ id: 'z', name: 'Zoila' }]);
    data.set('cajafacil.customers.v1', '{roto');
    assert.equal(new LocalStorageCustomerRepository().load().length, 2);
    data.set('cajafacil.customers.v1', '[{"id":1}]');
    assert.equal(new LocalStorageCustomerRepository().load().length, 2);
  } finally { Object.defineProperty(globalThis, 'localStorage', { value: undefined, configurable: true, writable: true }); }
});
