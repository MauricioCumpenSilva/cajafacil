import { useNavigate } from 'react-router-dom';

interface Props {
  /** La pantalla de Inicio no muestra "Volver". */
  showBack?: boolean;
  /** Acción de Volver; por defecto regresa una pantalla. */
  onBack?: () => void;
  /** Abre la ayuda de esta pantalla. */
  onHelp?: () => void;
}

export function TopBar({ showBack = true, onBack, onHelp }: Props) {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      {showBack ? (
        <button type="button" className="btn btn--pill" onClick={() => (onBack ? onBack() : navigate(-1))}>
          <span aria-hidden="true">←</span> Volver
        </button>
      ) : (
        <span />
      )}
      <button type="button" className="btn btn--round" aria-label="Ayuda" onClick={() => (onHelp ? onHelp() : navigate('/ayuda'))}>
        <span aria-hidden="true">?</span>
      </button>
    </header>
  );
}
