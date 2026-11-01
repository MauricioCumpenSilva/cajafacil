import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSaleFlow } from '../state/SaleFlowContext.tsx';
import { helpFor } from '../domain/guide.ts';
import { HelpNudge, HelpSheet } from './HelpSheet.tsx';
import { ProcessSteps } from './ProcessSteps.tsx';
import { SkipLink } from './SkipLink.tsx';
import { TopBar } from './TopBar.tsx';
import { useHelpNudge } from './useHelpNudge.ts';

export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { total } = useSaleFlow();
  const [helpOpen, setHelpOpen] = useState(false);
  const entry = helpFor(pathname);
  const nudge = useHelpNudge(pathname, !helpOpen);

  // Al cambiar de pantalla se cierra la ayuda anterior.
  useEffect(() => { setHelpOpen(false); }, [pathname]);

  /** Volver con sentido: no se pierde un monto sin avisar y no se regresa a pantallas ya cerradas. */
  const onBack = () => {
    if (pathname === '/venta') navigate(total > 0 ? '/venta/salir' : '/inicio');
    else if (pathname === '/venta/pago') navigate('/venta');
    else if (pathname === '/ventas' || pathname === '/ventas/anuladas' || pathname === '/balance' || pathname === '/fiados' || pathname === '/cuenta') navigate('/inicio');
    else if (pathname.startsWith('/fiados/cobrado/')) navigate('/fiados');
    else if (pathname === '/venta/listo' || pathname === '/venta/salir') navigate('/inicio');
    else navigate(-1);
  };

  const openHelp = () => { nudge.dismiss(); if (entry) setHelpOpen(true); else navigate('/ayuda'); };

  return (
    <>
      <SkipLink />
      <TopBar showBack={pathname !== '/' && pathname !== '/inicio'} onBack={onBack} onHelp={openHelp} />
      <main id="contenido" tabIndex={-1} className={helpOpen ? 'help-open' : undefined}>
        <ProcessSteps pathname={pathname} />
        <Outlet />
      </main>
      {nudge.reason && !helpOpen && entry && (
        <HelpNudge
          text={nudge.reason === 'first' ? 'Primera vez en esta pantalla. ¿Quieres que te muestre cómo se hace?' : '¿Necesitas ayuda con esta pantalla?'}
          onYes={openHelp} onNo={nudge.dismiss} />
      )}
      {helpOpen && entry && <HelpSheet key={pathname} entry={entry} onClose={() => setHelpOpen(false)} />}
    </>
  );
}
