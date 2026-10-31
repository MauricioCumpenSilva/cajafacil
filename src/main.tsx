import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import { AccountProvider } from './state/AccountContext.tsx';
import { SaleFlowProvider } from './state/SaleFlowContext.tsx';
import { SalesProvider } from './state/SalesContext.tsx';
import './styles/tokens.css';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AccountProvider>
        <SalesProvider>
          <SaleFlowProvider>
            <App />
          </SaleFlowProvider>
        </SalesProvider>
      </AccountProvider>
    </HashRouter>
  </StrictMode>,
);
