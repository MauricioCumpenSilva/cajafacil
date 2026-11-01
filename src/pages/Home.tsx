import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from '../state/AccountContext.tsx';
import { useSales } from '../state/SalesContext.tsx';
import { useBackup } from '../state/BackupContext.tsx';
import { markAnnounced, readLastVisitDay, wasAnnounced, writeLastVisitDay } from '../state/greetingState.ts';
import { dayTotals, localDayKey } from '../domain/sale.ts';
import { formatSoles } from '../domain/money.ts';
import { backupLabel } from '../domain/backup.ts';
import { buildGreeting, helloTitle } from '../domain/greeting.ts';
import type { Greeting } from '../domain/greeting.ts';
import { AvatarImage } from '../ui/Brand.tsx';
import { useOnline } from '../ui/useOnline.ts';

export function Home() {
  const { account } = useAccount();
  const { sales } = useSales();
  const online = useOnline();
  const backup = useBackup();
  const today = localDayKey(new Date());
  const t = dayTotals(sales, today);
  const name = account?.name ?? '';

  // El globo de bienvenida sale una vez cada vez que se abre la app (no cada vez que se vuelve a Inicio).
  const [greeting, setGreeting] = useState<Greeting | null>(() =>
    wasAnnounced() || !name ? null : buildGreeting({ name, lastVisitDay: readLastVisitDay(), today, salesToday: t.count, totalCents: t.totalCents }));
  useEffect(() => { markAnnounced(); writeLastVisitDay(today); }, [today]);

  return (
    <>
      <div className="hello">
        {account && <AvatarImage kind={account.avatar} size={72} decorative />}
        <h1 className="hello__title">{helloTitle(name)}</h1>
      </div>

      <section className="card" aria-labelledby="cobrado-hoy">
        <h2 id="cobrado-hoy" style={{ fontSize: '1rem', margin: 0 }}>Cobrado hoy</h2>
        <p className="amount">{formatSoles(t.totalCents)}</p>
        <p style={{ margin: 0 }}>{t.count} {t.count === 1 ? 'venta guardada' : 'ventas guardadas'}</p>
      </section>

      <p className={online ? 'status' : 'status status--offline'} role="status">
        {online ? 'Con conexión' : 'Sin conexión · tus ventas se guardan en este celular'}
      </p>

      <p style={{ margin: 'var(--space-2) 0 0' }}>{backup.running ? 'Respaldando…' : backupLabel(backup.pending, online, backup.lastBackupAt)}</p>

      <nav aria-label="Secciones" className="stack" style={{ marginTop: 'var(--space-3)' }}>
        {greeting && (
          <div className="bubble" role="status">
            <p className="bubble__text">{greeting.bubble}</p>
            <button type="button" className="btn btn--pill" onClick={() => setGreeting(null)}>Entendido</button>
            <span className="bubble__arrow" aria-hidden="true">▼</span>
          </div>
        )}
        <Link to="/venta" className={greeting ? 'btn btn--primary btn--attention' : 'btn btn--primary'}>Nueva venta</Link>
        <Link to="/ventas" className="btn">Ventas de hoy</Link>
        <Link to="/balance" className="btn">Balance</Link>
        <Link to="/fiados" className="btn">Fiados</Link>
        <Link to="/cuenta" className="btn">Mi cuenta</Link>
      </nav>
    </>
  );
}
