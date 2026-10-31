import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSaleFlow } from '../state/SaleFlowContext.tsx';
import { paymentStatus, PAID_CHIPS_CENTS } from '../domain/payment.ts';
import { formatSoles } from '../domain/money.ts';
import { DomainError } from '../domain/errors.ts';
import { SEED_CUSTOMERS } from '../domain/customer.ts';
import type { PaymentMethod } from '../domain/sale.ts';

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'yape', label: 'Yape / Plin' },
  { id: 'fiado', label: 'Fiado' },
];

export function Payment() {
  const flow = useSaleFlow();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* Mientras se guarda, el total vuelve a 0: no redirigir hasta terminar. */
  if (flow.total <= 0 && !saving) return <Navigate to="/venta" replace />;

  const status = paymentStatus(flow.total, flow.paidCents);
  const customer = SEED_CUSTOMERS.find((c) => c.id === flow.customerId) ?? SEED_CUSTOMERS[0];

  const choose = (m: PaymentMethod) => { setError(null); flow.setMethod(m); };

  const save = async () => {
    setError(null);
    if (flow.method === 'efectivo') {
      if (status.kind === 'sin-elegir') { setError('Elige con cuánto pagó el cliente.'); return; }
      if (status.kind === 'falta') { setError(`Falta ${formatSoles(status.missingCents)}. Elige un monto mayor.`); return; }
    }
    setSaving(true);
    try {
      await flow.save();
      navigate('/venta/listo', { replace: true });
    } catch (e) {
      setSaving(false);
      setError(e instanceof DomainError ? e.message : 'No se pudo guardar. Inténtalo otra vez.');
    }
  };

  return (
    <>
      <p className="step">Paso 2 de 2</p>
      <h1>¿Cómo pagó?</h1>
      <p className="display__amount display__amount--small">Total {formatSoles(flow.total)}</p>

      <div className="methods" role="group" aria-label="Forma de pago">
        {METHODS.map((m) => (
          <button key={m.id} type="button" aria-pressed={flow.method === m.id}
            className={`method method--${m.id}${flow.method === m.id ? ' method--on' : ''}`} onClick={() => choose(m.id)}>
            {m.label}
          </button>
        ))}
      </div>

      {flow.method === 'efectivo' && (
        <section aria-labelledby="paga-con" className="stack" style={{ marginTop: 'var(--space-3)' }}>
          <h2 id="paga-con" className="h2">¿Con cuánto pagó?</h2>
          <div className="shortcuts" role="group" aria-labelledby="paga-con">
            <button type="button" className="chip" aria-pressed={flow.paidCents === flow.total}
              onClick={() => { setError(null); flow.setPaidCents(flow.total); }}>Justo</button>
            {PAID_CHIPS_CENTS.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={flow.paidCents === c}
                onClick={() => { setError(null); flow.setPaidCents(c); }}>
                {formatSoles(c).replace('.00', '')}
              </button>
            ))}
          </div>
          {status.kind === 'ok' && <p className="change" role="status">Vuelto: <strong>{formatSoles(status.changeCents)}</strong></p>}
          {status.kind === 'falta' && <p className="field__error" role="status">Falta {formatSoles(status.missingCents)}</p>}
        </section>
      )}

      {flow.method === 'yape' && (
        <p className="card" style={{ marginTop: 'var(--space-3)' }}>Confirma que el pago llegó a tu celular y toca Guardar venta.</p>
      )}

      {flow.method === 'fiado' && (
        <fieldset className="stack customer-set">
          <legend className="h2">¿A quién se le fía?</legend>
          {SEED_CUSTOMERS.map((c) => (
            <label key={c.id} className={flow.customerId === c.id ? 'choice choice--on' : 'choice'}>
              <input type="radio" name="cliente" value={c.id} checked={flow.customerId === c.id}
                onChange={() => flow.setCustomerId(c.id)} className="sr-only" />
              {c.name}
            </label>
          ))}
          <p style={{ margin: 0 }}>Se anota como deuda de {customer.name}. No suma a lo cobrado hoy hasta que pague.</p>
        </fieldset>
      )}

      {error && <p className="field__error" role="alert"><span aria-hidden="true">⚠ </span>{error}</p>}
      <button type="button" className="btn btn--primary" disabled={saving} onClick={save}>
        {flow.method === 'fiado' ? 'Guardar fiado' : 'Guardar venta'}
      </button>
    </>
  );
}
