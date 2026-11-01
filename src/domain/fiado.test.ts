import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectSale, createSale, dayTotals, debtByCustomer, lastActivity, localDayKey, pendingFiados, voidSale } from './sale.ts';
import { periodTotals } from './balance.ts';
import { backupLabel, isValidBackup, pendingBackupCount } from './backup.ts';

const mon = new Date(2026, 9, 26, 10, 0);
const wed = new Date(2026, 9, 28, 16, 30);
const fiado = (id: string, cents: number, cust = 'luis', at = mon) => createSale({ amountCents: cents, method: 'fiado', customerId: cust }, at, id);

test('un fiado pendiente no suma; al cobrarse suma el día del cobro, con la forma en que pagó', () => {
  const f = fiado('f1', 2000);
  assert.equal(dayTotals([f], localDayKey(mon)).totalCents, 0);
  const paid = collectSale(f, 'yape', wed);
  assert.equal(dayTotals([paid], localDayKey(mon)).totalCents, 0, 'el día que se anotó sigue en 0');
  const t = dayTotals([paid], localDayKey(wed));
  assert.equal(t.totalCents, 2000);
  assert.equal(t.yapeCents, 2000);
  assert.equal(t.efectivoCents, 0);
  assert.equal(t.count, 1);
});

test('el balance de la semana cuenta el cobro, no la fecha en que se fió', () => {
  const now = new Date(2026, 9, 30, 12, 0);
  const paid = collectSale(fiado('f2', 1500, 'carmen', new Date(2026, 9, 1, 9, 0)), 'efectivo', new Date(2026, 9, 29, 9, 0));
  assert.equal(periodTotals([paid], 'semana', now).efectivoCents, 1500);
  assert.equal(periodTotals([paid], 'hoy', now).totalCents, 0);
});

test('no se cobra dos veces, ni algo que no es fiado, ni algo anulado', () => {
  const f = fiado('f3', 500);
  const paid = collectSale(f, 'efectivo');
  assert.throws(() => collectSale(paid, 'yape'), /ya fue cobrado/);
  assert.throws(() => collectSale(createSale({ amountCents: 500, method: 'yape' }), 'efectivo'), /no es un fiado/);
  assert.throws(() => collectSale(voidSale(f), 'efectivo'), /anulada/);
  assert.throws(() => collectSale(f, 'fiado' as never), /Elige cómo/);
});

test('deuda por cliente: ignora cobrados y anulados; mayor deuda primero', () => {
  const list = [
    fiado('a', 1000, 'luis'), fiado('b', 500, 'luis'), fiado('c', 3000, 'carmen'),
    collectSale(fiado('d', 9000, 'luis'), 'yape'), voidSale(fiado('e', 7000, 'carmen')),
  ];
  assert.equal(pendingFiados(list).length, 3);
  const d = debtByCustomer(list);
  assert.deepEqual(d.map((x) => [x.customerId, x.totalCents, x.count]), [['carmen', 3000, 1], ['luis', 1500, 2]]);
});

test('lastActivity toma el momento más reciente', () => {
  const f = collectSale(fiado('g', 100), 'efectivo', wed);
  assert.equal(lastActivity(f), wed.toISOString());
  assert.equal(lastActivity(voidSale(fiado('h', 100), wed)), wed.toISOString());
});

test('respaldo: pendientes según el último respaldo', () => {
  const s1 = createSale({ amountCents: 100, method: 'yape' }, new Date(2026, 9, 28, 9, 0), 'x1');
  const s2 = createSale({ amountCents: 200, method: 'yape' }, new Date(2026, 9, 28, 11, 0), 'x2');
  assert.equal(pendingBackupCount([s1, s2], { lastBackupAt: null }), 2);
  assert.equal(pendingBackupCount([s1, s2], { lastBackupAt: new Date(2026, 9, 28, 10, 0).toISOString() }), 1);
  const after = new Date(2026, 9, 28, 12, 0).toISOString();
  assert.equal(pendingBackupCount([s1, s2], { lastBackupAt: after }), 0);
  // anular una venta ya respaldada vuelve a dejarla pendiente
  assert.equal(pendingBackupCount([voidSale(s1, new Date(2026, 9, 28, 13, 0)), s2], { lastBackupAt: after }), 1);
});

test('textos de respaldo claros con y sin internet', () => {
  assert.equal(backupLabel(0, true, null), 'Aún no hay ventas que respaldar');
  assert.equal(backupLabel(0, true, 'x'), 'Todo respaldado');
  assert.equal(backupLabel(1, true, null), '1 venta por respaldar');
  assert.match(backupLabel(3, false, null), /3 ventas por respaldar · se respaldará cuando vuelva internet/);
});

test('validación del respaldo guardado', () => {
  assert.equal(isValidBackup({ lastBackupAt: null }), true);
  assert.equal(isValidBackup({ lastBackupAt: new Date().toISOString() }), true);
  assert.equal(isValidBackup({ lastBackupAt: 'basura' }), false);
  assert.equal(isValidBackup(null), false);
  assert.equal(isValidBackup({}), false);
});
