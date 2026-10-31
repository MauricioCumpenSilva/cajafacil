import { useNavigate } from 'react-router-dom';
import { useAccount } from '../state/AccountContext.tsx';
import type { Avatar } from '../domain/account.ts';
import { AvatarImage } from '../ui/Brand.tsx';

const OPTIONS: { kind: Avatar; label: string }[] = [
  { kind: 'bodeguero', label: 'Bodeguero' },
  { kind: 'bodeguera', label: 'Bodeguera' },
];

export function ChooseAvatar() {
  const { draft, updateDraft, finishSignUp } = useAccount();
  const navigate = useNavigate();
  const start = () => { finishSignUp(); navigate('/inicio', { replace: true }); };
  return (
    <>
      <h1>Tu imagen</h1>
      <fieldset className="avatar-set">
        <legend>Elige la imagen que más se parezca a ti</legend>
        {OPTIONS.map((o) => (
          <label key={o.kind} className={draft.avatar === o.kind ? 'avatar-option avatar-option--on' : 'avatar-option'}>
            <input type="radio" name="avatar" value={o.kind} checked={draft.avatar === o.kind}
              onChange={() => updateDraft({ avatar: o.kind })} className="sr-only" />
            <AvatarImage kind={o.kind} />
            <span>{o.label}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" className="btn btn--primary" onClick={start}>Empezar</button>
    </>
  );
}
