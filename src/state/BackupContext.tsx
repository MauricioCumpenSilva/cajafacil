import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAccount } from './AccountContext.tsx';
import { useSales } from './SalesContext.tsx';
import { useOnline } from '../ui/useOnline.ts';
import { AUTO_BACKUP_DELAY_MS, BACKUP_DURATION_MS, pendingBackupCount } from '../domain/backup.ts';

interface BackupApi {
  lastBackupAt: string | null;
  pending: number;
  running: boolean;
  online: boolean;
  /** Respaldo simulado: solo con internet. Devuelve false si no se pudo iniciar. */
  backupNow(): boolean;
}

const BackupContext = createContext<BackupApi | null>(null);

export function BackupProvider({ children }: { children: ReactNode }) {
  const { backup, saveBackup, signedIn } = useAccount();
  const { sales, ready } = useSales();
  const online = useOnline();
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const pending = pendingBackupCount(sales, backup);

  const backupNow = useCallback((): boolean => {
    if (!navigator.onLine || runningRef.current) return false;
    runningRef.current = true;
    setRunning(true);
    timer.current = window.setTimeout(() => {
      saveBackup({ lastBackupAt: new Date().toISOString() });
      runningRef.current = false;
      setRunning(false);
    }, BACKUP_DURATION_MS);
    return true;
  }, [saveBackup]);

  // Al volver internet (o al abrir con internet), respalda solo lo pendiente.
  useEffect(() => {
    if (!signedIn || !ready || !online || running || pending === 0) return;
    const id = window.setTimeout(() => { backupNow(); }, AUTO_BACKUP_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [signedIn, ready, online, running, pending, backupNow]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo(
    () => ({ lastBackupAt: backup.lastBackupAt, pending, running, online, backupNow }),
    [backup.lastBackupAt, pending, running, online, backupNow],
  );
  return <BackupContext.Provider value={value}>{children}</BackupContext.Provider>;
}

export function useBackup(): BackupApi {
  const ctx = useContext(BackupContext);
  if (!ctx) throw new Error('useBackup debe usarse dentro de <BackupProvider>');
  return ctx;
}
