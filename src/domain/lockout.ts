/**
 * Bloqueo temporal por claves equivocadas.
 * Cada 3 fallos seguidos se bloquea el acceso: 30 s, luego 60 s, 120 s, 240 s y 300 s como máximo.
 * Un acceso correcto reinicia la cuenta. Todo recibe la hora "now" para poder probarse.
 */
export interface LockoutState {
  failures: number;
  lockedUntil: number | null; // milisegundos desde 1970
}

export const initialLockout: LockoutState = { failures: 0, lockedUntil: null };

export const ATTEMPTS_PER_ROUND = 3;
export const BASE_LOCK_MS = 30_000;
export const MAX_LOCK_MS = 300_000;

export function lockDurationMs(failures: number): number {
  const rounds = Math.floor(failures / ATTEMPTS_PER_ROUND);
  if (rounds < 1) return 0;
  return Math.min(BASE_LOCK_MS * 2 ** (rounds - 1), MAX_LOCK_MS);
}

export function remainingMs(s: LockoutState, now: number): number {
  return s.lockedUntil === null ? 0 : Math.max(0, s.lockedUntil - now);
}

export function isLocked(s: LockoutState, now: number): boolean {
  return remainingMs(s, now) > 0;
}

export function registerFailure(s: LockoutState, now: number): LockoutState {
  const failures = s.failures + 1;
  const lockedUntil = failures % ATTEMPTS_PER_ROUND === 0 ? now + lockDurationMs(failures) : s.lockedUntil;
  return { failures, lockedUntil };
}

export function attemptsLeft(s: LockoutState): number {
  return ATTEMPTS_PER_ROUND - (s.failures % ATTEMPTS_PER_ROUND);
}

export const secondsLeft = (ms: number): number => Math.ceil(ms / 1000);

export function isValidLockout(x: unknown): x is LockoutState {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.failures === 'number' && Number.isInteger(o.failures) && o.failures >= 0 &&
    (o.lockedUntil === null || typeof o.lockedUntil === 'number');
}
