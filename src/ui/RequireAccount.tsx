import { Navigate, Outlet } from 'react-router-dom';
import { useAccount } from '../state/AccountContext.tsx';

/** Las pantallas internas solo se abren con la sesión iniciada. */
export function RequireAccount() {
  const { signedIn } = useAccount();
  return signedIn ? <Outlet /> : <Navigate to="/" replace />;
}
