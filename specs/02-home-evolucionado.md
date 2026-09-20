# SPEC 02 — Home evolucionado: landing del Vault

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-20
> **Objetivo:** Convertir `/` en una landing de cinco bloques derivada del prototipo `references/templates/home-about/`, moviendo la Biblioteca a `/biblioteca`.

## Por qué existe este spec

El prototipo del Home es un buen punto de partida con tres problemas estructurales: promete cosas que la app no cumple (12+ juegos, actividad en vivo, nuevos juegos cada mes), reparte siete bloques donde cinco bastan, y arrastra los mismos defectos de accesibilidad que SPEC 01 ya corrigió en el resto del portal (`div onClick` en lugar de enlaces, objetivos táctiles por debajo de 44px). Este spec porta la intención del prototipo, no su marcado.

Segundo motivo: hoy la portada del sitio es el catálogo. Un visitante nuevo aterriza en una grilla de ocho tarjetas sin saber qué es Arcade Vault. La landing ocupa `/` y el catálogo pasa a `/biblioteca`.

No se busca cambiar por cambiar. Se conserva lo que define la identidad —negro casi puro, grilla en perspectiva, scanlines, Press Start 2P, cuarteto neón cian/magenta/amarillo/verde, botones biselados con `clip-path`, el titular de tres líneas— y cada desviación del prototipo está justificada en la sección "Evolución respecto al prototipo".

## Skills obligatorias en la implementación

`CLAUDE.md` del repo las exige y este spec las asume:

- `frontend-design` y `ui-ux-pro-max`: las siete decisiones de "Evolución respecto al prototipo" salen de aplicarlas. La referencia visual no es una restricción: es un punto de partida que se puede mejorar cuando la mejora está argumentada.
- `vercel-react-best-practices`: `page.tsx` sin `'use client'`, una sola isla cliente para el observer, sin estado derivado en efectos, importaciones por ruta directa.

## Alcance

**Dentro:**

- Home en `/`: hero con gabinete CRT + franja de cifras, por qué, juegos destacados, actividad, cierre (FAQ + `$0` + CTA).
- Biblioteca movida a `/biblioteca` sin cambios de contenido, con `metadata` propia.
- Tercer enlace "Inicio" en la barra y en el panel móvil.
- Reapuntar a `/biblioteca` los enlaces de vuelta y las redirecciones de `/acceso`.
- Cifras del Home derivadas de `GAMES` en tiempo de carga del módulo, no escritas a mano.
- Datos mock de actividad como constantes estáticas en `lib/home.ts`, rotulados como demostración en pantalla.
- Reveal por scroll en una sola isla cliente, con degradación correcta sin JS y con `prefers-reduced-motion`.
- Responsive en 375 / 768 / 1024 / 1440 px.

**Fuera de alcance (para specs futuros):**

- Pantalla Acerca de y formulario de Contacto (`about.jsx` del prototipo).
- Juegos jugables. El gabinete del hero es la arena decorativa de SPEC 01.
- Actividad real, ranking real, "top de hoy" calculado. Todo sigue siendo mock.
- Sistema de créditos, perfil de usuario, cuenta real.
- Redirección `/` → `/biblioteca` para usuarios con sesión. La landing es igual para todos.
- Tests: sigue sin runner.

## Rutas

| Ruta | Archivo | Cambio |
| --- | --- | --- |
| `/` | `app/page.tsx` | **Reescrita.** Antes Biblioteca, ahora Home |
| `/biblioteca` | `app/biblioteca/page.tsx` | **Nueva.** Contenido actual de `app/page.tsx` |
| `/juego/[id]`, `/juego/[id]/jugar`, `/acceso`, `/salon`, 404 | sin cambios de ruta | solo cambian los destinos de "volver" |

Convención que queda fijada: **"VAULT" es el catálogo**. Todo enlace de vuelta lleva a `/biblioteca`; el logo de la barra lleva a `/`.

## Evolución respecto al prototipo

