import { Outlet, useLocation } from 'react-router-dom';
import { SkipLink } from './SkipLink.tsx';
import { TopBar } from './TopBar.tsx';

export function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      <SkipLink />
      <TopBar showBack={pathname !== '/inicio'} />
      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
