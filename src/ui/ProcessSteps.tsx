import { stepFor } from '../domain/guide.ts';

/** "Paso 2 de 3 · Pago" con una barra de puntos: se muestra solo en pantallas que son parte de un proceso. */
export function ProcessSteps({ pathname }: { pathname: string }) {
  const info = stepFor(pathname);
  if (!info) return null;
  return (
    <nav className="process" aria-label={info.name}>
      <p className="step">Paso {info.index} de {info.total} · {info.label}</p>
      <ol className="process__dots">
        {info.labels.map((l, i) => (
          <li key={l} className={i + 1 < info.index ? 'dot dot--done' : i + 1 === info.index ? 'dot dot--now' : 'dot'}
            aria-current={i + 1 === info.index ? 'step' : undefined}>
            <span className="sr-only">{l}{i + 1 < info.index ? ' (hecho)' : ''}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
