import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AccountRepository } from '../data/accountRepository.ts';
import { LocalStorageAccountRepository } from '../data/accountRepository.ts';
import type { Account, Avatar, LoginResult } from '../domain/account.ts';
import { checkLogin, digitsOnly } from '../domain/account.ts';

/** Datos del registro mientras el usuario avanza por los pasos de crear cuenta. */
export interface SignUpDraft {
  name: string;
  phone: string;
  pin: string;
  avatar: Avatar;
}

const emptyDraft: SignUpDraft = { name: '', phone: '', pin: '', avatar: 'bodeguera' };

interface AccountApi {
  account: Account | null;
  signedIn: boolean;
  draft: SignUpDraft;
  updateDraft(patch: Partial<SignUpDraft>): void;
  finishSignUp(): void;
  signIn(phone: string, pin: string): LoginResult;
  signOut(): void;
}

const AccountContext = createContext<AccountApi | null>(null);

export function AccountProvider({ children, repo }: { children: ReactNode; repo?: AccountRepository }) {
  const [repository] = useState<AccountRepository>(() => repo ?? new LocalStorageAccountRepository());
  const [account, setAccount] = useState<Account | null>(() => repository.load());
  const [signedIn, setSignedIn] = useState<boolean>(() => repository.isSignedIn() && repository.load() !== null);
  const [draft, setDraft] = useState<SignUpDraft>(emptyDraft);

  const updateDraft = useCallback((patch: Partial<SignUpDraft>) => setDraft((d) => ({ ...d, ...patch })), []);

  const finishSignUp = useCallback(() => {
    const created: Account = { name: draft.name.trim(), phone: digitsOnly(draft.phone), pin: draft.pin, avatar: draft.avatar };
    repository.save(created);
    repository.setSignedIn(true);
    setAccount(created);
    setSignedIn(true);
    setDraft(emptyDraft);
  }, [draft, repository]);

  const signIn = useCallback((phone: string, pin: string): LoginResult => {
    const result = checkLogin(account, phone, pin);
    if (result.ok) { repository.setSignedIn(true); setSignedIn(true); }
    return result;
  }, [account, repository]);

  const signOut = useCallback(() => { repository.setSignedIn(false); setSignedIn(false); }, [repository]);

  const value = useMemo(
    () => ({ account, signedIn, draft, updateDraft, finishSignUp, signIn, signOut }),
    [account, signedIn, draft, updateDraft, finishSignUp, signIn, signOut],
  );
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountApi {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount debe usarse dentro de <AccountProvider>');
  return ctx;
}
