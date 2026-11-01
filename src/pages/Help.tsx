import { HELP, ROUTE_PATTERNS } from '../domain/guide.ts';

/** Toda la ayuda en un solo lugar, paso a paso, para leerla con calma. */
export function Help() {
  const topics = ROUTE_PATTERNS.map((p) => ({ p, e: HELP[p] })).filter((x) => x.e?.topic);
  return (
    <>
      <h1>Ayuda</h1>
      <p style={{ margin: 0 }}>Toca un tema para ver los pasos. En cada pantalla también puedes tocar el botón <strong>?</strong> y te mostramos qué tocar.</p>
      <div className="stack">
        {topics.map(({ p, e }) => e && (
          <details key={p} className="card help-topic">
            <summary>{e.title}</summary>
            <ol className="help-steps">
              {e.steps.map((s) => <li key={s.text}>{s.text}</li>)}
            </ol>
          </details>
        ))}
      </div>
    </>
  );
}
