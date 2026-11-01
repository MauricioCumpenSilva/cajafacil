import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalStorageSalesRepository } from './repository.ts';
import { LocalStorageAccountRepository } from './accountRepository.ts';
import { createSale } from '../domain/sale.ts';
import { registerFailure, initialLockout } from '../domain/lockout.ts';

type Fake = { getItem(k: string): string | null; setItem(k: string, v: string): void };

function install(fake: Fake) {
  Object.defineProperty(globalThis, 'localStorage', { value: fake, configurable: true, writable: true });
}
function uninstall() {
  Object.defineProperty(globalThis, 'localStorage', { value: undefined, configurable: true, writable: true });
}
function memoryStorage(): Fake & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => { data.set(k, v); } };
}

test('las ventas sobreviven a cerrar y abrir la app (otra instancia)', async () => {
  const st = memoryStorage(); install(st);
  try {
    await new LocalStorageSalesRepository().add(createSale({ amountCents: 750, method: 'yape' }, new Date(), 'a'));
    const reopened = await new LocalStorageSalesRepository().list();
    assert.equal(reopened.length, 1);
    assert.equal(reopened[0].amountCents, 750);
  } finally { uninstall(); }
});

test('datos dañados en el almacenamiento no rompen la app', async () => {
  const st = memoryStorage(); install(st);
  st.data.set('cajafacil.sales.v1', '{esto no es json');
  st.data.set('cajafacil.account.v1', '[[[');
  st.data.set('cajafacil.lockout.v1', '{"failures":"x"}');
  try {
    assert.deepEqual(await new LocalStorageSalesRepository().list(), []);
    const acc = new LocalStorageAccountRepository();
    assert.equal(acc.load(), null);
    assert.deepEqual(acc.loadLockout(), initialLockout);
  } finally { uninstall(); }
});

test('si el almacenamiento está lleno o bloqueado, la app sigue en memoria', async () => {
  install({ getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } });
  try {
    const repo = new LocalStorageSalesRepository();
    await repo.add(createSale({ amountCents: 100, method: 'yape' }, new Date(), 'a'));
    assert.equal((await repo.list()).length, 1);
  } finally { uninstall(); }
});

test('el bloqueo por clave errada sobrevive a recargar la página', () => {
  const st = memoryStorage(); install(st);
  try {
    const now = 5_000_000;
    let l = initialLockout;
    for (let i = 0; i < 3; i++) l = registerFailure(l, now);
    new LocalStorageAccountRepository().saveLockout(l);
    const after = new LocalStorageAccountRepository().loadLockout();
    assert.equal(after.failures, 3);
    assert.equal(after.lockedUntil, now + 30_000);
  } finally { uninstall(); }
});
