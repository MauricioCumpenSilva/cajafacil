import type { Sale } from '../domain/sale.ts';

/**
 * Contrato de almacenamiento. Hoy: localStorage. Mañana: IndexedDB o sincronización con
 * un servidor, cambiando solo la implementación (el resto de la app no se entera).
 */
export interface SalesRepository {
  list(): Promise<Sale[]>;
  add(sale: Sale): Promise<void>;
  update(sale: Sale): Promise<void>;
}

export class InMemorySalesRepository implements SalesRepository {
  private items: Sale[] = [];
  async list(): Promise<Sale[]> { return [...this.items]; }
  async add(sale: Sale): Promise<void> { this.items.push(sale); }
  async update(sale: Sale): Promise<void> {
    this.items = this.items.map((s) => (s.id === sale.id ? sale : s));
  }
}

const KEY = 'cajafacil.sales.v1';

/** Funciona sin internet. Si el almacenamiento falla (modo privado), la app sigue en memoria. */
export class LocalStorageSalesRepository implements SalesRepository {
  private cache: Sale[] | null = null;

  private read(): Sale[] {
    if (this.cache) return this.cache;
    try {
      const raw = globalThis.localStorage?.getItem(KEY);
      this.cache = raw ? (JSON.parse(raw) as Sale[]) : [];
    } catch {
      this.cache = [];
    }
    return this.cache;
  }

  private write(items: Sale[]): void {
    this.cache = items;
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify(items));
    } catch {
      /* sin almacenamiento: se mantiene en memoria */
    }
  }

  async list(): Promise<Sale[]> { return [...this.read()]; }
  async add(sale: Sale): Promise<void> { this.write([...this.read(), sale]); }
  async update(sale: Sale): Promise<void> {
    this.write(this.read().map((s) => (s.id === sale.id ? sale : s)));
  }
}
