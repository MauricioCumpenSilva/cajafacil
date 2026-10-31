import { Link } from 'react-router-dom';
import { useSales } from '../state/SalesContext.tsx';
import { dayTotals, localDayKey } from '../domain/sale.ts';
import { formatSoles } from '../domain/money.ts';
import { useOnline } from '../ui/useOnline.ts';

export function Home() {
  const { sales } = useSales();
  const online = useOnline();
  const t = dayTotals(sales, localDayKey(new Date()));

  return (
    <>
      <h1>Inicio</h1>

      <section className="card" aria-labelledby="cobrado-hoy">
        <h2 id="cobrado-hoy" style={{ fontSize: '1rem', margin: 0 }}>Cobrado hoy</h2>
        <p className="amount">{formatSoles(t.totalCents)}</p>
        <p style={{ margin: 0 }}>{t.count} {t.count === 1 ? 'venta guardada' : 'ventas guardadas'}</p>
      </section>

      <p className={online ? 'status' : 'status status--offline'} role="status">
        {online ? 'Con conexión' : 'Sin conexión · tus ventas se guardan en este celular'}
      </p>

      <nav aria-label="Secciones" className="stack" style={{ marginTop: 'var(--space-3)' }}>
        <Link to="/venta" className="btn btn--primary">Nueva venta</Link>
        <Link to="/ventas" className="btn">Ventas de hoy</Link>
        <Link to="/balance" className="btn">Balance</Link>
        <Link to="/fiados" className="btn">Fiados</Link>
        <Link to="/cuenta" className="btn">Mi cuenta</Link>
      </nav>
    </>
  );
}