Siete cambios. Cada uno resuelve un problema concreto.

1. **Hero de dos columnas con gabinete CRT.** El prototipo centra el texto, lo rodea de 8 siluetas SVG a `opacity .55` y ocupa `calc(100vh - 60px)`, de modo que nada del producto es visible sin hacer scroll. La nueva versión pone copy a la izquierda y un monitor CRT a la derecha reusando `.crt`, `.crt-screen`, `.crt-bottom` y `.game-arena`, que ya existen en `globals.css` para el reproductor: el hero enseña una pantalla encendida en vez de prometerla. Las siluetas bajan de 8 a 3 y se anclan detrás del gabinete. La altura pasa a `min-height: 78svh`: la franja de cifras asoma y el indicador "DESLIZA ▼" sobra, así que se elimina.
2. **Kickers que describen, no que numeran.** El prototipo rotula las secciones `// 01` … `// 04`, pero no son una secuencia: no hay orden que el lector necesite. Se sustituyen por etiquetas de contenido (`▸ POR QUÉ`, `▸ CATÁLOGO`, `▸ ACTIVIDAD`, `▸ ANTES DE EMPEZAR`), manteniendo el dispositivo visual y la rotación de color neón.
3. **Cifras derivadas, no inventadas.** "12+ JUEGOS", "MILES DE PARTIDAS" y "GLOBAL RANKING" se sustituyen por tres cifras calculadas de `GAMES`: número de juegos, número de categorías y mejor marca del catálogo. Además dejan de ser una sección con banda propia y pasan a ser una franja pegada al hero, porque son la evidencia de lo que el hero afirma.
4. **Destacados con `GameCard`, no con `mini-card`.** La `mini-card` del prototipo es un `div onClick` con portada 1:1, título y categoría: el mismo patrón inaccesible que SPEC 01 ya corrigió. Se reusa `components/game-card.tsx`, que es un único `<Link>`, y se muestran 4 en lugar de 6: caben en la grilla existente `minmax(280px, 1fr)` y cada tarjeta lleva más información que una mini. La selección es por `best` descendente, no `slice(0, 6)`.
5. **Actividad rotulada como demostración.** Desaparece el LED "EN VIVO" y en su lugar va una etiqueta `DATOS DE DEMOSTRACIÓN` en el encabezado de la tarjeta. Se corrige la barra del top: en el prototipo `.tp-bar { position: absolute; }` no tiene dimensiones y nunca se pinta, y el `width` en línea no hace nada; aquí la barra es real y su ancho es `score / topScore`, así el ranking se lee de un vistazo. Las marcas de tiempo ("hace 2 min") quedan como cadenas estáticas: calcularlas contra el reloj rompería la hidratación.
6. **Precios fundidos en el cierre.** Una tabla de precios con un solo plan gratuito es ceremonia: cuatro de las seis líneas de su lista de ✔ repiten las tarjetas de "por qué" y las otras dos afirman cosas que no se pueden verificar. Sobreviven las dos piezas de identidad, el `$0 / SIEMPRE` en pixel con degradado y el sello FREE PLAY rotado en magenta, que pasan a la tarjeta de cierre junto al FAQ de 3 ítems. Dos secciones se convierten en una.
7. **Reveal que degrada bien.** El prototipo declara `.reveal { opacity: 0 }` en CSS y la quita con un IntersectionObserver: sin JS la página queda en blanco bajo el hero. Aquí el `opacity: 0` vive dentro de `@media (prefers-reduced-motion: no-preference)`, y un único componente cliente `scroll-reveal.tsx` monta el observer sobre `[data-reveal]`. Sin JS, con JS fallando o con movimiento reducido, todo el contenido se ve.

## Modelo de datos

Sin backend. Un módulo nuevo y ningún cambio en los existentes.

