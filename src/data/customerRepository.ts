import type { Customer } from '../domain/customer.ts';
import { SEED_CUSTOMERS, isValidCustomerList } from '../domain/customer.ts';

export interface CustomerRepository {
  load(): Customer[];
  save(list: readonly Customer[]): void;
}

export class InMemoryCustomerRepository implements CustomerRepository {
  private list: Customer[] = [...SEED_CUSTOMERS];
  load() { return [...this.list]; }
  save(list: readonly Customer[]) { this.list = [...list]; }
}

const KEY = 'cajafacil.customers.v1';

export class LocalStorageCustomerRepository implements CustomerRepository {
  private cache: Customer[] | undefined;

  load(): Customer[] {
    if (this.cache) return [...this.cache];
    try {
      const raw = globalThis.localStorage?.getItem(KEY);
      if (raw === null || raw === undefined) this.cache = [...SEED_CUSTOMERS];
      else {
        const parsed: unknown = JSON.parse(raw);
        this.cache = isValidCustomerList(parsed) ? parsed : [...SEED_CUSTOMERS];
      }
    } catch {
      this.cache = [...SEED_CUSTOMERS];
    }
    return [...this.cache];
  }

  save(list: readonly Customer[]): void {
    this.cache = [...list];
    try { globalThis.localStorage?.setItem(KEY, JSON.stringify(list)); } catch { /* queda en memoria */ }
  }
}
