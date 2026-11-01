import { useState } from 'react';
import { useSales } from '../state/SalesContext.tsx';
import { PERIODS, periodTotals } from '../domain/balance.ts';
import type { Period } from '../domain/balance.ts';
import { formatSoles } from '../domain/money.ts';

export function Balance() {
  const { sales } = useSales();
  const [period, setPeriod] = useState<Period>('hoy');
  const t = periodTotals(sales, period, new Date());
  const hint = PERIODS.find((p) => p.id === period)?.hint ?? '';

  return (
    <>
      <h1>Balance</h1>
      <div className="periods" role="group" aria-label="Periodo">
        {PERIODS.map((p) => (
          <button key={p.id} type="button" className="chip" aria-pressed={period === p.id} onClick={() => setPeriod(p.id)}>{p.label}</button>
        ))}
      </div>
      <section className="card" aria-live="polite" aria-label={`Balance: ${hint}`}>
        <h2 className="h2">{hint}</h2>
        <p className="amount">{formatSoles(t.totalCents)}</p>
        <dl className="totals">
          <div><dt>Efectivo</dt><dd>{formatSoles(t.efectivoCents)}</dd></div>
          <div><dt>Yape / Plin</dt><dd>{formatSoles(t.yapeCents)}</dd></div>
          <div><dt>Ventas guardadas</dt><dd>{t.count}</dd></div>
          <div><dt>Ventas anuladas</dt><dd>{t.voidedCount}</dd></div>
        </dl>
      </section>
      <p style={{ margin: 0 }}>Los fiados no suman hasta que el cliente pague.</p>
    </>
  );
}
