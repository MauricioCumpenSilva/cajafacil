interface Props { title: string; stage: number }

/** Marcador de pantallas que se construyen en etapas siguientes (ver README). */
export function Pending({ title, stage }: Props) {
  return (
    <>
      <h1>{title}</h1>
      <p className="card">Esta pantalla se construye en la etapa {stage}.</p>
    </>
  );
}
