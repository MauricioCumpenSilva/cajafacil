import type { Sale } from './sale.ts';
import { lastActivity } from './sale.ts';

/** Respaldo SIMULADO: en el prototipo no se envía nada a un servidor, solo se registra la hora. */
export interface BackupState { lastBackupAt: string | null }
export const initialBackup: BackupState = { lastBackupAt: null };

export const BACKUP_DURATION_MS = 1500;
export const AUTO_BACKUP_DELAY_MS = 2000;

/** Cuántas ventas tienen cambios desde el último respaldo. */
export function pendingBackupCount(sales: readonly Sale[], b: BackupState): number {
  if (b.lastBackupAt === null) return sales.length;
  const last = b.lastBackupAt;
  return sales.filter((s) => lastActivity(s) > last).length;
}

export function isValidBackup(x: unknown): x is BackupState {
  if (typeof x !== 'object' || x === null) return false;
  const v = (x as Record<string, unknown>).lastBackupAt;
  return v === null || (typeof v === 'string' && !Number.isNaN(Date.parse(v)));
}

/** Texto para la pantalla; nunca depende solo del color. */
export function backupLabel(pending: number, online: boolean, lastBackupAt: string | null): string {
  if (pending === 0) return lastBackupAt ? 'Todo respaldado' : 'Aún no hay ventas que respaldar';
  const n = pending === 1 ? '1 venta por respaldar' : `${pending} ventas por respaldar`;
  return online ? n : `${n} · se respaldará cuando vuelva internet`;
}
