import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useSales } from '../state/SalesContext.tsx';
import { Spinner } from '../ui/Spinner.tsx';
import { formatSoles } from '../domain/money.ts';
import { formatClock } from '../domain/sale.ts';
import type { CollectMethod } from '../domain/sale.ts';
import { useCustomers } from '../state/CustomersContext.tsx';

const OPTIONS: { id: CollectMethod; label: string }[] = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'yape', label: 'Yape / Plin' },
];

export function CollectFiado() {
  const { customers } = useCustomers();
  const { id = '' } = useParams();
  const { sales, collectFiado } = useSales();
  const navigate = useNavigate();
  const [method, setMethod] = useState<CollectMethod | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const sale = sales.find((s) => s.id === id);
  const pending = !!sale && sale.method === 'fiado' && sale.status === 'guardada' && !sale.collectedAt;
  if (!sale || (!pending && !busy)) return <Navigate to="/fiados" replace />;
  const customer = customers.find((c) => c.id === sale.customerId);

  const confirm = async () => {
    if (!method) { setError('Elige cómo te pagó: efectivo o Yape / Plin.'); return; }
    setError(null);
    setBusy(true);
    try {
      await collectFiado(sale.id, method);
      // Pausa breve y visible para que se note que se registró.
      timer.current = window.setTimeout(() => navigate(`/fiados/cobrado/${sale.id}`, { replace: true }), 500);
    } catch {
      setBusy(false);
      setError('No se pudo registrar el cobro. Inténtalo otra vez.');
    }
  };

  return (
    <>
      <h1>Cobrar a {customer?.name ?? 'cliente'}</h1>
      <section className="card" aria-label="Monto a cobrar">
        <p className="amount" style={{ color: 'var(--color-fiado)' }}>{formatSoles(sale.amountCents)}</p>
        <p style={{ margin: 0 }}>Compra de las {formatClock(sale.createdAt)}</p>
      </section>
      <h2 className="h2" id="como-pago">¿Cómo te pagó?</h2>
      <div className="methods methods--2" role="group" aria-labelledby="como-pago">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" disabled={busy}
            className={`method method--${o.id}${method === o.id ? ' method--on' : ''}`}
            aria-pressed={method === o.id} onClick={() => { setError(null); setMethod(o.id); }}>
            {o.label}
          </button>
        ))}
      </div>
      {error && <p className="field__error" role="alert"><span aria-hidden="true">⚠ </span>{error}</p>}
      <button type="button" className="btn btn--primary" disabled={busy} aria-busy={busy} onClick={confirm}>
        {busy ? <><Spinner /> Registrando cobro…</> : 'Registrar cobro'}
      </button>
    </>
  );
}
