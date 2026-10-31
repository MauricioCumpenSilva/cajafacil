import { test } from 'node:test';
import assert from 'node:assert/strict';
import { InMemoryAccountRepository, LocalStorageAccountRepository } from './accountRepository.ts';

for (const [name, make] of [
  ['memoria', () => new InMemoryAccountRepository()],
  ['localStorage (no disponible)', () => new LocalStorageAccountRepository()],
] as const) {
  test(`repositorio de cuenta ${name}`, () => {
    const repo = make();
    assert.equal(repo.load(), null);
    assert.equal(repo.isSignedIn(), false);
    repo.save({ name: 'Brian', phone: '912345678', pin: '654321', avatar: 'bodeguero' });
    repo.setSignedIn(true);
    assert.equal(repo.load()?.name, 'Brian');
    assert.equal(repo.isSignedIn(), true);
  });
}
