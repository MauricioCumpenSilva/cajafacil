import { Link, Navigate, useParams } from 'react-router-dom';
import { useSales } from '../state/SalesContext.tsx';
import { formatClock, METHOD_LABEL } from '../domain/sale.ts';
import { formatSoles } from '../domain/money.ts';
import { useCustomers } from '../state/CustomersContext.tsx';

export function SaleDetail() {
  const { customers } = useCustomers();
  const { id = '' } = useParams();
  const { sales } = useSales();
  const sale = sales.find((s) => s.id === id);
  if (!sale) return <Navigate to="/ventas" replace />;
  const voided = sale.status === 'anulada';
  const customer = customers.find((c) => c.id === sale.customerId);

  return (
    <>
      <h1>Detalle de la venta</h1>
      <section className="card" aria-label="Datos de la venta">
        <p className="amount" style={voided ? { color: 'var(--color-danger)' } : undefined}>{formatSoles(sale.amountCents)}</p>
        <ul className="detail-list">
          <li>Estado: <strong className={voided ? 'badge badge--void' : 'badge badge--ok'}>{voided ? 'Anulada' : 'Guardada'}</strong></li>
          <li>Hora: <strong>{formatClock(sale.createdAt)}</strong></li>
          <li>Forma de pago: <strong>{METHOD_LABEL[sale.method]}{customer ? ` a ${customer.name}` : ''}</strong></li>
          {sale.method === 'efectivo' && sale.paidCents !== undefined && <li>Pagó con: <strong>{formatSoles(sale.paidCents)}</strong></li>}
          {sale.method === 'efectivo' && sale.changeCents !== undefined && <li>Vuelto: <strong>{formatSoles(sale.changeCents)}</strong></li>}
          {voided && sale.voidedAt && <li>Anulada a las: <strong>{formatClock(sale.voidedAt)}</strong></li>}
        </ul>
      </section>
      {!voided && <Link to={`/ventas/${sale.id}/anular`} className="btn btn--danger">Anular venta</Link>}
    </>
  );
}
