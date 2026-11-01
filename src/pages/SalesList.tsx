import { Link } from 'react-router-dom';
import { useSales } from '../state/SalesContext.tsx';
import { formatClock, localDayKey, METHOD_LABEL, sortRecent } from '../domain/sale.ts';
import { formatSoles } from '../domain/money.ts';

export function SalesList({ voided = false }: { voided?: boolean }) {
  const { sales } = useSales();
  const today = localDayKey(new Date());
  const list = sortRecent(sales.filter((s) =>
    localDayKey(new Date(s.createdAt)) === today && (voided ? s.status === 'anulada' : s.status === 'guardada')));

  return (
    <>
      <h1>Ventas de hoy</h1>
      <nav aria-label="Tipo de ventas" className="tabs">
        <Link to="/ventas" className="tab" aria-current={voided ? undefined : 'page'}>Guardadas</Link>
        <Link to="/ventas/anuladas" className="tab" aria-current={voided ? 'page' : undefined}>Anuladas</Link>
      </nav>
      {list.length === 0 ? (
        <p className="card">{voided ? 'Hoy no anulaste ninguna venta.' : 'Todavía no hay ventas guardadas hoy.'}</p>
      ) : (
        <ul className="sale-list">
          {list.map((s) => (
            <li key={s.id}>
              <Link to={`/ventas/${s.id}`} className="sale-row">
                <span>{formatClock(s.createdAt)}</span>
                <span>{METHOD_LABEL[s.method]} · <span className={s.status === 'anulada' ? 'badge badge--void' : 'badge badge--ok'}>{s.status === 'anulada' ? 'Anulada' : 'Guardada'}</span></span>
                <span className="sale-row__amount">{formatSoles(s.amountCents)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
