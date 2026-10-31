import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSaleFlow } from '../state/SaleFlowContext.tsx';
import { formatSoles } from '../domain/money.ts';
import { SEED_CUSTOMERS } from '../domain/customer.ts';

const METHOD_LABEL = { efectivo: 'Efectivo', yape: 'Yape / Plin', fiado: 'Fiado' } as const;

export function SaleDone() {
  const { lastSale, reset } = useSaleFlow();
  const navigate = useNavigate();
  if (!lastSale) return <Navigate to="/inicio" replace />;
  const fiado = lastSale.method === 'fiado';
  const customer = SEED_CUSTOMERS.find((c) => c.id === lastSale.customerId);

  return (
    <div className="stack" style={{ textAlign: 'center' }}>
      <p className="done-check" aria-hidden="true">✓</p>
      <h1>{fiado ? 'Fiado guardado' : 'Venta guardada'}</h1>
      <p className="display__amount">{formatSoles(lastSale.amountCents)}</p>
      <ul className="detail-list">
        <li>Forma de pago: <strong>{METHOD_LABEL[lastSale.method]}{fiado && customer ? ` a ${customer.name}` : ''}</strong></li>
        {lastSale.method === 'efectivo' && lastSale.changeCents !== undefined && (
          <li>Vuelto: <strong>{formatSoles(lastSale.changeCents)}</strong></li>
        )}
      </ul>
      <p>Ya quedó anotada en este celular.</p>
      <button type="button" className="btn btn--primary" onClick={() => { reset(); navigate('/venta', { replace: true }); }}>Nueva venta</button>
      <Link to="/inicio" className="btn">Ir al inicio</Link>
    </div>
  );
}
