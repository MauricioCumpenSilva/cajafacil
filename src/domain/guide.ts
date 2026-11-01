/**
 * Guía de uso: pasos de cada proceso y ayuda contextual por pantalla.
 * Datos puros (sin React) para poder probarlos. Agregar una pantalla = agregar una entrada aquí.
 */

/** Rutas de la app (mismo patrón que App.tsx). Las más específicas van primero. */
export const ROUTE_PATTERNS = [
  '/', '/crear', '/codigo', '/clave', '/imagen', '/entrar', '/ayuda', '/inicio',
  '/venta', '/venta/pago', '/venta/listo', '/venta/salir',
  '/ventas', '/ventas/anuladas', '/ventas/:id', '/ventas/:id/anular',
  '/balance', '/fiados', '/fiados/:cliente', '/fiados/cobro/:id', '/fiados/cobrado/:id', '/cuenta',
] as const;
export type RoutePattern = typeof ROUTE_PATTERNS[number];

const toRegex = (p: string) => new RegExp('^' + p.replace(/:[a-z]+/gi, '[^/]+') + '$');

/** Qué patrón corresponde a una dirección. Las rutas fijas ganan a las que tienen parámetro. */
export function matchPattern(pathname: string): RoutePattern | null {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const fixed = ROUTE_PATTERNS.find((p) => !p.includes(':') && p === clean);
  if (fixed) return fixed;
  return ROUTE_PATTERNS.find((p) => p.includes(':') && toRegex(p).test(clean)) ?? null;
}

/* ---------- Pasos de cada proceso ("Paso 2 de 3") ---------- */

export interface ProcessDef { id: string; name: string; steps: { route: RoutePattern; label: string }[] }

export const PROCESSES: readonly ProcessDef[] = [
  { id: 'cuenta', name: 'Crear cuenta', steps: [
    { route: '/crear', label: 'Tus datos' }, { route: '/codigo', label: 'Código' },
    { route: '/clave', label: 'Clave' }, { route: '/imagen', label: 'Imagen' } ] },
  { id: 'venta', name: 'Nueva venta', steps: [
    { route: '/venta', label: 'Monto' }, { route: '/venta/pago', label: 'Pago' }, { route: '/venta/listo', label: 'Listo' } ] },
  { id: 'anular', name: 'Anular venta', steps: [
    { route: '/ventas/:id', label: 'Revisar' }, { route: '/ventas/:id/anular', label: 'Confirmar' } ] },
  { id: 'cobro', name: 'Cobrar fiado', steps: [
    { route: '/fiados', label: 'Cliente' }, { route: '/fiados/:cliente', label: 'Deuda' },
    { route: '/fiados/cobro/:id', label: 'Cobrar' }, { route: '/fiados/cobrado/:id', label: 'Listo' } ] },
];

export interface StepInfo { process: string; name: string; index: number; total: number; label: string; labels: string[] }

/** Paso actual del proceso al que pertenece la pantalla, o null si no es parte de uno. */
export function stepFor(pathname: string): StepInfo | null {
  const pattern = matchPattern(pathname);
  if (!pattern) return null;
  for (const p of PROCESSES) {
    const i = p.steps.findIndex((s) => s.route === pattern);
    if (i >= 0) return { process: p.id, name: p.name, index: i + 1, total: p.steps.length, label: p.steps[i].label, labels: p.steps.map((s) => s.label) };
  }
  return null;
}

/* ---------- Ayuda contextual ---------- */

export interface HelpStep { text: string; /** Selector CSS del elemento que se resalta (opcional). */ target?: string }
export interface HelpEntry { title: string; steps: HelpStep[]; /** Aparece en la página Ayuda. */ topic?: boolean; /** Se ofrece sola la primera vez. */ firstTime?: boolean }

