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
5. Fiados, cobro, Mi cuenta y modo sin conexión (service worker).
6. Accesibilidad completa y reporte WAVE o axe.

## Accesibilidad ya aplicada en la etapa 1

Skip link, foco visible, `main`/`header`/`nav` semánticos, `aria-label` en el botón "?", áreas táctiles de 48 px, texto base de 16 px, estado de conexión con texto (no solo color), idioma `es`.
