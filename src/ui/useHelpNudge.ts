import { useCallback, useEffect, useState } from 'react';
import { IDLE_HELP_MS, matchPattern, shouldOfferFirstTime } from '../domain/guide.ts';
import { helpFor } from '../domain/guide.ts';

const KEY = 'cajafacil.helpseen.v1';

function readSeen(): string[] {
  try {
    const v: unknown = JSON.parse(globalThis.localStorage?.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch { return []; }
}
function writeSeen(list: string[]) { try { globalThis.localStorage?.setItem(KEY, JSON.stringify(list)); } catch { /* sin guardar */ } }

export type NudgeReason = 'first' | 'idle';

/**
 * Decide cuándo ofrecer ayuda: la primera vez que se entra a una pantalla importante,
 * o si la persona lleva un rato sin tocar nada (puede estar perdida).
 */
export function useHelpNudge(pathname: string, enabled: boolean) {
  const [reason, setReason] = useState<NudgeReason | null>(null);

  const markSeen = useCallback(() => {
    const p = matchPattern(pathname);
    if (!p) return;
    const seen = readSeen();
    if (!seen.includes(p)) writeSeen([...seen, p]);
  }, [pathname]);

  useEffect(() => {
    setReason(null);
    if (!enabled || !helpFor(pathname)) return;
    let idle: number | undefined;
    const first = shouldOfferFirstTime(pathname, readSeen())
      ? window.setTimeout(() => setReason('first'), 1200) : undefined;
    const arm = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(() => setReason((r) => r ?? 'idle'), IDLE_HELP_MS);
    };
    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    arm();
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(idle);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, [pathname, enabled]);

  const dismiss = useCallback(() => { markSeen(); setReason(null); }, [markSeen]);
  return { reason, dismiss };
}
