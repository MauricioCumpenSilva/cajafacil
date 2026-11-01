import { useNavigate } from 'react-router-dom';
import { useAccount } from '../state/AccountContext.tsx';
import { useBackup } from '../state/BackupContext.tsx';
import { AvatarImage } from '../ui/Brand.tsx';
import { Spinner } from '../ui/Spinner.tsx';
import { backupLabel } from '../domain/backup.ts';
import { formatClock, localDayKey } from '../domain/sale.ts';

function whenText(iso: string | null): string {
  if (!iso) return 'Aún no hay respaldo';
  const d = new Date(iso);
  const day = localDayKey(d) === localDayKey(new Date()) ? 'hoy' : d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  return `Último respaldo: ${day} a las ${formatClock(iso)}`;
}

export function AccountPage() {
  const { account, signOut } = useAccount();
  const { lastBackupAt, pending, running, online, backupNow } = useBackup();
  const navigate = useNavigate();
  if (!account) return null;

  const logout = () => { signOut(); navigate('/', { replace: true }); };

  return (
    <>
      <h1>Mi cuenta</h1>
      <section className="card account" aria-label="Mis datos">
        <AvatarImage kind={account.avatar} />
        <div>
          <p className="h2">{account.name}</p>
          <p style={{ margin: 0 }}>Celular: {account.phone}</p>
        </div>
      </section>

      <section className="card" aria-labelledby="resp">
        <h2 id="resp" className="h2">Respaldo de tus ventas</h2>
        <p className={online ? 'status' : 'status status--offline'} role="status">{online ? 'Con conexión' : 'Sin conexión'}</p>
        <p style={{ margin: 'var(--space-2) 0' }}>{backupLabel(pending, online, lastBackupAt)}</p>
        <p style={{ margin: 0, color: 'var(--color-text-soft)' }}>{whenText(lastBackupAt)}</p>
        <p className="field__hint" style={{ marginTop: 'var(--space-2)' }}>Respaldo de demostración: en este prototipo no se envía a ningún servidor.</p>
        <button type="button" className="btn btn--primary" style={{ marginTop: 'var(--space-3)' }}
          disabled={!online || running || pending === 0} aria-busy={running} onClick={backupNow}>
          {running ? <><Spinner /> Respaldando…</> : 'Respaldar ahora'}
        </button>
        {!online && <p className="field__hint">Sin internet no se puede respaldar. Tus ventas siguen guardadas en este celular.</p>}
      </section>

      <button type="button" className="btn btn--danger" onClick={logout}>Cerrar sesión</button>
    </>
  );
}
