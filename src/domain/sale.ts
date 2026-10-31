import type { Cents } from './money.ts';
import { DomainError } from './errors.ts';

export type PaymentMethod = 'efectivo' | 'yape' | 'fiado';
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

export function dayTotals(sales: readonly Sale[], day: string): DayTotals {
  const t: DayTotals = { totalCents: 0, efectivoCents: 0, yapeCents: 0, count: 0, voidedCount: 0 };
  for (const s of sales) {
    if (localDayKey(new Date(s.createdAt)) !== day) continue;
    if (s.status === 'anulada') { t.voidedCount += 1; continue; }
    if (s.method === 'fiado') continue;
    t.count += 1;
    t.totalCents += s.amountCents;
    if (s.method === 'efectivo') t.efectivoCents += s.amountCents;
    else t.yapeCents += s.amountCents;
  }
  return t;
}

/** Más recientes primero. */
export function sortRecent(sales: readonly Sale[]): Sale[] {
  return [...sales].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
