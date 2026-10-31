import type { Cents } from './money.ts';
import { MAX_SALE_CENTS, sumCents } from './money.ts';

/**
 * Calculadora de monto de venta como reductor puro.
 * - Se escribe un número con teclado (hasta 5 enteros y 2 decimales).
 * - Los atajos (1, 1.50, 2.50, 5, 10) y el botón + agregan sumandos.
 * - El total es la suma de los sumandos más lo que se está escribiendo.
 */
export interface CalcState {
  int: string; // dígitos enteros escritos ('' = ninguno)
  dec: string; // hasta 2 decimales
  hasDot: boolean;
  parts: Cents[]; // sumandos ya confirmados (atajos o +)
}

export type CalcAction =
  | { type: 'digit'; digit: number }
  | { type: 'dot' }
  | { type: 'backspace' }
  | { type: 'preset'; cents: Cents }
  | { type: 'plus' }
  | { type: 'clear' };

export const MAX_INT_DIGITS = 5;
export const MAX_DEC_DIGITS = 2;

export const initialCalc: CalcState = { int: '', dec: '', hasDot: false, parts: [] };

export function entryCents(s: CalcState): Cents {
  const whole = s.int === '' ? 0 : parseInt(s.int, 10);
  const frac = s.dec === '' ? 0 : parseInt(s.dec.padEnd(MAX_DEC_DIGITS, '0'), 10);
  return whole * 100 + frac;
}

export function totalCents(s: CalcState): Cents {
  return Math.min(MAX_SALE_CENTS, sumCents(s.parts) + entryCents(s));
}

/** Texto de lo que se está escribiendo ahora, p. ej. "12.5". */
export function entryText(s: CalcState): string {
  const whole = s.int === '' ? '0' : s.int;
  return s.hasDot ? `${whole}.${s.dec}` : whole;
}

export function canContinue(s: CalcState): boolean {
  return totalCents(s) > 0;
}

export function calcReducer(s: CalcState, a: CalcAction): CalcState {
  switch (a.type) {
    case 'digit': {
      const d = String(a.digit);
      if (s.hasDot) {
        return s.dec.length < MAX_DEC_DIGITS ? { ...s, dec: s.dec + d } : s;
      }
      if (s.int === '' || s.int === '0') return { ...s, int: d };
      return s.int.length < MAX_INT_DIGITS ? { ...s, int: s.int + d } : s;
    }
    case 'dot':
      if (s.hasDot) return s;
      return { ...s, hasDot: true, int: s.int === '' ? '0' : s.int };
    case 'backspace':
      if (s.hasDot) {
        return s.dec.length > 0 ? { ...s, dec: s.dec.slice(0, -1) } : { ...s, hasDot: false };
      }
      if (s.int.length > 0) return { ...s, int: s.int.slice(0, -1) };
      if (s.parts.length > 0) return { ...s, parts: s.parts.slice(0, -1) };
      return s;
    case 'preset':
      return { ...s, parts: [...s.parts, a.cents] };
    case 'plus': {
      const cur = entryCents(s);
      if (cur === 0) return s;
      return { int: '', dec: '', hasDot: false, parts: [...s.parts, cur] };
    }
    case 'clear':
      return initialCalc;
  }
}
