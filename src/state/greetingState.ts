/** Recuerda cuándo se abrió la app por última vez y si ya se saludó en esta apertura. */
const KEY = 'cajafacil.visit.v1';
let announced = false;

export const wasAnnounced = (): boolean => announced;
export const markAnnounced = (): void => { announced = true; };
/** Al cerrar sesión se vuelve a saludar la próxima vez que se entre. */
export const resetAnnounced = (): void => { announced = false; };

export function readLastVisitDay(): string | null {
  try {
    const v = globalThis.localStorage?.getItem(KEY);
    return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
  } catch { return null; }
}
export function writeLastVisitDay(day: string): void {
  try { globalThis.localStorage?.setItem(KEY, day); } catch { /* sin guardar */ }
}
