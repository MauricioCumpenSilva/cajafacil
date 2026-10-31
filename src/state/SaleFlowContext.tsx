import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { calcReducer, initialCalc, totalCents } from '../domain/calculator.ts';
import type { CalcAction, CalcState } from '../domain/calculator.ts';
import type { Cents } from '../domain/money.ts';
import type { PaymentMethod, Sale } from '../domain/sale.ts';
import { DEFAULT_CUSTOMER_ID } from '../domain/customer.ts';
import { useSales } from './SalesContext.tsx';

interface SaleFlowApi {
  calc: CalcState;
  dispatch: Dispatch<CalcAction>;
  total: Cents;
  method: PaymentMethod;
  setMethod(m: PaymentMethod): void;
  paidCents: Cents | null;
  setPaidCents(c: Cents | null): void;
  customerId: string;
  setCustomerId(id: string): void;
  lastSale: Sale | null;
  /** Guarda la venta en curso. Lanza DomainError si no es válida. */
  save(): Promise<Sale>;
  /** Descarta la venta en curso (monto, método y pago). */
  reset(): void;
}

const SaleFlowContext = createContext<SaleFlowApi | null>(null);

/** Estado de la venta mientras el usuario pasa por: monto → pago → guardada. */
export function SaleFlowProvider({ children }: { children: ReactNode }) {
  const { saveSale } = useSales();
  const [calc, dispatch] = useReducer(calcReducer, initialCalc);
  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [paidCents, setPaidCents] = useState<Cents | null>(null);
  const [customerId, setCustomerId] = useState<string>(DEFAULT_CUSTOMER_ID);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const total = totalCents(calc);

  const reset = useCallback(() => {
    dispatch({ type: 'clear' });
    setMethod('efectivo');
    setPaidCents(null);
    setCustomerId(DEFAULT_CUSTOMER_ID);
  }, []);

  const save = useCallback(async () => {
    const sale = await saveSale({
      amountCents: total,
      method,
      paidCents: method === 'efectivo' ? paidCents ?? undefined : undefined,
      customerId: method === 'fiado' ? customerId : undefined,
    });
    setLastSale(sale);
    reset();
    return sale;
  }, [saveSale, total, method, paidCents, customerId, reset]);

  const value = useMemo(
    () => ({ calc, dispatch, total, method, setMethod, paidCents, setPaidCents, customerId, setCustomerId, lastSale, save, reset }),
    [calc, total, method, paidCents, customerId, lastSale, save, reset],
  );
  return <SaleFlowContext.Provider value={value}>{children}</SaleFlowContext.Provider>;
}

export function useSaleFlow(): SaleFlowApi {
  const ctx = useContext(SaleFlowContext);
  if (!ctx) throw new Error('useSaleFlow debe usarse dentro de <SaleFlowProvider>');
  return ctx;
}
