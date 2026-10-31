import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_CODE, validateCode } from '../domain/account.ts';
import { TextField } from '../ui/TextField.tsx';

export function VerifyCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateCode(code);
    setError(err);
    if (!err) navigate('/clave');
  };

  return (
    <>
      <h1>Código</h1>
      <form onSubmit={submit} noValidate className="stack">
        <TextField id="codigo" label="Código de 6 números" value={code} onChange={setCode}
          inputMode="numeric" autoComplete="one-time-code" maxLength={7} error={error}
          hint={`En el prototipo el código es ${DEMO_CODE}.`} />
        <button type="button" className="btn" onClick={() => { setCode(DEMO_CODE); setError(null); }}>
          Usar código de demostración
        </button>
        <button type="submit" className="btn btn--primary">Continuar</button>
      </form>
    </>
  );
}
