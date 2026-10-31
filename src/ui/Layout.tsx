import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSaleFlow } from '../state/SaleFlowContext.tsx';
import { SkipLink } from './SkipLink.tsx';
import { TopBar } from './TopBar.tsx';

export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { total } = useSaleFlow();

  /** Volver con sentido: no se pierde un monto sin avisar y no se regresa a pantallas ya cerradas. */
  const onBack = () => {
    if (pathname === '/venta') navigate(total > 0 ? '/venta/salir' : '/inicio');
    else if (pathname === '/venta/pago') navigate('/venta');
    else if (pathname === '/venta/listo' || pathname === '/venta/salir') navigate('/inicio');
    else navigate(-1);
  };
  return (
    <>
      <SkipLink />
      <TopBar showBack={pathname !== '/' && pathname !== '/inicio'} onBack={onBack} />
      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
