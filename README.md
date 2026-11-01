# CajaFácil

App web (PWA) para registrar ventas y controlar la caja diaria en bodegas y puestos de mercado. Funciona sin internet. Basada en el prototipo de Figma del PA2.

## Cómo correrlo (Node 22 o superior)

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 26 pruebas de la lógica (dominio y datos)
npm run build      # revisa tipos y genera dist/
```

## Arquitectura (pensada para crecer)

| Capa | Carpeta | Regla |
| --- | --- | --- |
| Dominio | `src/domain` | TypeScript puro, sin React. Montos en céntimos. Calculadora como reductor. Aquí viven las reglas (vuelto, anulación, totales). |
| Datos | `src/data` | `SalesRepository` es un contrato; hoy `LocalStorage`, mañana IndexedDB o servidor sin tocar pantallas. |
| Servicios | `src/services` | `FeedbackService`: punto de enchufe para vibración, sonido u otros avisos. |
| Estado | `src/state` | Contexto de React que une dominio + datos + servicios. |
| UI | `src/ui`, `src/pages` | Componentes y pantallas. Solo presentan; no calculan dinero. |
| Estilos | `src/styles` | `tokens.css` con colores, tamaños y foco. |

Para agregar una mejora (por ejemplo un aviso al guardar la venta): se agrega un evento en `feedback.ts`, se llama desde `SalesContext` y las pantallas no cambian.

## Etapas

1. **Base** (hecha): estructura, estilos, rutas, barra superior con ayuda "?", skip link, Inicio con total del día, lógica de ventas con pruebas.
2. **Cuenta y acceso** (hecha): bienvenida, crear cuenta, código de demostración (123456), clave de 6 números, imagen, entrar. "Ya tengo cuenta" solo funciona si la cuenta fue creada.
3. **Nueva venta** (hecha): teclado con punto decimal, atajos, botón +, método de pago (Efectivo con vuelto, Yape/Plin, Fiado), guardar, venta guardada y salir sin guardar. Inicio suma lo cobrado hoy.
4. **Historial, balance y seguridad** (hecha): Ventas de hoy (Guardadas/Anuladas), detalle, anulación con confirmación, Balance (Hoy/Semana/Quincena/Mes). Bloqueo por clave errada (3 fallos → 30 s, luego 60, 120, 240, máx. 300 s; persiste al recargar) y pantallas de espera ("Entrando…", "Creando tu cuenta…", "Guardando…", "Anulando…").
5. **Fiados, cuenta, ayuda y sin conexión** (hecha): Fiados por cliente con cobro (Efectivo o Yape; suma el día del cobro), Mi cuenta con respaldo simulado (automático al volver internet), indicador "Paso X de Y" en cada proceso, botón ? con ayuda paso a paso que resalta qué tocar, globo de ayuda la primera vez o tras 25 s sin tocar nada, página Ayuda, y modo sin conexión (service worker + manifest instalable).
6. **Accesibilidad** (hecha, ver `ACCESIBILIDAD.md`): foco y título por pantalla, ayuda que devuelve el foco, reducir movimiento, contraste y área táctil comprobados por prueba, y `e2e/smoke.cjs` (recorrido completo en navegador real con revisión de accesibilidad).

También: clientes nuevos para fiado (nombre libre, sin repetidos), avatar elegido visible en Inicio con saludo "Hola, nombre" y globo de bienvenida (primera vez del día / "Hola de nuevo" al reabrir).

## Accesibilidad ya aplicada en la etapa 1

Skip link, foco visible, `main`/`header`/`nav` semánticos, `aria-label` en el botón "?", áreas táctiles de 48 px, texto base de 16 px, estado de conexión con texto (no solo color), idioma `es`.
