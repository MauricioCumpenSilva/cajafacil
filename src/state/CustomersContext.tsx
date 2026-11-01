import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CustomerRepository } from '../data/customerRepository.ts';
import { LocalStorageCustomerRepository } from '../data/customerRepository.ts';
import { addCustomer } from '../domain/customer.ts';
import type { Customer } from '../domain/customer.ts';

interface CustomersApi {
  customers: Customer[];
  /** Agrega un cliente nuevo. Si el nombre no sirve, devuelve el mensaje para mostrarlo. */
  add(name: string): { ok: true; customer: Customer } | { ok: false; message: string };
}

const CustomersContext = createContext<CustomersApi | null>(null);

export function CustomersProvider({ children, repo }: { children: ReactNode; repo?: CustomerRepository }) {
  const [repository] = useState<CustomerRepository>(() => repo ?? new LocalStorageCustomerRepository());
  const [customers, setCustomers] = useState<Customer[]>(() => repository.load());

  const add = useCallback((name: string) => {
    const r = addCustomer(customers, name);
    if (!r.ok) return r;
    repository.save(r.list);
    setCustomers(r.list);
    return { ok: true as const, customer: r.customer };
  }, [customers, repository]);

  const value = useMemo(() => ({ customers, add }), [customers, add]);
  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>;
}

export function useCustomers(): CustomersApi {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error('useCustomers debe usarse dentro de <CustomersProvider>');
  return ctx;
}
