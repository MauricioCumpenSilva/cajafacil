import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useSales } from '../state/SalesContext.tsx';
import { Spinner } from '../ui/Spinner.tsx';
import { formatSoles } from '../domain/money.ts';
import { formatClock } from '../domain/sale.ts';

export function ConfirmVoid() {
  const { id = '' } = useParams();
  const { sales, cancelSale } = useSales();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sale = sales.find((s) => s.id === id);
  if (!sale) return <Navigate to="/ventas" replace />;
  if (sale.status === 'anulada' && !busy) return <Navigate to={`/ventas/${sale.id}`} replace />;

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await cancelSale(sale.id);
      navigate('/ventas/anuladas', { replace: true });
    } catch {
      setBusy(false);
      setError('No se pudo anular. Inténtalo otra vez.');
    }
  };

  return (
    <>
      <h1>¿Anular esta venta?</h1>
      <p className="card">Venta de {formatSoles(sale.amountCents)} de las {formatClock(sale.createdAt)}. Dejará de sumar al total de hoy.</p>
      {error && <p className="field__error" role="alert"><span aria-hidden="true">⚠ </span>{error}</p>}
      <div className="btn-row">
        <Link to={`/ventas/${sale.id}`} className="btn" aria-disabled={busy}>No, mantener</Link>
        <button type="button" className="btn btn--danger" disabled={busy} aria-busy={busy} onClick={confirm}>
          {busy ? <><Spinner /> Anulando…</> : 'Sí, anular'}
        </button>
      </div>
    </>
  );
}
