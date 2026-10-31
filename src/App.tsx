import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './ui/Layout.tsx';
import { Home } from './pages/Home.tsx';
import { Pending } from './pages/Pending.tsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/inicio" replace />} />
        <Route path="inicio" element={<Home />} />
        {/* Etapa 2: cuenta y acceso */}
        <Route path="crear" element={<Pending title="Crear cuenta" stage={2} />} />
        <Route path="entrar" element={<Pending title="Entrar" stage={2} />} />
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
        <Route path="ayuda" element={<Pending title="Ayuda" stage={5} />} />
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Route>
    </Routes>
  );
}
