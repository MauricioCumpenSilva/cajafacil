# Accesibilidad de CajaFácil (WCAG 2.1 nivel AA)

Resultado de la etapa 6. Dice qué se cumple, **cómo se comprobó** y qué falta comprobar a mano.
No se inventan mediciones: lo que no se ha probado en un celular real ni con usuarios está marcado como pendiente.

## Cómo se comprueba
| Capa | Qué revisa | Cómo correrla |
|---|---|---|
| Estática | Reglas del código y de los estilos (`src/a11y.test.ts`, `src/routes.test.ts`) | `npm test` |
| Navegador real | Recorrido completo a 360 px y 320 px: nombre accesible de cada control, área táctil, contraste calculado sobre los colores reales, `h1` único, ids repetidos, desplazamiento horizontal, foco visible con Tab (`e2e/smoke.cjs`) | `npm run build && npx vite preview` y luego `npx playwright install chromium && node e2e/smoke.cjs` |
| Manual (pendiente) | Lector de pantalla (TalkBack), WAVE/axe sobre la página publicada, prueba con usuarios | Ver "Pendiente" |

## Criterios y estado
| WCAG | Qué se hizo | Verificado con |
|---|---|---|
| 1.1.1 Contenido no textual | Avatares y logo con texto alternativo; decorativos ocultos al lector | estática |
| 1.3.1 Información y relaciones | `header`/`main`/`nav`, `fieldset`+`legend` en opciones, `label` en cada campo, listas reales | estática + navegador |
| 1.3.5 Propósito de los campos | `autocomplete` (`tel`, `current-password`) | estática |
| 1.4.1 Uso del color | Estados con texto o símbolo: "Guardada/Anulada", ⚠ en errores, ⏳ en espera, "Paso X de Y" | estática |
| 1.4.3 Contraste del texto (4.5:1) | Todas las parejas de color de `tokens.css` calculadas; texto real medido en cada pantalla | estática + navegador |
| 1.4.4 Cambiar tamaño del texto | Texto base 16 px, unidades relativas, el zoom no está bloqueado | estática |
| 1.4.10 Reflujo | Sin desplazamiento horizontal a 320 px en Inicio, Venta, Fiados y Balance | navegador |
| 1.4.11 Contraste no textual (3:1) | Bordes, foco y colores de marca contra los fondos | estática |
| 2.1.1 Teclado | Solo botones, enlaces y campos reales; orden natural; Escape cierra la ayuda | estática + navegador |
| 2.2.1 / 2.2.2 Tiempos y movimiento | Nada desaparece solo; globos y ayuda se cierran con botón. La espera por clave errada es una medida de seguridad con cuenta regresiva visible | estática + navegador |
| 2.3.3 / movimiento | "Reducir movimiento" apaga animaciones (la rueda de carga solo se ralentiza) | estática |
| 2.4.1 Saltar bloques | Enlace "Ir al contenido" con tamaño táctil | estática + navegador |
| 2.4.2 Título de página | Cada pantalla pone su título | estática |
| 2.4.3 Orden del foco | Al cambiar de pantalla el foco va al encabezado; al cerrar la ayuda vuelve al botón "?" | navegador |
| 2.4.6 Encabezados | Un `h1` por pantalla | estática + navegador |
| 2.4.7 Foco visible | Contorno de 3 px en todo; comprobado con 12 Tab seguidos | estática + navegador |
| 2.5.5 Tamaño del objetivo (AAA, se aplica) | Controles de al menos 44 px (48 px de diseño) | navegador |
| 3.1.1 Idioma | `lang="es"` | estática |
| 3.3.1 / 3.3.2 / 3.3.3 Errores y ayuda | Errores en texto, enlazados al campo y anunciados (`role="alert"`), con qué hacer; ayuda paso a paso en cada pantalla | estática + navegador |
| 4.1.2 Nombre, función, valor | Botones de solo icono con `aria-label`; estados con `aria-pressed`, `aria-current`, `aria-busy` | estática + navegador |
| 4.1.3 Mensajes de estado | Total de la venta, vuelto, esperas y avisos con `role="status"`/`aria-live` | estática |

## Diseño pensado para personas mayores y celulares de gama baja
- Frases cortas y con verbos ("Toca Siguiente"), sin jerga.
- Pasos visibles ("Paso 2 de 3") y ayuda que **resalta** el botón del que habla.
- Botones grandes (64 px los principales), separados para evitar toques equivocados.
- Confirmación antes de anular y antes de perder un monto escrito.
- Funciona sin internet y sin cuenta real.

## Pendiente (no se puede comprobar desde aquí)
1. Probar con TalkBack en un Android real el recorrido: crear cuenta → venta → fiado → cobro.
2. Correr WAVE o axe DevTools sobre la versión publicada y pegar el reporte en la entrega PA3.
3. Prueba con 3–5 personas del perfil (Doña Flor, Brian) y registrar tiempos y errores reales.
4. Verificar en celular real el modo sin conexión (instalar la app, apagar datos, abrir).
