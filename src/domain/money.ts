/** Todos los montos se guardan como enteros en céntimos (S/ 7.50 = 750). */
export type Cents = number;

export const MAX_SALE_CENTS: Cents = 9_999_999; // S/ 99,999.99

export function formatSoles(cents: Cents): string {
  const abs = Math.abs(Math.round(cents));
  const [int, dec] = (abs / 100).toFixed(2).split('.');
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${cents < 0 ? '-' : ''}S/ ${withCommas}.${dec}`;
}

export function sumCents(list: readonly Cents[]): Cents {
  return list.reduce((a, b) => a + b, 0);
}
