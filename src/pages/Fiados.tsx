import { Link } from 'react-router-dom';
import { useSales } from '../state/SalesContext.tsx';
import { debtByCustomer } from '../domain/sale.ts';
import { useCustomers } from '../state/CustomersContext.tsx';
import { formatSoles, sumCents } from '../domain/money.ts';

export function Fiados() {
  const { customers } = useCustomers();
  const { sales } = useSales();
  const debts = debtByCustomer(sales);
  const total = sumCents(debts.map((d) => d.totalCents));

  return (
    <>
      <h1>Fiados</h1>
      <section className="card" aria-label="Total por cobrar">
        <h2 className="h2">Por cobrar</h2>
        <p className="amount" style={{ color: 'var(--color-fiado)' }}>{formatSoles(total)}</p>
      </section>
      {debts.length === 0 ? (
        <p className="card">Nadie te debe por ahora.</p>
      ) : (
        <ul className="sale-list">
          {debts.map((d) => {
            const name = customers.find((c) => c.id === d.customerId)?.name ?? 'Cliente';
            return (
              <li key={d.customerId}>
                <Link to={`/fiados/${d.customerId}`} className="sale-row">
                  <span aria-hidden="true">👤</span>
                  <span>{name} · {d.count} {d.count === 1 ? 'compra' : 'compras'}</span>
                  <span className="sale-row__amount">{formatSoles(d.totalCents)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
