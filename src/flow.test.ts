import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcReducer, initialCalc, totalCents } from './domain/calculator.ts';
import type { CalcAction } from './domain/calculator.ts';
import { attemptLogin, DEMO_CODE, validateCode, validatePhone, validatePin } from './domain/account.ts';
import type { Account } from './domain/account.ts';
import { initialLockout, remainingMs } from './domain/lockout.ts';
import { createSale, dayTotals, localDayKey, voidSale } from './domain/sale.ts';
import { paymentStatus } from './domain/payment.ts';
import { periodTotals } from './domain/balance.ts';
import { InMemorySalesRepository } from './data/repository.ts';
import { InMemoryAccountRepository } from './data/accountRepository.ts';
import { formatSoles } from './domain/money.ts';

const keys = (...a: CalcAction[]) => a.reduce(calcReducer, initialCalc);
const d = (n: number): CalcAction => ({ type: 'digit', digit: n });

test('recorrido completo: cuenta → clave errada → espera → entrar → ventas → anular → balance', async () => {
  // 1. Crear cuenta (simulada)
  assert.equal(validatePhone('987654321'), null);
  assert.equal(validateCode(DEMO_CODE), null);
  assert.equal(validatePin('123456'), null);
  const accounts = new InMemoryAccountRepository();
  const account: Account = { name: 'Flor', phone: '987654321', pin: '123456', avatar: 'bodeguera' };
  accounts.save(account);

  // 2. Tres claves equivocadas → bloqueo de 30 s
  const t0 = new Date(2026, 9, 30, 8, 0, 0).getTime();
  let lock = accounts.loadLockout();
  for (let i = 0; i < 3; i++) {
    const r = attemptLogin(accounts.load(), lock, '987654321', '111111', t0 + i * 1000);
    lock = r.lockout;
    accounts.saveLockout(lock);
  }
  assert.equal(remainingMs(lock, t0 + 2000), 30_000);
  // aunque ponga la clave correcta durante la espera, no entra
  assert.equal(attemptLogin(accounts.load(), lock, '987654321', '123456', t0 + 5000).result.ok, false);
  // 3. Pasada la espera, entra y el contador se reinicia
  const ok = attemptLogin(accounts.load(), lock, '987654321', '123456', t0 + 33_000);
  assert.equal(ok.result.ok, true);
  assert.deepEqual(ok.lockout, initialLockout);

  // 4. Venta 1: S/ 7.50 en efectivo, paga con S/ 10 → vuelto 2.50
  const total1 = totalCents(keys(d(7), { type: 'dot' }, d(5)));
  assert.equal(total1, 750);
  const st = paymentStatus(total1, 1000);
  assert.deepEqual(st, { kind: 'ok', changeCents: 250 });
  const day = new Date(2026, 9, 30, 9, 0);
  const repo = new InMemorySalesRepository();
  const s1 = createSale({ amountCents: total1, method: 'efectivo', paidCents: 1000 }, day, 's1');
  await repo.add(s1);
  assert.equal(s1.changeCents, 250);

  // 5. Venta 2: atajos 5 + 2.50 = 7.50 por Yape
  const total2 = totalCents(keys({ type: 'preset', cents: 500 }, { type: 'preset', cents: 250 }));
  assert.equal(total2, 750);
  await repo.add(createSale({ amountCents: total2, method: 'yape' }, day, 's2'));

  // 6. Venta 3: fiado S/ 20 (no suma)
  await repo.add(createSale({ amountCents: 2000, method: 'fiado', customerId: 'luis' }, day, 's3'));

  // 7. Venta 4 se anula
  const s4 = createSale({ amountCents: 900, method: 'yape' }, day, 's4');
  await repo.add(s4);
  await repo.update(voidSale(s4, day));

  const all = await repo.list();
  const t = dayTotals(all, localDayKey(day));
  assert.equal(t.totalCents, 1500);
  assert.equal(t.efectivoCents, 750);
  assert.equal(t.yapeCents, 750);
  assert.equal(t.count, 2);
  assert.equal(t.voidedCount, 1);
  assert.equal(formatSoles(t.totalCents), 'S/ 15.00');

  // 8. Balance semanal incluye lo mismo
  assert.equal(periodTotals(all, 'semana', new Date(2026, 9, 30, 18, 0)).totalCents, 1500);
});

test('una venta de S/ 0 o con pago insuficiente se rechaza', () => {
  assert.throws(() => createSale({ amountCents: 0, method: 'yape' }));
  assert.throws(() => createSale({ amountCents: 1000, method: 'efectivo', paidCents: 500 }));
  assert.throws(() => createSale({ amountCents: 1000, method: 'fiado' }));
});
