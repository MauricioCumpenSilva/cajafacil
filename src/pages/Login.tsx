import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from '../state/AccountContext.tsx';
import { TextField } from '../ui/TextField.tsx';
import { LoadingScreen } from '../ui/Spinner.tsx';
import { BASE_LOCK_MS, secondsLeft } from '../domain/lockout.ts';

export function Login() {
  const { signIn, lockedUntil } = useAccount();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [noAccount, setNoAccount] = useState(false);
  const [entering, setEntering] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [justUnlocked, setJustUnlocked] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const remaining = lockedUntil === null ? 0 : Math.max(0, lockedUntil - now);
  const locked = remaining > 0;

  // Reloj de 1 segundo solo mientras dura el bloqueo.
  useEffect(() => {
    if (lockedUntil === null || lockedUntil <= Date.now()) return;
    setNow(Date.now());
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= lockedUntil) {
        window.clearInterval(id);
        setError(null);
        setPin('');
        setJustUnlocked(true);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [lockedUntil]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (locked || entering) return;
    setJustUnlocked(false);
    const r = signIn(phone, pin);
    if (r.ok) {
      setEntering(true);
      timer.current = window.setTimeout(() => navigate('/inicio', { replace: true }), 700);
      return;
    }
    setPin('');
    setError(r.message);
    setNoAccount(r.reason === 'sin-cuenta');
    setNow(Date.now());
  };

  if (entering) return <LoadingScreen text="Entrando…" />;

  const progress = Math.min(100, Math.round((remaining / Math.max(BASE_LOCK_MS, remaining)) * 100));

  return (
    <>
      <h1>Entrar</h1>
      <form onSubmit={submit} noValidate className="stack">
        <TextField id="login-celular" label="Tu celular" value={phone} onChange={setPhone}
          type="tel" inputMode="tel" autoComplete="tel" maxLength={11} />
        <TextField id="login-clave" label="Tu clave de 6 números" value={pin} onChange={setPin}
          type="password" inputMode="numeric" autoComplete="current-password" maxLength={6} />
        {locked ? (
          <div className="wait" role="status" aria-live="polite">
            <p className="wait__title"><span aria-hidden="true">⏳ </span>Espera {secondsLeft(remaining)} s para volver a intentar</p>
            <div className="wait__bar" aria-hidden="true"><div className="wait__fill" style={{ width: `${progress}%` }} /></div>
            <p className="wait__hint">Esto protege tu cuenta si alguien adivina tu clave.</p>
          </div>
        ) : error ? (
          <p className="field__error" role="alert"><span aria-hidden="true">⚠ </span>{error}</p>
        ) : null}
        {justUnlocked && !locked && <p className="status" role="status">Ya puedes intentar de nuevo.</p>}
        <button type="submit" className="btn btn--primary" disabled={locked} aria-disabled={locked}>
          {locked ? `Espera ${secondsLeft(remaining)} s` : 'Entrar'}
        </button>
        {noAccount && <Link to="/crear" className="btn">Crear mi cuenta</Link>}
      </form>
    </>
  );
}