```ts
// lib/home.ts
import type { Game } from "@/lib/games";

export type ActivityEntry = {
  player: string;   // "NEONFOX"
  game: string;     // "CAÍDA"
  score: number;    // 184220
  ago: string;      // "hace 2 min" — cadena fija, nunca calculada
  color: Game["color"];
};
export type TopPlayer = { rank: number; player: string; score: number };

export const RECENT_SCORES: ActivityEntry[];   // 7 filas
export const TOP_TODAY: TopPlayer[];           // 5 filas
export const FEATURED: Game[];                 // 4, GAMES por `best` descendente
export const VAULT_STATS: { games: number; cats: number; bestScore: number };
```

Convenciones:

- `FEATURED` y `VAULT_STATS` se derivan de `GAMES` y `CATS` en el ámbito del módulo: si mañana entra un noveno juego, el Home lo refleja solo.
- `RECENT_SCORES` y `TOP_TODAY` son constantes literales. Nada de `Math.random()` ni `Date.now()`: el Home entero se prerenderiza.
- Los números se formatean con `toLocaleString("es-ES")`, igual que el resto del portal.

## Componentes

`components/` en la raíz, importaciones directas al archivo, sin `index.ts`.

| Archivo | Tipo | Responsabilidad |
| --- | --- | --- |
| `home-hero.tsx` | servidor | Dos columnas: eyebrow, `<h1>` de tres líneas, subtítulo, CTAs, línea de confianza, gabinete y siluetas |
| `home-hero-ctas.tsx` | cliente | Par de botones. El segundo cambia de "CREAR CUENTA" a "SALÓN DE LA FAMA" con sesión activa, mismo patrón que `site-nav` |
| `home-cabinet.tsx` | servidor | `.crt` + `.game-arena` + marquesina y LED. Todo `aria-hidden` |
| `home-stats.tsx` | servidor | Franja de tres cifras desde `VAULT_STATS` |
| `section-head.tsx` | servidor | Kicker + `<h2>` + regla degradada. Reusado por las cuatro secciones |
| `home-features.tsx` | servidor | Cuatro tarjetas con icono pixel, una por color neón |
| `pixel-icon.tsx` | servidor | Los SVG pixel del prototipo (gamepad, gratis, trofeo, cohete), `aria-hidden` |
| `home-activity.tsx` | servidor | Dos tarjetas: últimas puntuaciones (`<ol>`) y top de hoy (`<ol>` con barra proporcional) |
| `home-closing.tsx` | servidor | FAQ de 3 ítems + tarjeta `$0` con sello FREE PLAY y CTA final |
| `scroll-reveal.tsx` | cliente | Única isla de scroll: IntersectionObserver sobre `[data-reveal]`, desconecta al desmontar |

`app/page.tsx` sigue siendo Server Component y solo compone. Dos componentes cliente propios en toda la pantalla: `home-hero-ctas` y `scroll-reveal`.

**Modificados:** `components/site-nav.tsx` (tercer enlace; Biblioteca activa en `/biblioteca` y `/juego/*`, Inicio solo en `/`), `components/auth-form.tsx` (redirige a `/biblioteca`), `components/game-over-dialog.tsx`, `app/juego/[id]/page.tsx`, `app/salon/page.tsx`, `app/not-found.tsx` (destino `/biblioteca`) y `CLAUDE.md` (tabla de rutas y lista de componentes).

**`app/globals.css`** solo recibe lo que Tailwind no expresa sin volverse ilegible: `@keyframes float` y las posiciones de las 3 siluetas, `@keyframes pulse-led`, el bloque `.reveal` dentro de `@media (prefers-reduced-motion: no-preference)`, y las nuevas animaciones se suman al bloque `prefers-reduced-motion: reduce` existente. El gabinete, las tarjetas, el FAQ, el sello y la franja de cifras van en utilidades Tailwind.

## Contenido de cada bloque

