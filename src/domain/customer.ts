export interface Customer { id: string; name: string }

/** Clientes de ejemplo; la etapa 5 permite agregar más (fiados). */
export const SEED_CUSTOMERS: readonly Customer[] = [
  { id: 'luis', name: 'Luis' },
  { id: 'carmen', name: 'Carmen' },
];
export const DEFAULT_CUSTOMER_ID = 'luis';
