import type { Account } from '../domain/account.ts';

export interface AccountRepository {
  load(): Account | null;
  save(account: Account): void;
  isSignedIn(): boolean;
  setSignedIn(value: boolean): void;
}

export class InMemoryAccountRepository implements AccountRepository {
  private account: Account | null = null;
  private signed = false;
  load() { return this.account; }
  save(a: Account) { this.account = a; }
  isSignedIn() { return this.signed; }
  setSignedIn(v: boolean) { this.signed = v; }
}

const ACCOUNT_KEY = 'cajafacil.account.v1';
const SESSION_KEY = 'cajafacil.session.v1';

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
}
