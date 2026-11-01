import type { Account } from '../domain/account.ts';
import type { LockoutState } from '../domain/lockout.ts';
import { initialLockout, isValidLockout } from '../domain/lockout.ts';
import type { BackupState } from '../domain/backup.ts';
import { initialBackup, isValidBackup } from '../domain/backup.ts';

export interface AccountRepository {
  load(): Account | null;
  save(account: Account): void;
  isSignedIn(): boolean;
  setSignedIn(value: boolean): void;
  loadLockout(): LockoutState;
  saveLockout(state: LockoutState): void;
  loadBackup(): BackupState;
  saveBackup(state: BackupState): void;
}

export class InMemoryAccountRepository implements AccountRepository {
  private account: Account | null = null;
  private signed = false;
  load() { return this.account; }
  save(a: Account) { this.account = a; }
  isSignedIn() { return this.signed; }
  setSignedIn(v: boolean) { this.signed = v; }
  private lockout: LockoutState = initialLockout;
  loadLockout() { return this.lockout; }
  saveLockout(l: LockoutState) { this.lockout = l; }
  private backup: BackupState = initialBackup;
  loadBackup() { return this.backup; }
  saveBackup(b: BackupState) { this.backup = b; }
}

const ACCOUNT_KEY = 'cajafacil.account.v1';
const SESSION_KEY = 'cajafacil.session.v1';
const LOCKOUT_KEY = 'cajafacil.lockout.v1';
const BACKUP_KEY = 'cajafacil.backup.v1';

export class LocalStorageAccountRepository implements AccountRepository {
  private account: Account | null | undefined;
  private signed: boolean | undefined;

  load(): Account | null {
    if (this.account !== undefined) return this.account;
    try {
      const raw = globalThis.localStorage?.getItem(ACCOUNT_KEY);
      this.account = raw ? (JSON.parse(raw) as Account) : null;
    } catch {
      this.account = null;
    }
    return this.account;
  }

  save(a: Account): void {
    this.account = a;
    try { globalThis.localStorage?.setItem(ACCOUNT_KEY, JSON.stringify(a)); } catch { /* en memoria */ }
  }

  isSignedIn(): boolean {
    if (this.signed !== undefined) return this.signed;
    try { this.signed = globalThis.localStorage?.getItem(SESSION_KEY) === '1'; } catch { this.signed = false; }
    return this.signed ?? false;
  }

  setSignedIn(v: boolean): void {
    this.signed = v;
    try { globalThis.localStorage?.setItem(SESSION_KEY, v ? '1' : '0'); } catch { /* en memoria */ }
  }

  private lockout: LockoutState | undefined;

  loadLockout(): LockoutState {
    if (this.lockout) return this.lockout;
    try {
      const raw = globalThis.localStorage?.getItem(LOCKOUT_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      this.lockout = isValidLockout(parsed) ? parsed : initialLockout;
    } catch {
      this.lockout = initialLockout;
    }
    return this.lockout;
  }

  saveLockout(l: LockoutState): void {
    this.lockout = l;
    try { globalThis.localStorage?.setItem(LOCKOUT_KEY, JSON.stringify(l)); } catch { /* en memoria */ }
  }

  private backup: BackupState | undefined;

  loadBackup(): BackupState {
    if (this.backup) return this.backup;
    try {
      const raw = globalThis.localStorage?.getItem(BACKUP_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      this.backup = isValidBackup(parsed) ? parsed : initialBackup;
    } catch {
      this.backup = initialBackup;
    }
    return this.backup;
  }

  saveBackup(b: BackupState): void {
    this.backup = b;
    try { globalThis.localStorage?.setItem(BACKUP_KEY, JSON.stringify(b)); } catch { /* en memoria */ }
  }
}
