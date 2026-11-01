import { newId } from './sale.ts';

export interface Customer { id: string; name: string }

/** Clientes con los que arranca la app; se pueden agregar los que haga falta. */
export const SEED_CUSTOMERS: readonly Customer[] = [
  { id: 'luis', name: 'Luis' },
  { id: 'carmen', name: 'Carmen' },
];

export const MAX_CUSTOMERS = 100;
export const MIN_NAME = 2;
export const MAX_NAME = 30;

/** Quita espacios de más: "  doña   rosa " → "doña rosa". */
export const normalizeName = (raw: string): string => raw.trim().replace(/\s+/g, ' ');

/** Clave para comparar sin importar mayúsculas ni tildes ("Peña" = "pena"). */
export const nameKey = (raw: string): string =>
  normalizeName(raw).toLocaleLowerCase('es').normalize('NFD').replace(/\p{M}/gu, '');

/** Devuelve el mensaje de error, o null si el nombre sirve. */
export function validateCustomerName(raw: string, existing: readonly Customer[]): string | null {
  const name = normalizeName(raw);
  if (name.length < MIN_NAME) return 'Escribe el nombre del cliente (mínimo 2 letras).';
  if (name.length > MAX_NAME) return `El nombre es muy largo (máximo ${MAX_NAME} letras).`;
  if (!/^[\p{L}\p{N} .'-]+$/u.test(name)) return 'Usa solo letras y números en el nombre.';
  if (existing.length >= MAX_CUSTOMERS) return 'Ya tienes muchos clientes. Quita alguno antes de agregar otro.';
  const key = nameKey(name);
  if (existing.some((c) => nameKey(c.name) === key)) return 'Ya tienes un cliente con ese nombre.';
  return null;
}

export type AddCustomerResult =
  | { ok: true; list: Customer[]; customer: Customer }
  | { ok: false; message: string };

export function addCustomer(existing: readonly Customer[], raw: string, makeId: () => string = newId): AddCustomerResult {
  const message = validateCustomerName(raw, existing);
  if (message) return { ok: false, message };
  const customer: Customer = { id: makeId(), name: normalizeName(raw) };
  return { ok: true, list: [...existing, customer], customer };
}

export function isValidCustomerList(x: unknown): x is Customer[] {
  return Array.isArray(x) && x.every((c) => typeof c === 'object' && c !== null &&
    typeof (c as Customer).id === 'string' && (c as Customer).id !== '' &&
    typeof (c as Customer).name === 'string' && (c as Customer).name.trim() !== '') &&
    new Set(x.map((c: Customer) => c.id)).size === x.length;
}
