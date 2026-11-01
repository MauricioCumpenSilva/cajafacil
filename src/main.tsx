import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import { AccountProvider } from './state/AccountContext.tsx';
import { CustomersProvider } from './state/CustomersContext.tsx';
import { BackupProvider } from './state/BackupContext.tsx';
import { SaleFlowProvider } from './state/SaleFlowContext.tsx';
import { SalesProvider } from './state/SalesContext.tsx';
import './styles/tokens.css';
import './styles/global.css';

// Modo sin conexión: el service worker guarda la app en el celular (solo en la versión publicada).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => { /* sigue funcionando sin él */ }); });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AccountProvider>
        <SalesProvider>
          <BackupProvider>
            <CustomersProvider>
              <SaleFlowProvider>
                <App />
              </SaleFlowProvider>
            </CustomersProvider>
          </BackupProvider>
        </SalesProvider>
      </AccountProvider>
    </HashRouter>
  </StrictMode>,
);
