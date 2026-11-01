import { useId } from 'react';

/** Logo y avatares como SVG propios (dibujos originales; sin descargas, funcionan sin internet). */
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

const SKIN = '#f1c9a5';
const HAIR = '#3b2a20';
const INK = '#1f2a37';

interface AvatarProps {
  kind: 'bodeguero' | 'bodeguera';
  size?: number;
  /** Cuando el nombre ya está escrito al lado, la imagen no se anuncia dos veces. */
  decorative?: boolean;
}

/** Bodeguero (gorra verde, bigote) y bodeguera (cabello largo, aretes). Ambos con delantal verde. */
export function AvatarImage({ kind, size = 88, decorative = false }: AvatarProps) {
  const woman = kind === 'bodeguera';
  const clipId = `clip-${useId().replace(/:/g, '')}`;
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': woman ? 'Imagen de una bodeguera con delantal verde' : 'Imagen de un bodeguero con gorra y delantal verde' };
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" focusable="false" {...a11y}>
      <circle cx="60" cy="60" r="58" fill="#e8f3ea" stroke="#1b7f3b" strokeWidth="3" />
      <clipPath id={clipId}><circle cx="60" cy="60" r="56" /></clipPath>
      <g clipPath={`url(#${clipId})`}>
        {woman && <path d="M34 52c0-24 10-34 26-34s26 10 26 34c0 16-3 26-6 32H40c-3-6-6-16-6-32z" fill={HAIR} />}
        {/* hombros y camisa */}
        <path d="M10 124c3-24 21-38 50-38s47 14 50 38z" fill="#f7f3ea" stroke="#d8d0c0" strokeWidth="1.5" />
        {/* delantal */}
        <path d="M38 88c6 4 14 6 22 6s16-2 22-6l8 36H30z" fill="#1b7f3b" />
        <rect x="47" y="104" width="26" height="14" rx="3" fill="#166a31" />
        <path d="M44 88l-4-12M76 88l4-12" stroke="#1b7f3b" strokeWidth="4" strokeLinecap="round" />
        {/* cuello y cabeza */}
        <rect x="52" y="70" width="16" height="18" rx="6" fill="#dcaa80" />
        <ellipse cx="60" cy="52" rx="20" ry="23" fill={SKIN} />
        <circle cx="40" cy="54" r="4" fill={SKIN} /><circle cx="80" cy="54" r="4" fill={SKIN} />
        {/* ojos y cejas */}
        <circle cx="52" cy="53" r="2.6" fill={INK} /><circle cx="68" cy="53" r="2.6" fill={INK} />
        <path d="M47 47q5-3 9 0M64 47q5-3 9 0" stroke={HAIR} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M58 56q2 5 4 0" stroke="#c48f68" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {woman ? (
          <>
            <path d="M40 48c2-14 10-20 20-20s18 6 20 20c-8-4-14-11-20-11s-12 7-20 11z" fill={HAIR} />
            <circle cx="39" cy="63" r="3" fill="#e0a82e" /><circle cx="81" cy="63" r="3" fill="#e0a82e" />
            <path d="M52 64q8 7 16 0" stroke="#b4443a" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M38 44c2-16 10-24 22-24s20 8 22 24z" fill="#1b7f3b" />
            <path d="M34 44h52q6 0 8 5H34z" fill="#166a31" />
            <path d="M49 63q5-5 11-2q6-3 11 2q-5 5-11 3q-6 2-11-3z" fill={HAIR} />
            <path d="M53 70q7 5 14 0" stroke="#b4443a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  );
}
