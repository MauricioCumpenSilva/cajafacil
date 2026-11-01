import { test } from 'node:test';
import assert from 'node:assert/strict';
import { periodTotals } from './balance.ts';
import { createSale, formatClock, voidSale } from './sale.ts';

const now = new Date(2026, 9, 30, 18, 0); // 30 oct 2026
const daysAgo = (n: number, h = 10) => new Date(2026, 9, 30 - n, h, 0);
const sale = (n: number, cents: number, method: 'efectivo' | 'yape' = 'efectivo') =>
  createSale({ amountCents: cents, method }, daysAgo(n), `s${n}-${cents}`);

const sales = [sale(0, 1000), sale(0, 500, 'yape'), sale(3, 2000), sale(10, 4000), sale(20, 8000), sale(45, 16000)];

test('Hoy solo cuenta las de hoy', () => {
  const t = periodTotals(sales, 'hoy', now);
  assert.equal(t.totalCents, 1500);
  assert.equal(t.efectivoCents, 1000);
  assert.equal(t.yapeCents, 500);
});

test('Semana incluye hoy y los 6 días anteriores', () => {
  assert.equal(periodTotals(sales, 'semana', now).totalCents, 3500);
});

test('Quincena: últimos 15 días', () => {
  assert.equal(periodTotals(sales, 'quincena', now).totalCents, 7500);
});

test('Mes: últimos 30 días y excluye lo anterior', () => {
  assert.equal(periodTotals(sales, 'mes', now).totalCents, 15500);
});

test('el borde del periodo: hace 6 días entra en Semana y hace 7 no', () => {
  const s = [sale(6, 100), sale(7, 200)];
  assert.equal(periodTotals(s, 'semana', now).totalCents, 100);
});

test('anuladas se cuentan aparte y no suman', () => {
  const v = voidSale(sale(0, 900), now);
  const t = periodTotals([v, sale(0, 100)], 'hoy', now);
  assert.equal(t.totalCents, 100);
  assert.equal(t.voidedCount, 1);
});

test('periodo en cruce de mes (1 de noviembre)', () => {
  const nov = new Date(2026, 10, 1, 9, 0);
  const s = [createSale({ amountCents: 300, method: 'yape' }, new Date(2026, 9, 31, 20, 0), 'a')];
  assert.equal(periodTotals(s, 'hoy', nov).totalCents, 0);
  assert.equal(periodTotals(s, 'semana', nov).totalCents, 300);
});

test('hora local con ceros', () => {
  assert.equal(formatClock(new Date(2026, 9, 30, 9, 5).toISOString()), '09:05');
});
