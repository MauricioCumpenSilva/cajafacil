import { useNavigate } from 'react-router-dom';
import { useAccount } from '../state/AccountContext.tsx';
import { PIN_LENGTH, validatePin } from '../domain/account.ts';
import { PinPad } from '../ui/PinPad.tsx';

export function CreatePin() {
  const { draft, updateDraft } = useAccount();
  const navigate = useNavigate();
  const complete = validatePin(draft.pin) === null;
  return (
    <>
      <h1>Tu clave</h1>
      <p>Elige {PIN_LENGTH} números que recuerdes.</p>
      <PinPad value={draft.pin} onChange={(v) => updateDraft({ pin: v })} />
      {!complete && <p role="status">Faltan {PIN_LENGTH - draft.pin.length} números.</p>}
      <button type="button" className="btn btn--primary" disabled={!complete} onClick={() => navigate('/imagen')}>
        Continuar
      </button>
    </>
  );
}
