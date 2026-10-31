import { Link, useNavigate } from 'react-router-dom';

interface Props {
  /** La pantalla de Inicio no muestra "Volver". */
  showBack?: boolean;
}

export function TopBar({ showBack = true }: Props) {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      {showBack ? (
        <button type="button" className="btn btn--pill" onClick={() => navigate(-1)}>
          <span aria-hidden="true">←</span> Volver
        </button>
      ) : (
        <span />
      )}
      <Link to="/ayuda" className="btn btn--round" aria-label="Ayuda">
        <span aria-hidden="true">?</span>
      </Link>
    </header>
  );
}
