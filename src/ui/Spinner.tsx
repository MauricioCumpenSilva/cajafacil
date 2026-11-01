/** Rueda de espera. Decorativa: el texto que la acompaña es lo que se anuncia. */
export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

/** Pantalla completa de espera, anunciada a lectores de pantalla. */
export function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <Spinner />
      <p className="loading__text">{text}</p>
    </div>
  );
}
