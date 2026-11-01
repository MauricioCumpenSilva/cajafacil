import type { DayTotals, Sale } from './sale.ts';
import { rangeTotals } from './sale.ts';

export type Period = 'hoy' | 'semana' | 'quincena' | 'mes';

export const PERIODS: readonly { id: Period; label: string; days: number; hint: string }[] = [
  { id: 'hoy', label: 'Hoy', days: 1, hint: 'Hoy' },
  { id: 'semana', label: 'Semana', days: 7, hint: 'Últimos 7 días' },
  { id: 'quincena', label: 'Quincena', days: 15, hint: 'Últimos 15 días' },
  { id: 'mes', label: 'Mes', days: 30, hint: 'Últimos 30 días' },
];

export function periodTotals(sales: readonly Sale[], period: Period, now: Date): DayTotals {
  const p = PERIODS.find((x) => x.id === period) ?? PERIODS[0];
  return rangeTotals(sales, p.days, now);
}
