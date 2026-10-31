import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../state/AccountContext.tsx';
import { validateName, validatePhone } from '../domain/account.ts';
import { TextField } from '../ui/TextField.tsx';

export function CreateAccount() {
  const { draft, updateDraft } = useAccount();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ name?: string | null; phone?: string | null }>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = { name: validateName(draft.name), phone: validatePhone(draft.phone) };
    setErrors(next);
    if (!next.name && !next.phone) navigate('/codigo');
  };

  return (
    <>
      <h1>Tus datos</h1>
      <form onSubmit={submit} noValidate className="stack">
        <TextField id="nombre" label="Tu nombre" value={draft.name} onChange={(v) => updateDraft({ name: v })}
          autoComplete="name" error={errors.name} />
        <TextField id="celular" label="Tu celular" value={draft.phone} onChange={(v) => updateDraft({ phone: v })}
          type="tel" inputMode="tel" autoComplete="tel" maxLength={11} error={errors.phone}
          hint="Son 9 números y empieza con 9." />
        <button type="submit" className="btn btn--primary">Continuar</button>
      </form>
    </>
  );
}