**Hero.** Eyebrow `▸ INSERTA UNA MONEDA_` en amarillo. `<h1>` de tres `<span>`: `EL ARCADE` en blanco, `CLÁSICO ESTÁ` en degradado cian, `DE VUELTA` en degradado magenta; se conservan tal cual, son la firma tipográfica del prototipo. Subtítulo: "Ocho clásicos en tu navegador. Sin descargas, sin cuenta obligatoria, sin costo." CTAs: `▶ EXPLORAR JUEGOS` a `/biblioteca` y el segundo según sesión. Línea de confianza en `--ink-faint`. A la derecha, el gabinete.

**Cifras.** `08 JUEGOS · EN EL VAULT`, `04 CATEGORÍAS · ARCADE, PUZZLE, SHOOTER, VERSUS`, `184.220 MEJOR MARCA · CAÍDA`. Tres columnas separadas por línea vertical, una sola columna por debajo de 720px.

**Por qué (`▸ POR QUÉ`).** Cuatro tarjetas, una por color: OCHO CLÁSICOS (cian), SIN COSTO (amarillo), RANKING GLOBAL (magenta), PROYECTO ABIERTO (verde). "LADDER BOARDS" del prototipo se traduce: es la única etiqueta en inglés de una interfaz en español. Los textos que prometían "nuevos juegos cada mes" se reescriben a lo que sí es cierto. 4 / 2 / 1 columnas.

**Catálogo (`▸ CATÁLOGO`).** Título "JUEGOS EN EL VAULT", no "DISPONIBLES AHORA", porque ninguno es jugable todavía. Cuatro `GameCard`. Debajo, centrado, `VER LOS 8 JUEGOS →` a `/biblioteca`.

**Actividad (`▸ ACTIVIDAD`).** Dos tarjetas en `1.2fr 1fr`, una columna por debajo de 900px. Izquierda: `▸ ÚLTIMAS PUNTUACIONES` con la etiqueta `DATOS DE DEMOSTRACIÓN` y 7 filas. Derecha: `▸ TOP JUGADORES · HOY`, 5 filas con barra proporcional y oro/plata/bronce en las tres primeras, más un enlace `VER SALÓN →` a `/salon` con altura mínima de 44px (en el prototipo `.lb-link` mide ~28px).

**Cierre (`▸ ANTES DE EMPEZAR`).** FAQ de 3 ítems a la izquierda, con borde izquierdo cian/magenta/amarillo. Una de las respuestas dice en claro que los juegos todavía no son jugables. A la derecha, tarjeta verde con `$0 / SIEMPRE`, el sello FREE PLAY rotado, `INSERTAR MONEDA →` a `/biblioteca` y el pie "No pedimos tarjeta. Nunca lo haremos."

## Plan de implementación

