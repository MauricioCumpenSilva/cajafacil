import { PIN_LENGTH } from '../domain/account.ts';

interface Props { value: string; onChange: (value: string) => void }

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Teclado de clave: botones nativos (alcanzables con Tab/Enter) y progreso en texto. */
export function PinPad({ value, onChange }: Props) {
  const add = (d: string) => { if (value.length < PIN_LENGTH) onChange(value + d); };
  const del = () => onChange(value.slice(0, -1));
  return (
    <div>
      <p className="pin-dots" role="status" aria-live="polite">
        <span className="sr-only">{value.length} de {PIN_LENGTH} números escritos</span>
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <span key={i} aria-hidden="true" className={i < value.length ? 'pin-dot pin-dot--on' : 'pin-dot'} />
        ))}
      </p>
      <div className="keypad" role="group" aria-label="Teclado numérico">
        {KEYS.map((k) => (<button key={k} type="button" className="key" onClick={() => add(k)}>{k}</button>))}
        <span />
        <button type="button" className="key" onClick={() => add('0')}>0</button>
        <button type="button" className="key key--danger" onClick={del} aria-label="Borrar último número">
          <span aria-hidden="true">⌫</span>
        </button>
      </div>
    </div>
  );
}
