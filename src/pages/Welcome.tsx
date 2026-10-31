import { Link, Navigate } from 'react-router-dom';
import { useAccount } from '../state/AccountContext.tsx';
import { Logo } from '../ui/Brand.tsx';

export function Welcome() {
  const { signedIn } = useAccount();
  if (signedIn) return <Navigate to="/inicio" replace />;
  return (
    <div className="stack" style={{ textAlign: 'center', paddingTop: 'var(--space-4)' }}>
      <div style={{ display: 'grid', justifyItems: 'center' }}><Logo size={96} /></div>
      <h1>CajaFácil</h1>
      <p>Anota tus ventas del día y mira cuánto vendiste, sin cuaderno y sin internet.</p>
      <Link to="/crear" className="btn btn--primary">Crear mi cuenta</Link>
      <Link to="/entrar" className="btn">Ya tengo cuenta</Link>
    </div>
  );
}