1. Crear `app/biblioteca/page.tsx` moviendo el contenido actual de `app/page.tsx` y añadirle `metadata`. Dejar `app/page.tsx` intacto por ahora. Verificación: `/` y `/biblioteca` muestran lo mismo.
2. Reapuntar a `/biblioteca` los destinos de `app/juego/[id]/page.tsx`, `app/salon/page.tsx`, `app/not-found.tsx`, `components/game-over-dialog.tsx` y los dos `router.push` de `components/auth-form.tsx`. Verificación: ningún enlace de vuelta cae en la landing.
3. Añadir "Inicio" a `NAV_LINKS` en `components/site-nav.tsx` y ajustar `isActive` de Biblioteca a `/biblioteca` + `/juego/*`. Verificación: el enlace activo es correcto en las seis rutas, a 1440px y a 375px.
4. Crear `lib/home.ts` con los cuatro export. Verificación: `npx tsc --noEmit` pasa.
5. Añadir a `app/globals.css` los keyframes, las posiciones de silueta y el bloque `.reveal`, y ampliar el `prefers-reduced-motion: reduce`. Verificación: `npm run dev` compila y las pantallas de SPEC 01 no cambian.
6. Crear `components/section-head.tsx`, `components/pixel-icon.tsx` y `components/scroll-reveal.tsx`. Verificación: importables, sin errores de tipos.
7. Crear `components/home-cabinet.tsx` y `components/home-hero-ctas.tsx`, y con ellos `components/home-hero.tsx`. Reescribir `app/page.tsx` con hero + `ScrollReveal`. Verificación: `/` muestra el hero y el gabinete animado.
8. Crear `components/home-stats.tsx` y montarlo. Verificación: la franja imprime 08, 04 y 184.220.
9. Crear `components/home-features.tsx` y montarlo. Verificación: cuatro tarjetas, cuatro colores, hover elevado.
10. Montar la sección de catálogo con `FEATURED` y `GameCard`. Verificación: cuatro tarjetas navegables a `/juego/[id]`.
11. Crear `components/home-activity.tsx` y montarlo. Verificación: la barra del top escala con la puntuación.
12. Crear `components/home-closing.tsx` y montarlo. Verificación: el CTA final llega a `/biblioteca`.
13. Actualizar la tabla de rutas y la lista de componentes de `CLAUDE.md`.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores y `npx tsc --noEmit` no reporta nada.
- [ ] `npm run lint` pasa sin errores.
- [ ] `/` muestra la landing; `/biblioteca` muestra el buscador, los chips y las 8 tarjetas.
- [ ] La consola del navegador no muestra errores de hidratación en `/` ni en `/biblioteca`.
- [ ] Buscar "cai" en `/biblioteca` sigue dejando una sola tarjeta.
- [ ] La barra tiene tres enlaces; en `/juego/caida` el activo es Biblioteca, en `/` es Inicio.
- [ ] El logo de la barra lleva a `/`; los enlaces de vuelta del detalle, el salón, el 404 y el diálogo de fin de juego, y el CTA final del Home, llevan a `/biblioteca`.
- [ ] Iniciar sesión en `/acceso` aterriza en `/biblioteca`, no en la landing.
- [ ] La franja de cifras imprime `08`, `04` y `184.220`, y ninguno de esos tres números está escrito a mano en el JSX.
- [ ] No aparece en `/` la cadena "12+", "MILES", "EN VIVO" ni "cada mes".
- [ ] La sección de destacados muestra exactamente 4 tarjetas, las de mayor `best`.
- [ ] Cada tarjeta destacada es un único destino de teclado: Tab la enfoca una sola vez.
- [ ] La tarjeta de últimas puntuaciones muestra visible la etiqueta de datos de demostración.
- [ ] En el top de jugadores, la barra de la fila 1 es más ancha que la de la fila 5.
- [ ] Ninguna marca de tiempo del Home se recalcula al recargar.
- [ ] Con JavaScript desactivado, los cinco bloques de `/` son visibles.
- [ ] Con `prefers-reduced-motion: reduce` no hay reveal, ni siluetas flotando, ni LED pulsando, ni arena animada.
- [ ] Todos los botones y enlaces con aspecto de control del Home miden al menos 44px de alto, incluido `VER SALÓN →`.
- [ ] Recorrer `/` solo con Tab alcanza los dos CTA del hero, las 4 tarjetas, `VER LOS 8 JUEGOS`, `VER SALÓN` y el CTA final, con anillo de foco visible.
- [ ] La página tiene un único `<h1>` y las cuatro secciones posteriores al hero usan `<h2>`.
- [ ] Todo SVG decorativo del Home tiene `aria-hidden="true"`.
- [ ] A 375px `/` no tiene scroll horizontal y el gabinete queda debajo del copy.
- [ ] `app/page.tsx` y `app/biblioteca/page.tsx` no contienen `'use client'`.
- [ ] Los únicos componentes cliente propios de `/` son `home-hero-ctas` y `scroll-reveal`.
- [ ] Ningún archivo bajo `app/` ni `components/` importa algo de `references/`.

## Decisiones