export const HELP: Partial<Record<RoutePattern, HelpEntry>> = {
  '/': { title: 'Empezar', steps: [
    { text: 'Si es tu primera vez, toca "Crear cuenta".', target: '.btn--primary' },
    { text: 'Si ya tienes cuenta en este celular, toca "Ya tengo cuenta".' } ] },
  '/crear': { title: 'Crear cuenta', steps: [
    { text: 'Escribe tu nombre como te conocen en tu bodega.', target: 'input' },
    { text: 'Escribe tu celular de 9 números.' },
    { text: 'Toca Continuar. Te pediremos un código de demostración.', target: '.btn--primary' } ] },
  '/codigo': { title: 'Código', steps: [
    { text: 'En este prototipo el código siempre es 123456.' },
    { text: 'Escríbelo y toca Continuar.', target: '.btn--primary' } ] },
  '/clave': { title: 'Tu clave', steps: [
    { text: 'Toca los números para crear una clave de 6 dígitos. Anótala en un lugar seguro.', target: '.keypad' },
    { text: 'Los puntos de arriba se llenan con cada número.', target: '.pin-dots' },
    { text: 'Si te equivocas, toca borrar.', target: '.key--danger' } ] },
  '/imagen': { title: 'Tu imagen', steps: [
    { text: 'Toca la imagen que más se parezca a ti.', target: '.avatar-set' },
    { text: 'Toca Empezar para entrar a la app.', target: '.btn--primary' } ] },
  '/entrar': { title: 'Entrar', topic: true, steps: [
    { text: 'Escribe tu celular.', target: '#login-celular' },
    { text: 'Escribe tu clave de 6 números.', target: '#login-clave' },
    { text: 'Toca Entrar. Si fallas 3 veces seguidas, la app te hace esperar unos segundos para proteger tu cuenta.', target: '.btn--primary' } ] },
  '/inicio': { title: 'Inicio', firstTime: true, steps: [
    { text: 'Aquí ves cuánto has cobrado hoy.', target: '.card' },
    { text: 'Toca "Nueva venta" cada vez que le cobres a un cliente.', target: '.btn--primary' },
    { text: 'Abajo tienes Ventas de hoy, Balance, Fiados y Mi cuenta.', target: 'nav' } ] },
  '/venta': { title: 'Nueva venta', topic: true, firstTime: true, steps: [
    { text: 'Escribe el monto con el teclado. Ejemplo: toca 7, punto, 5 para S/ 7.50.', target: '.keypad' },
    { text: 'Los atajos suman solos: toca S/ 5 y luego S/ 2.50 y verás S/ 7.50.', target: '.shortcuts' },
    { text: 'Para sumar varios precios, escribe uno y toca el botón azul +.', target: '.key--plus' },
    { text: 'Aquí ves el total. Si te equivocas, toca borrar.', target: '.display' },
    { text: 'Cuando el total esté bien, toca Siguiente.', target: '.btn--primary' } ] },
  '/venta/pago': { title: 'Forma de pago', topic: true, firstTime: true, steps: [
    { text: 'Elige cómo pagó el cliente: Efectivo, Yape / Plin o Fiado.', target: '.methods' },
    { text: 'Si fue efectivo, toca con cuánto pagó. La app calcula el vuelto.', target: '.shortcuts' },
    { text: 'Si es fiado, elige a quién se le fía. No suma hasta que pague.', target: '.customer-set' },
    { text: 'Toca Guardar venta.', target: '.btn--primary' } ] },
  '/venta/listo': { title: 'Venta guardada', steps: [
    { text: 'Tu venta ya quedó guardada en este celular, aunque no haya internet.' },
    { text: 'Toca "Nueva venta" para seguir o vuelve a Inicio.', target: '.btn--primary' } ] },
  '/venta/salir': { title: 'Salir sin guardar', steps: [
    { text: 'Si sales, el monto se borra. Toca "Seguir con la venta" para no perderlo.' } ] },
  '/ventas': { title: 'Ventas de hoy', steps: [
    { text: 'Aquí están las ventas que guardaste hoy, de la más nueva a la más antigua.', target: '.sale-list' },
    { text: 'Toca una venta para ver el detalle o anularla.', target: '.sale-row' },
    { text: 'En "Anuladas" ves las que cancelaste.', target: '.tabs' } ] },
  '/ventas/anuladas': { title: 'Ventas anuladas', steps: [
    { text: 'Estas ventas ya no suman al total. Se guardan para que no se pierda el registro.' } ] },
  '/ventas/:id': { title: 'Detalle de la venta', steps: [
    { text: 'Revisa el monto, la hora y la forma de pago.', target: '.card' },
    { text: 'Si fue un error, toca "Anular venta".', target: '.btn--danger' } ] },
  '/ventas/:id/anular': { title: 'Anular venta', topic: true, steps: [
    { text: 'Lee la venta que vas a anular.', target: '.card' },
    { text: 'Toca "Sí, anular" para confirmar o "No, mantener" para dejarla como está.', target: '.btn-row' } ] },
  '/balance': { title: 'Balance', topic: true, firstTime: true, steps: [
    { text: 'Elige el periodo: Hoy, Semana, Quincena o Mes.', target: '.periods' },
    { text: 'Mira el total y cuánto fue en Efectivo y en Yape / Plin.', target: '.card' },
    { text: 'Los fiados suman cuando el cliente paga.' } ] },
  '/fiados': { title: 'Fiados', topic: true, firstTime: true, steps: [
    { text: 'Aquí ves a quién le fiaste y cuánto te debe.', target: '.sale-list' },
    { text: 'Toca un cliente para ver sus deudas.', target: '.sale-row' } ] },
  '/fiados/:cliente': { title: 'Deudas del cliente', steps: [
    { text: 'Estas son las compras que el cliente todavía no paga.', target: '.sale-list' },
    { text: 'Cuando pague, toca "Cobrar" en esa compra.', target: '.sale-row' } ] },
  '/fiados/cobro/:id': { title: 'Cobrar un fiado', topic: true, firstTime: true, steps: [
    { text: 'Revisa el monto que vas a cobrar.', target: '.card' },
    { text: 'Elige cómo te pagó el cliente: Efectivo o Yape / Plin.', target: '.methods' },
    { text: 'Toca "Registrar cobro". Desde ese momento suma a lo cobrado hoy.', target: '.btn--primary' } ] },
  '/fiados/cobrado/:id': { title: 'Cobro registrado', steps: [
    { text: 'Listo: el fiado ya suma a lo cobrado hoy.' } ] },
  '/ayuda': { title: 'Ayuda', steps: [
    { text: 'Toca un tema para ver los pasos, uno por uno.', target: '.help-topic' },
    { text: 'En cualquier pantalla toca el botón ? de arriba y te mostramos qué tocar.' } ] },
  '/cuenta': { title: 'Mi cuenta', topic: true, firstTime: true, steps: [
    { text: 'Aquí ves tus datos y si tus ventas están respaldadas.', target: '.card' },
    { text: 'Con internet, toca "Respaldar ahora". Sin internet, la app respalda sola cuando vuelva.', target: '.btn--primary' },
    { text: 'Toca "Cerrar sesión" para salir. Tus ventas se quedan guardadas.', target: '.btn-row, .btn--danger' } ] },
};

export function helpFor(pathname: string): HelpEntry | null {
  const p = matchPattern(pathname);
  return p ? HELP[p] ?? null : null;
}

/** ¿Hay que ofrecer ayuda la primera vez en esta pantalla? */
export function shouldOfferFirstTime(pathname: string, seen: readonly string[]): boolean {
  const p = matchPattern(pathname);
  return !!p && !!HELP[p]?.firstTime && !seen.includes(p);
}

export const IDLE_HELP_MS = 25_000;
