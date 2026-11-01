import { Link, Navigate, useParams } from 'react-router-dom';
import { useSales } from '../state/SalesContext.tsx';
import { formatClock, localDayKey, pendingFiados } from '../domain/sale.ts';
import { useCustomers } from '../state/CustomersContext.tsx';
import { formatSoles, sumCents } from '../domain/money.ts';

export function FiadoCustomer() {
  const { customers } = useCustomers();
  const { cliente = '' } = useParams();
  const { sales } = useSales();
  const customer = customers.find((c) => c.id === cliente);
  if (!customer) return <Navigate to="/fiados" replace />;
  const list = pendingFiados(sales).filter((s) => s.customerId === customer.id);
  const today = localDayKey(new Date());

  return (
    <>
      <h1>Deudas de {customer.name}</h1>
      <section className="card" aria-label="Total que debe">
        <h2 className="h2">Debe</h2>
        <p className="amount" style={{ color: 'var(--color-fiado)' }}>{formatSoles(sumCents(list.map((s) => s.amountCents)))}</p>
      </section>
      {list.length === 0 ? (
        <p className="card">{customer.name} no debe nada.</p>
      ) : (
        <ul className="sale-list">
          {list.map((s) => {
            const when = localDayKey(new Date(s.createdAt)) === today ? 'Hoy' : new Date(s.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
            return (
              <li key={s.id}>
                <Link to={`/fiados/cobro/${s.id}`} className="sale-row" aria-label={`Cobrar ${formatSoles(s.amountCents)} del ${when} a las ${formatClock(s.createdAt)}`}>
                  <span>{when} {formatClock(s.createdAt)}</span>
                  <span className="sale-row__amount">{formatSoles(s.amountCents)}</span>
                  <span className="badge badge--ok">Cobrar →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