- **Sí:** Home en `/` y Biblioteca en `/biblioteca`. El prototipo tiene "Inicio" y "Biblioteca" como entradas distintas; dejar el catálogo en la raíz obligaría a esconder la landing en `/inicio`, que nadie visita.
- **Sí:** "VAULT" pasa a significar el catálogo. Sin esa convención, "VOLVER AL VAULT" queda ambiguo entre dos pantallas.
- **No:** redirigir a `/biblioteca` a quien tenga sesión. Añade una rama de comportamiento por un beneficio marginal.
- **Sí:** gabinete CRT en el hero reusando `.crt` y `.game-arena`. Cero CSS nuevo para el monitor y el hero enseña el producto en vez de describirlo.
- **No:** las 8 siluetas del prototipo. Compiten con el titular; quedan 3 como ambiente detrás del gabinete.
- **No:** el indicador "DESLIZA ▼". Con el hero a 78svh la siguiente sección ya asoma, que es la señal que el indicador imitaba.
- **Sí:** kickers descriptivos en vez de `// 01`…`// 04`. Numerar sugiere un orden que el contenido no tiene.
- **Sí:** cifras derivadas de `GAMES`. Un número escrito a mano se desincroniza en cuanto entra el noveno juego.
- **Sí:** reusar `GameCard` en los destacados. La `mini-card` del prototipo repite el `div onClick` que SPEC 01 ya había corregido.
- **No:** las 6 tarjetas del prototipo. Cuatro caben en la grilla existente sin inventar un segundo tamaño de tarjeta.
- **Sí:** barra proporcional real en el top de jugadores. En el prototipo la barra no se pinta; arreglarla añade lectura de un vistazo sin añadir elementos.
- **Sí:** conservar `$0` y el sello FREE PLAY, fundidos en el cierre. Son el remate visual más fuerte del prototipo; la tabla de precios que los rodea, no.
- **No:** la lista de 6 ✔ del plan. Cuatro de sus líneas repiten las tarjetas de "por qué" y dos no son verificables.
- **Sí:** mock de actividad rotulado como demostración. Toda la app es mock, pero "EN VIVO" es una afirmación falsa, no una maqueta.
- **Sí:** marcas de tiempo como cadenas fijas. Calcular "hace 2 min" en render rompe la hidratación y el prerenderizado.
- **Sí:** una sola isla cliente para el reveal. Envolver cada sección en un componente cliente convertiría toda la landing en cliente.
- **Sí:** `opacity: 0` del reveal dentro de `prefers-reduced-motion: no-preference`. Sin eso, un fallo de JS deja la página en blanco bajo el hero.
- **No:** Acerca de y Contacto. Están en la misma carpeta de referencia pero son otra pantalla y otro spec; el formulario además no tendría destino.
- **Sí:** definición con dos rondas de preguntas. El usuario confirmó ruta, alcance, densidad, tratamiento del copy, hero, cierre y nivel de movimiento. Los nombres de archivo de `components/`, la altura `78svh`, la cantidad de destacados (4) y las etiquetas de los kickers son propuestas por defecto para revisar al leer este borrador.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El CTA del hero cambia de texto tras hidratar y parpadea | Es el mismo patrón que la barra ya usa para el nombre de usuario; el servidor renderiza siempre el estado sin sesión |
| Mover `/` a `/biblioteca` deja enlaces rotos | El paso 2 del plan los reapunta todos y hay un criterio de aceptación por cada destino |
| El gabinete del hero alarga la primera pintura en móvil | Es CSS puro, sin imágenes ni canvas; a 375px se apila debajo del copy |
| Las clases del arte CSS no se generan | Van en `@layer components` de `globals.css`, que se emite siempre |
| `LayoutProps` / `PageProps` no resuelven en `tsc` | Requieren que `next dev` o `next build` hayan corrido antes |
| `.next/` bloqueado por OneDrive al compilar | Borrar `.next/server` y `.next/static` y recompilar |

## Lo que **no** está en este spec

- Acerca de y Contacto.
- Juegos jugables.
- Actividad, ranking o "top de hoy" reales.
- Créditos, perfil de usuario, cuenta real.
- Redirección de la landing según sesión.
- Tests automatizados.

Cada uno de ellos, si entra, va en su propio spec.
