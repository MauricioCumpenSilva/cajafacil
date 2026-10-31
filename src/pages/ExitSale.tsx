import { useNavigate } from 'react-router-dom';
import { useSaleFlow } from '../state/SaleFlowContext.tsx';

export function ExitSale() {
  const { reset } = useSaleFlow();
  const navigate = useNavigate();
  return (
    <div className="stack">
      <h1>¿Salir sin guardar?</h1>
      <p className="card">Si sales, el monto que escribiste se pierde.</p>
      <button type="button" className="btn btn--primary" onClick={() => navigate('/venta', { replace: true })}>Seguir con la venta</button>
      <button type="button" className="btn btn--danger" onClick={() => { reset(); navigate('/inicio', { replace: true }); }}>Salir sin guardar</button>
    </div>
  );
}
