import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSaleFlow } from '../state/SaleFlowContext.tsx';
import { breakdownText, canContinue, SHORTCUTS_CENTS } from '../domain/calculator.ts';
import { ERROR_MESSAGES } from '../domain/errors.ts';
import { formatSoles } from '../domain/money.ts';

const DIGIT_ROWS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']];

const shortcutLabel = (c: number) => (c % 100 === 0 ? String(c / 100) : (c / 100).toFixed(2));

export function NewSale() {
  const { calc, dispatch, total } = useSaleFlow();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const breakdown = breakdownText(calc);

  const edit = (action: Parameters<typeof dispatch>[0]) => { setError(null); dispatch(action); };

  const next = () => {
    if (!canContinue(calc)) { setError(ERROR_MESSAGES.MONTO_INVALIDO); return; }
    navigate('/venta/pago');
  };

  return (
    <>
      <h1>¿Cuánto es la venta?</h1>

      <div className="display" aria-live="polite">
        <span className="sr-only">Total de la venta: </span>
        <output className="display__amount">{formatSoles(total)}</output>
        {breakdown && <p className="display__breakdown">Suma: {breakdown}</p>}
      </div>

      <p className="field__hint" id="atajos-ayuda">Atajos (se suman al monto)</p>
      <div className="shortcuts" role="group" aria-labelledby="atajos-ayuda">
        {SHORTCUTS_CENTS.map((c) => (
          <button key={c} type="button" className="chip chip--info" aria-label={`Sumar ${formatSoles(c)}`}
            onClick={() => edit({ type: 'preset', cents: c })}>
            {shortcutLabel(c)}
          </button>
        ))}
      </div>

      <div className="keypad" role="group" aria-label="Teclado numérico">
        {DIGIT_ROWS.flat().map((d) => (
          <button key={d} type="button" className="key" onClick={() => edit({ type: 'digit', digit: Number(d) })}>{d}</button>
        ))}
      </div>
      <div className="keypad keypad--4">
        <button type="button" className="key" aria-label="Punto decimal" onClick={() => edit({ type: 'dot' })}>.</button>
        <button type="button" className="key" onClick={() => edit({ type: 'digit', digit: 0 })}>0</button>
        <button type="button" className="key key--danger" aria-label="Borrar último dígito" onClick={() => edit({ type: 'backspace' })}>
          <span aria-hidden="true">⌫</span>
        </button>
        <button type="button" className="key key--plus" aria-label="Sumar lo escrito" onClick={() => edit({ type: 'plus' })}>+</button>
      </div>

      {error && <p className="field__error" role="alert"><span aria-hidden="true">⚠ </span>{error}</p>}
      <button type="button" className="btn btn--primary" onClick={next}>Siguiente</button>
    </>
  );
}
