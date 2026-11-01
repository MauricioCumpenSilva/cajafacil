import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { SalesRepository } from '../data/repository.ts';
import { LocalStorageSalesRepository } from '../data/repository.ts';
import type { FeedbackService } from '../services/feedback.ts';
import { browserFeedback } from '../services/feedback.ts';
import type { CollectMethod, NewSaleInput, Sale } from '../domain/sale.ts';
import { collectSale, createSale, voidSale } from '../domain/sale.ts';
import { DomainError } from '../domain/errors.ts';

interface SalesApi {
  sales: Sale[];
  ready: boolean;
  /** Lanza DomainError (con mensaje en español) si la venta no es válida. */
  saveSale(input: NewSaleInput): Promise<Sale>;
  cancelSale(id: string): Promise<void>;
  collectFiado(id: string, method: CollectMethod): Promise<void>;
}

const SalesContext = createContext<SalesApi | null>(null);

interface Props {
  children: ReactNode;
  repo?: SalesRepository;
  feedback?: FeedbackService;
}

export function SalesProvider({ children, repo, feedback }: Props) {
  const [repository] = useState<SalesRepository>(() => repo ?? new LocalStorageSalesRepository());
  const [fb] = useState<FeedbackService>(() => feedback ?? browserFeedback);
  const [sales, setSales] = useState<Sale[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    repository.list().then((list) => {
      if (!alive) return;
      setSales(list);
      setReady(true);
    });
    return () => { alive = false; };
  }, [repository]);

  const saveSale = useCallback(async (input: NewSaleInput) => {
    try {
      const sale = createSale(input);
      await repository.add(sale);
      setSales((prev) => [...prev, sale]);
      fb.notify('sale-saved');
      return sale;
    } catch (e) {
      if (e instanceof DomainError) fb.notify('error');
      throw e;
    }
  }, [repository, fb]);

  const cancelSale = useCallback(async (id: string) => {
    const current = sales.find((s) => s.id === id);
    if (!current) return;
    const voided = voidSale(current);
    await repository.update(voided);
    setSales((prev) => prev.map((s) => (s.id === id ? voided : s)));
    fb.notify('sale-voided');
  }, [repository, fb, sales]);

  const collectFiado = useCallback(async (id: string, method: CollectMethod) => {
    const current = sales.find((s) => s.id === id);
    if (!current) return;
    const collected = collectSale(current, method);
    await repository.update(collected);
    setSales((prev) => prev.map((s) => (s.id === id ? collected : s)));
    fb.notify('sale-saved');
  }, [repository, fb, sales]);

  const value = useMemo(() => ({ sales, ready, saveSale, cancelSale, collectFiado }), [sales, ready, saveSale, cancelSale, collectFiado]);
  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
}

export function useSales(): SalesApi {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSales debe usarse dentro de <SalesProvider>');
  return ctx;
}
