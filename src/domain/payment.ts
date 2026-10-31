import type { Cents } from './money.ts';

export type PaymentStatus =
  | { kind: 'sin-elegir' }
  | { kind: 'falta'; missingCents: Cents }
  | { kind: 'ok'; changeCents: Cents };

/** Billetes que el cliente suele entregar (S/ 10, 20, 50, 100). "Justo" se calcula aparte. */
export const PAID_CHIPS_CENTS = [1000, 2000, 5000, 10000] as const;

export function paymentStatus(totalCents: Cents, paidCents: Cents | null): PaymentStatus {
  if (paidCents === null) return { kind: 'sin-elegir' };
  if (paidCents < totalCents) return { kind: 'falta', missingCents: totalCents - paidCents };
  return { kind: 'ok', changeCents: paidCents - totalCents };
}
