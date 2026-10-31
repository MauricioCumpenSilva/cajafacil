/** Primer elemento del DOM (criterio 9). No usa href="#..." porque la app enruta con hash. */
export function SkipLink() {
  return (
    <a
      className="skip-link"
      href="#contenido"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('contenido')?.focus();
      }}
    >
      Ir al contenido principal
    </a>
  );
}
