import { formatSoles } from './money.ts';
import type { Cents } from './money.ts';

export type GreetingKind = 'primera-vez-hoy' | 'de-regreso';
export interface Greeting { kind: GreetingKind; bubble: string }

/** Primer nombre: "Flor María Pérez" → "Flor". */
export const firstName = (full: string): string => full.trim().split(/\s+/)[0] ?? '';

/** Saludo fijo de la pantalla principal. */
export const helloTitle = (name: string): string => `Hola, ${firstName(name)}`;

/**
 * Mensaje del globo de bienvenida.
 * - Primera vez del día (o primera vez que abre la app): invita a registrar la nueva venta.
 * - Si vuelve a abrir la app el mismo día: "Hola de nuevo" y lo anima a seguir, con lo que lleva hoy.
 */
export function buildGreeting(a: { name: string; lastVisitDay: string | null; today: string; salesToday: number; totalCents: Cents }): Greeting {
  const n = firstName(a.name);
  if (a.lastVisitDay !== a.today) {
    return { kind: 'primera-vez-hoy', bubble: `¡Hola, ${n}! Lista para registrar tu nueva venta.` };
  }
  const resumen = a.salesToday > 0
    ? ` Hoy llevas ${formatSoles(a.totalCents)} en ${a.salesToday} ${a.salesToday === 1 ? 'venta' : 'ventas'}.`
    : '';
  return { kind: 'de-regreso', bubble: `¡Hola de nuevo, ${n}! Sigue registrando tus ventas.${resumen}` };
}
