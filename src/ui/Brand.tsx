/** Logo y avatares como SVG propios (sin descargas, funcionan sin internet). */
export function Logo({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" role="img" aria-label="Logo de CajaFácil: una caja registradora con el símbolo de sol">
      <rect x="4" y="4" width="64" height="64" rx="16" fill="#1b7f3b" />
      <rect x="16" y="22" width="40" height="30" rx="5" fill="#fff" />
      <rect x="22" y="14" width="28" height="10" rx="3" fill="#fff" />
      <text x="36" y="44" textAnchor="middle" fontSize="16" fontWeight="800" fill="#1b7f3b" fontFamily="system-ui, sans-serif">S/</text>
    </svg>
  );
}

export function AvatarImage({ kind, size = 88 }: { kind: 'bodeguero' | 'bodeguera'; size?: number }) {
  const woman = kind === 'bodeguera';
  return (
    <svg width={size} height={size} viewBox="0 0 88 88" role="img"
      aria-label={woman ? 'Imagen de una bodeguera con delantal verde' : 'Imagen de un bodeguero con delantal verde'}>
      <circle cx="44" cy="44" r="42" fill="#e8f3ea" />
      {woman && <path d="M20 46c0-20 10-30 24-30s24 10 24 30c0 8-3 16-6 20H26c-3-4-6-12-6-20z" fill="#3b2a20" />}
      <circle cx="44" cy="38" r="15" fill="#f1c9a5" />
      {!woman && <path d="M28 34c2-12 10-16 16-16s14 4 16 16c-6-6-12-7-16-7s-10 1-16 7z" fill="#3b2a20" />}
      <circle cx="39" cy="38" r="2" fill="#1f2a37" /><circle cx="49" cy="38" r="2" fill="#1f2a37" />
      <path d="M39 45q5 4 10 0" stroke="#1f2a37" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M18 84c2-16 12-24 26-24s24 8 26 24z" fill="#1b7f3b" />
      <rect x="32" y="64" width="24" height="20" rx="4" fill="#fff" opacity=".9" />
    </svg>
  );
}
