import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './ui/Layout.tsx';
import { Home } from './pages/Home.tsx';
import { Pending } from './pages/Pending.tsx';
import { Welcome } from './pages/Welcome.tsx';
import { CreateAccount } from './pages/CreateAccount.tsx';
import { VerifyCode } from './pages/VerifyCode.tsx';
import { CreatePin } from './pages/CreatePin.tsx';
import { ChooseAvatar } from './pages/ChooseAvatar.tsx';
import { Login } from './pages/Login.tsx';
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
        <Route path="ayuda" element={<Pending title="Ayuda" stage={5} />} />
        <Route element={<RequireAccount />}>
        <Route path="inicio" element={<Home />} />
        {/* Etapa 3: venta */}
        <Route path="venta" element={<Pending title="Nueva venta" stage={3} />} />
        <Route path="venta/pago" element={<Pending title="¿Cómo pagó?" stage={3} />} />
        <Route path="venta/listo" element={<Pending title="Venta guardada" stage={3} />} />
        {/* Etapa 4: historial y balance */}
        <Route path="ventas" element={<Pending title="Ventas de hoy" stage={4} />} />
        <Route path="ventas/:id" element={<Pending title="Detalle de la venta" stage={4} />} />
        <Route path="balance" element={<Pending title="Balance" stage={4} />} />
        {/* Etapa 5: fiados y cuenta */}
        <Route path="fiados" element={<Pending title="Fiados" stage={5} />} />
        <Route path="cuenta" element={<Pending title="Mi cuenta" stage={5} />} />
        </Route>
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Route>
    </Routes>
  );
}
