import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './ui/Layout.tsx';
import { Home } from './pages/Home.tsx';
import { Welcome } from './pages/Welcome.tsx';
import { CreateAccount } from './pages/CreateAccount.tsx';
import { VerifyCode } from './pages/VerifyCode.tsx';
import { CreatePin } from './pages/CreatePin.tsx';
import { ChooseAvatar } from './pages/ChooseAvatar.tsx';
import { Login } from './pages/Login.tsx';
import { NewSale } from './pages/NewSale.tsx';
import { Payment } from './pages/Payment.tsx';
import { SaleDone } from './pages/SaleDone.tsx';
import { ExitSale } from './pages/ExitSale.tsx';
import { SalesList } from './pages/SalesList.tsx';
import { SaleDetail } from './pages/SaleDetail.tsx';
import { ConfirmVoid } from './pages/ConfirmVoid.tsx';
import { Balance } from './pages/Balance.tsx';
import { Fiados } from './pages/Fiados.tsx';
import { FiadoCustomer } from './pages/FiadoCustomer.tsx';
import { CollectFiado } from './pages/CollectFiado.tsx';
import { FiadoCollected } from './pages/FiadoCollected.tsx';
import { AccountPage } from './pages/AccountPage.tsx';
import { Help } from './pages/Help.tsx';
import { RequireAccount } from './ui/RequireAccount.tsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Welcome />} />
        <Route path="crear" element={<CreateAccount />} />
        <Route path="codigo" element={<VerifyCode />} />
        <Route path="clave" element={<CreatePin />} />
        <Route path="imagen" element={<ChooseAvatar />} />
        <Route path="entrar" element={<Login />} />
        <Route path="ayuda" element={<Help />} />
        <Route element={<RequireAccount />}>
        <Route path="inicio" element={<Home />} />
        {/* Etapa 3: venta */}
        <Route path="venta" element={<NewSale />} />
        <Route path="venta/pago" element={<Payment />} />
        <Route path="venta/listo" element={<SaleDone />} />
        <Route path="venta/salir" element={<ExitSale />} />
        {/* Etapa 4: historial y balance */}
        <Route path="ventas" element={<SalesList />} />
        <Route path="ventas/anuladas" element={<SalesList voided />} />
        <Route path="ventas/:id" element={<SaleDetail />} />
        <Route path="ventas/:id/anular" element={<ConfirmVoid />} />
        <Route path="balance" element={<Balance />} />
        {/* Etapa 5: fiados y cuenta */}
        <Route path="fiados" element={<Fiados />} />
        <Route path="fiados/:cliente" element={<FiadoCustomer />} />
        <Route path="fiados/cobro/:id" element={<CollectFiado />} />
        <Route path="fiados/cobrado/:id" element={<FiadoCollected />} />
        <Route path="cuenta" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Route>
    </Routes>
  );
}
