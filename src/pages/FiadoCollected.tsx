import { Link, Navigate, useParams } from 'react-router-dom';
import { useSales } from '../state/SalesContext.tsx';
import { formatSoles } from '../domain/money.ts';
import { formatClock } from '../domain/sale.ts';
import { useCustomers } from '../state/CustomersContext.tsx';

export function FiadoCollected() {
  const { customers } = useCustomers();
  const { id = '' } = useParams();
  const { sales } = useSales();
  const sale = sales.find((s) => s.id === id);
  if (!sale || !sale.collectedAt) return <Navigate to="/fiados" replace />;
  const customer = customers.find((c) => c.id === sale.customerId);

  return (
    <>
      <p className="done-check" aria-hidden="true">✓</p>
      <h1 style={{ textAlign: 'center' }}>Cobro registrado</h1>
      <section className="card" aria-label="Resumen del cobro">
        <p className="amount">{formatSoles(sale.amountCents)}</p>
        <ul className="detail-list">
          <li>Cliente: <strong>{customer?.name ?? 'Cliente'}</strong></li>
          <li>Pagó con: <strong>{sale.collectedMethod === 'yape' ? 'Yape / Plin' : 'Efectivo'}</strong></li>
          <li>Hora: <strong>{formatClock(sale.collectedAt)}</strong></li>
        </ul>
        <p style={{ margin: 'var(--space-2) 0 0' }}>Ahora suma a lo cobrado hoy.</p>
      </section>
      <div className="stack">
        <Link to="/fiados" className="btn btn--primary">Volver a Fiados</Link>
        <Link to="/inicio" className="btn">Ir a Inicio</Link>
      </div>
    </>
  );
}
