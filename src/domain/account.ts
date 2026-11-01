import type { LockoutState } from './lockout.ts';
import { attemptsLeft, initialLockout, isLocked, registerFailure, remainingMs, secondsLeft } from './lockout.ts';

export type Avatar = 'bodeguero' | 'bodeguera';

/** Cuenta SIMULADA (como en el PA2): se guarda en el dispositivo, sin servidor. */
export interface Account {
  name: string;
  phone: string;
  pin: string;
  avatar: Avatar;
}

export const DEMO_CODE = '123456';
export const PIN_LENGTH = 6;

export const digitsOnly = (s: string): string => s.replace(/\D/g, '');

export function validateName(raw: string): string | null {
  return raw.trim().length >= 2 ? null : 'Escribe tu nombre (mínimo 2 letras).';
}

export function validatePhone(raw: string): string | null {
  const d = digitsOnly(raw);
  return /^9\d{8}$/.test(d) ? null : 'Escribe tu celular de 9 números, empezando con 9.';
}

export function validateCode(raw: string): string | null {
  return digitsOnly(raw) === DEMO_CODE ? null : 'El código no coincide. Revisa los 6 números.';
}

export function validatePin(raw: string): string | null {
  return /^\d{6}$/.test(raw) ? null : `Tu clave debe tener ${PIN_LENGTH} números.`;
}

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: 'sin-cuenta' | 'datos-incorrectos' | 'bloqueado'; message: string; remainingMs?: number };

/** "Ya tengo cuenta" solo funciona si la cuenta fue creada y los datos coinciden. */
export function checkLogin(account: Account | null, phone: string, pin: string): LoginResult {
  if (!account) {
    return { ok: false, reason: 'sin-cuenta', message: 'Todavía no hay una cuenta en este celular. Toca "Crear mi cuenta".' };
  }
  if (digitsOnly(phone) !== account.phone || pin !== account.pin) {
    return { ok: false, reason: 'datos-incorrectos', message: 'El celular o la clave no son correctos. Revísalos e inténtalo de nuevo.' };
  }
  return { ok: true };
}

const waitMessage = (ms: number) => `Por seguridad, espera ${secondsLeft(ms)} segundos para volver a intentar.`;

/** Un intento de entrar, con bloqueo temporal. Devuelve el resultado y el nuevo estado de bloqueo. */
export function attemptLogin(
  account: Account | null, lockout: LockoutState, phone: string, pin: string, now: number,
): { result: LoginResult; lockout: LockoutState } {
  if (isLocked(lockout, now)) {
    const ms = remainingMs(lockout, now);
    return { result: { ok: false, reason: 'bloqueado', message: waitMessage(ms), remainingMs: ms }, lockout };
  }
  const r = checkLogin(account, phone, pin);
  if (r.ok) return { result: r, lockout: initialLockout };
  if (r.reason === 'sin-cuenta') return { result: r, lockout };

  const next = registerFailure(lockout, now);
  if (isLocked(next, now)) {
    const ms = remainingMs(next, now);
    return { result: { ok: false, reason: 'bloqueado', message: `La clave no es correcta. ${waitMessage(ms)}`, remainingMs: ms }, lockout: next };
  }
  const left = attemptsLeft(next);
  const tail = left === 1 ? 'Te queda 1 intento.' : `Te quedan ${left} intentos.`;
  return { result: { ok: false, reason: 'datos-incorrectos', message: `El celular o la clave no son correctos. ${tail}` }, lockout: next };
}
