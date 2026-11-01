import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGreeting, firstName, helloTitle } from './greeting.ts';

const base = { name: 'Flor María Pérez', today: '2026-10-31', salesToday: 0, totalCents: 0 };

test('saludo fijo: "Hola" y el primer nombre', () => {
  assert.equal(helloTitle('Flor María Pérez'), 'Hola, Flor');
  assert.equal(helloTitle('  Brian '), 'Hola, Brian');
  assert.equal(firstName(''), '');
});

test('primera vez del día: invita a registrar la nueva venta', () => {
  const g = buildGreeting({ ...base, lastVisitDay: '2026-10-30' });
  assert.equal(g.kind, 'primera-vez-hoy');
  assert.equal(g.bubble, '¡Hola, Flor! Lista para registrar tu nueva venta.');
});

test('primera vez que abre la app (sin visitas previas) cuenta como primera del día', () => {
  assert.equal(buildGreeting({ ...base, lastVisitDay: null }).kind, 'primera-vez-hoy');
});

test('vuelve a abrir el mismo día con ventas: "Hola de nuevo" y lo que lleva', () => {
  const g = buildGreeting({ ...base, lastVisitDay: '2026-10-31', salesToday: 3, totalCents: 4550 });
  assert.equal(g.kind, 'de-regreso');
  assert.equal(g.bubble, '¡Hola de nuevo, Flor! Sigue registrando tus ventas. Hoy llevas S/ 45.50 en 3 ventas.');
});

test('singular y sin ventas', () => {
  assert.match(buildGreeting({ ...base, lastVisitDay: base.today, salesToday: 1, totalCents: 100 }).bubble, /en 1 venta\.$/);
  assert.equal(buildGreeting({ ...base, lastVisitDay: base.today }).bubble, '¡Hola de nuevo, Flor! Sigue registrando tus ventas.');
});
