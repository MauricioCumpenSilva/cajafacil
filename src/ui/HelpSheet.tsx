import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { HelpEntry } from '../domain/guide.ts';

const HIGHLIGHT = 'help-target';

/**
 * Ventana de ayuda paso a paso. Resalta en pantalla el elemento del que habla cada paso
 * (borde que parpadea) para que el usuario vea QUÉ tocar, no solo lea el texto.
 */
export function HelpSheet({ entry, onClose }: { entry: HelpEntry; onClose: () => void }) {
  const [i, setI] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const step = entry.steps[i];
  const last = i === entry.steps.length - 1;

  useEffect(() => {
    const els = step.target ? Array.from(document.querySelectorAll<HTMLElement>(step.target)).slice(0, 1) : [];
    els.forEach((el) => {
      el.classList.add(HIGHLIGHT);
      const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
    });
    return () => els.forEach((el) => el.classList.remove(HIGHLIGHT));
  }, [step]);

  useEffect(() => {
    // Al cerrar, el foco vuelve al botón "?" que abrió la ayuda.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); opener?.focus?.(); };
  }, [onClose]);

  return (
    <div className="help-sheet" role="dialog" aria-modal="false" aria-labelledby="help-title">
      <div className="help-sheet__head">
        <h2 id="help-title" className="h2">Ayuda: {entry.title}</h2>
        <button type="button" className="btn btn--pill" ref={closeRef} onClick={onClose}>Cerrar</button>
      </div>
      <p className="help-sheet__count">Paso {i + 1} de {entry.steps.length}</p>
      <p className="help-sheet__text" role="status" aria-live="polite">{step.text}</p>
      <div className="btn-row">
        <button type="button" className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>Anterior</button>
        <button type="button" className="btn btn--primary" onClick={() => (last ? onClose() : setI(i + 1))}>
          {last ? 'Entendido' : 'Siguiente'}
        </button>
      </div>
      <Link to="/ayuda" className="help-sheet__all" onClick={onClose}>Ver toda la ayuda</Link>
    </div>
  );
}

/** Globo pequeño que ofrece ayuda sin tapar la pantalla. */
export function HelpNudge({ text, onYes, onNo }: { text: string; onYes: () => void; onNo: () => void }) {
  return (
    <div className="nudge" role="status" aria-live="polite">
      <p className="nudge__text"><span aria-hidden="true">💡 </span>{text}</p>
      <div className="btn-row">
        <button type="button" className="btn btn--pill" onClick={onYes}>Sí, muéstrame</button>
        <button type="button" className="btn btn--pill" onClick={onNo}>No, gracias</button>
      </div>
    </div>
  );
}
