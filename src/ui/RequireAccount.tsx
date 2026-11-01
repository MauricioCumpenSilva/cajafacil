import { Navigate, Outlet } from 'react-router-dom';
import { useAccount } from '../state/AccountContext.tsx';
import { useSales } from '../state/SalesContext.tsx';
import { LoadingScreen } from './Spinner.tsx';

export function RequireAccount() {
  const { signedIn } = useAccount();
  const { ready } = useSales();
  if (!signedIn) return <Navigate to="/" replace />;
  if (!ready) return <LoadingScreen text="Abriendo tus ventas…" />;
  return <Outlet />;
}
