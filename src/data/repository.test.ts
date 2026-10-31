import { test } from 'node:test';
import assert from 'node:assert/strict';
import { InMemorySalesRepository, LocalStorageSalesRepository } from './repository.ts';
import { createSale, voidSale } from '../domain/sale.ts';

for (const [name, make] of [
  ['memoria', () => new InMemorySalesRepository()],
  ['localStorage (sin localStorage disponible)', () => new LocalStorageSalesRepository()],
] as const) {
  test(`repositorio ${name}: agrega, lista y actualiza`, async () => {
    const repo = make();
    const s = createSale({ amountCents: 500, method: 'yape' }, new Date(), 'x');
    await repo.add(s);
    assert.equal((await repo.list()).length, 1);
    await repo.update(voidSale(s));
    assert.equal((await repo.list())[0].status, 'anulada');
  });
}
