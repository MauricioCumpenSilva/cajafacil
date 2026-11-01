import type { Cents } from './money.ts';
import { DomainError } from './errors.ts';

export type PaymentMethod = 'efectivo' | 'yape' | 'fiado';
export const METHOD_LABEL = { efectivo: 'Efectivo', yape: 'Yape / Plin', fiado: 'Fiado' } as const;
export type CollectMethod = 'efectivo' | 'yape';
export type SaleStatus = 'guardada' | 'anulada';

export interface Sale {
  id: string;
  amountCents: Cents;
  method: PaymentMethod;
  status: SaleStatus;
  createdAt: string; // ISO
  paidCents?: Cents; // solo efectivo
  changeCents?: Cents; // vuelto, solo efectivo
  customerId?: string; // solo fiado
  voidedAt?: string;
  collectedAt?: string; // solo fiado: cuándo se cobró
  collectedMethod?: CollectMethod; // solo fiado: cómo pagó el cliente
}

export interface NewSaleInput {
  amountCents: Cents;
  method: PaymentMethod;
  paidCents?: Cents;
  customerId?: string;
}

export function newId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  return c?.randomUUID ? c.randomUUID() : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createSale(input: NewSaleInput, now: Date = new Date(), id: string = newId()): Sale {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) throw new DomainError('MONTO_INVALIDO');
  const base: Sale = { id, amountCents: input.amountCents, method: input.method, status: 'guardada', createdAt: now.toISOString() };
  if (input.method === 'efectivo') {
    const paid = input.paidCents ?? input.amountCents;
    if (paid < input.amountCents) throw new DomainError('PAGO_INSUFICIENTE');
    return { ...base, paidCents: paid, changeCents: paid - input.amountCents };
  }
  if (input.method === 'fiado') {
    if (!input.customerId) throw new DomainError('FIADO_SIN_CLIENTE');
    return { ...base, customerId: input.customerId };
  }
  return base;
}

export function voidSale(sale: Sale, now: Date = new Date()): Sale {
  if (sale.status === 'anulada') throw new DomainError('YA_ANULADA');
  return { ...sale, status: 'anulada', voidedAt: now.toISOString() };
}

/** Clave de día local "YYYY-MM-DD" (no UTC, para que "hoy" coincida con el reloj del puesto). */
export function localDayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export interface DayTotals {
  totalCents: Cents; // efectivo + Yape/Plin guardado; el fiado NO suma hasta cobrarse
  efectivoCents: Cents;
  yapeCents: Cents;
  count: number;
  voidedCount: number;
}

/**
 * Suma lo cobrado. `inRange` decide si una fecha cuenta.
 * Un fiado suma el día en que se COBRA (con la forma en que pagó), nunca el día que se anotó.
 */
function accumulate(sales: readonly Sale[], inRange: (iso: string) => boolean): DayTotals {
  const t: DayTotals = { totalCents: 0, efectivoCents: 0, yapeCents: 0, count: 0, voidedCount: 0 };
  const add = (method: CollectMethod, cents: Cents) => {
    t.count += 1;
    t.totalCents += cents;
    if (method === 'efectivo') t.efectivoCents += cents;
    else t.yapeCents += cents;
  };
  for (const s of sales) {
    if (s.status === 'anulada') { if (inRange(s.createdAt)) t.voidedCount += 1; continue; }
    if (s.method === 'fiado') {
      if (s.collectedAt && s.collectedMethod && inRange(s.collectedAt)) add(s.collectedMethod, s.amountCents);
      continue;
    }
    if (inRange(s.createdAt)) add(s.method, s.amountCents);
  }
  return t;
}

export function dayTotals(sales: readonly Sale[], day: string): DayTotals {
  return accumulate(sales, (iso) => localDayKey(new Date(iso)) === day);
}

/** Totales de los últimos `days` días, contando hoy (1 = solo hoy). */
export function rangeTotals(sales: readonly Sale[], days: number, now: Date): DayTotals {
  const start = localDayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1)));
  const end = localDayKey(now);
  return accumulate(sales, (iso) => { const k = localDayKey(new Date(iso)); return k >= start && k <= end; });
}

/** Marca un fiado como cobrado. Desde ese momento suma a lo cobrado. */
export function collectSale(sale: Sale, method: CollectMethod, now: Date = new Date()): Sale {
  if (sale.method !== 'fiado') throw new DomainError('NO_ES_FIADO');
  if (sale.status === 'anulada') throw new DomainError('YA_ANULADA');
  if (sale.collectedAt) throw new DomainError('YA_COBRADO');
  if (method !== 'efectivo' && method !== 'yape') throw new DomainError('COBRO_INVALIDO');
  return { ...sale, collectedAt: now.toISOString(), collectedMethod: method };
}

/** Fiados que todavía se deben (guardados y sin cobrar), los más antiguos primero. */
export function pendingFiados(sales: readonly Sale[]): Sale[] {
  return sales
    .filter((s) => s.method === 'fiado' && s.status === 'guardada' && !s.collectedAt)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

export interface Debt { customerId: string; totalCents: Cents; count: number }

/** Deuda por cliente; solo clientes que deben algo. Mayor deuda primero. */
export function debtByCustomer(sales: readonly Sale[]): Debt[] {
  const map = new Map<string, Debt>();
  for (const s of pendingFiados(sales)) {
    if (!s.customerId) continue;
    const d = map.get(s.customerId) ?? { customerId: s.customerId, totalCents: 0, count: 0 };
    d.totalCents += s.amountCents;
    d.count += 1;
    map.set(s.customerId, d);
  }
  return [...map.values()].sort((a, b) => b.totalCents - a.totalCents);
}

/** Último momento en que la venta cambió (creada, anulada o cobrada). */
export function lastActivity(s: Sale): string {
  return [s.createdAt, s.voidedAt, s.collectedAt].filter((x): x is string => !!x).sort().at(-1) ?? s.createdAt;
}

/** Hora local "15:12". */
export function formatClock(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Más recientes primero. */
export function sortRecent(sales: readonly Sale[]): Sale[] {
  return [...sales].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
