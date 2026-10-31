import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from '../state/AccountContext.tsx';
import { TextField } from '../ui/TextField.tsx';

export function Login() {
  const { signIn } = useAccount();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [noAccount, setNoAccount] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = signIn(phone, pin);
    if (r.ok) { navigate('/inicio', { replace: true }); return; }
    setError(r.message);
    setNoAccount(r.reason === 'sin-cuenta');
  };

  return (
    <>
      <h1>Entrar</h1>
      <form onSubmit={submit} noValidate className="stack">
        <TextField id="login-celular" label="Tu celular" value={phone} onChange={setPhone}
          type="tel" inputMode="tel" autoComplete="tel" maxLength={11} />
        <TextField id="login-clave" label="Tu clave de 6 números" value={pin} onChange={setPin}
          type="password" inputMode="numeric" autoComplete="current-password" maxLength={6} />
        {error && <p className="field__error" role="alert"><span aria-hidden="true">⚠ </span>{error}</p>}
        <button type="submit" className="btn btn--primary">Entrar</button>
        {noAccount && <Link to="/crear" className="btn">Crear mi cuenta</Link>}
      </form>
    </>
  );
}
