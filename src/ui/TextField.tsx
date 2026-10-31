import type { HTMLInputTypeAttribute } from 'react';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: 'text' | 'numeric' | 'tel';
  autoComplete?: string;
  maxLength?: number;
}

/** Campo con label visible (criterio 8) y error en texto enlazado al input (criterio 7). */
export function TextField({ id, label, value, onChange, error, hint, type = 'text', inputMode, autoComplete, maxLength }: Props) {
  const hintId = `${id}-hint`;
  const errId = `${id}-error`;
  const describedBy = [hint ? hintId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">{label}</label>
      {hint && <p id={hintId} className="field__hint">{hint}</p>}
      <input
        id={id}
        className={error ? 'field__input field__input--error' : 'field__input'}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p id={errId} className="field__error" role="alert"><span aria-hidden="true">⚠ </span>{error}</p>}
    </div>
  );
}
