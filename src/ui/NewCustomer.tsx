import { useState } from 'react';
import type { FormEvent } from 'react';
import { useCustomers } from '../state/CustomersContext.tsx';
import { TextField } from './TextField.tsx';
import { MAX_NAME } from '../domain/customer.ts';

/** "Agregar cliente nuevo": se abre al tocarlo, guarda y deja elegido al cliente. */
export function NewCustomer({ onAdded }: { onAdded: (id: string) => void }) {
  const { add } = useCustomers();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return <button type="button" className="btn" onClick={() => setOpen(true)}>+ Agregar cliente nuevo</button>;
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = add(name);
    if (!r.ok) { setError(r.message); return; }
    onAdded(r.customer.id);
    setName('');
    setError(null);
    setOpen(false);
  };

  return (
    <form onSubmit={submit} noValidate className="stack card" aria-label="Cliente nuevo">
      <TextField id="cliente-nuevo" label="Nombre del cliente" value={name} onChange={(v) => { setName(v); setError(null); }}
        error={error} autoComplete="off" maxLength={MAX_NAME} hint="Ejemplo: Doña Rosa" />
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => { setOpen(false); setName(''); setError(null); }}>Cancelar</button>
        <button type="submit" className="btn btn--primary">Guardar cliente</button>
      </div>
    </form>
  );
}
