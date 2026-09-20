# SPEC 01 — MVP visual: las 5 pantallas del portal

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-09-19
> **Objetivo:** Portar las 5 pantallas del prototipo `references/templates/` a Next.js App Router con fidelidad visual, sin implementar ningún juego.

## Por qué existe este spec

El prototipo es un SPA de un solo `index.html` con React UMD, Babel en el navegador, ruteo por `location.hash` y componentes colgados de `window`. Nada de eso sobrevive al App Router. Este spec define la traducción: qué archivo reemplaza a qué, dónde se corta la frontera Server/Client y qué se corrige del prototipo en el camino (accesibilidad, contraste y dos bugs de comportamiento). El prototipo es la referencia visual, no el modelo de arquitectura.

## Skills obligatorias en la implementación

`CLAUDE.md` del repo las exige y este spec las asume:

- `frontend-design` y `ui-ux-pro-max`: jerarquía visual, accesibilidad, responsive y estados de interacción. Las correcciones de la sección "Correcciones al prototipo" salen de aplicar `ui-ux-pro-max` al prototipo.
- `vercel-react-best-practices`: frontera Server/Client, sin estado derivado en efectos, sin barrel files, `'use client'` solo en las hojas.

## Alcance

**Dentro:**

- Las 5 pantallas: Biblioteca, Detalle de juego, Reproductor, Acceso, Salón de la Fama.
- Navegación persistente (barra superior con panel móvil) y pie de página, en el layout raíz.
- Datos mock tipados en `lib/`: 8 juegos, 4 categorías, generador de puntajes con semilla.
- Sesión falsa: iniciar sesión acepta cualquier usuario, se guarda en localStorage, la barra muestra el nombre.
- Guardado falso de puntaje al terminar una partida simulada (escribe localStorage, no alimenta rankings).
- Pantalla `not-found` para un id de juego inexistente.
- Estado vacío de búsqueda ("NO HAY RESULTADOS").
- Responsive en 375 / 768 / 1024 / 1440 px.

**Fuera de alcance (para specs futuros):**

- Cualquier juego jugable. El reproductor es un decorado animado.
- Backend, base de datos, autenticación real, OAuth (Google/GitHub son botones inertes).
- Rankings reales: el Salón y el tablero de detalle siguen mostrando datos generados con semilla.
- El contador "CRÉDITOS · 03" es decorativo, no hay economía de créditos.
- Perfil de usuario, registro real, recuperación de contraseña.
- Filtros y pestañas en la URL (`?q=`, `?juego=`): viven en estado local.
- Tests: no hay runner configurado y no se agrega uno aquí.

## Rutas

| Ruta | Archivo | Pantalla | Render |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Biblioteca | Server + isla cliente |
| `/juego/[id]` | `app/juego/[id]/page.tsx` | Detalle | Server |
| `/juego/[id]/jugar` | `app/juego/[id]/jugar/page.tsx` | Reproductor | Server + isla cliente |
| `/acceso` | `app/acceso/page.tsx` | Acceso | Server + isla cliente |
| `/salon` | `app/salon/page.tsx` | Salón de la Fama | Server + isla cliente |
| 404 | `app/not-found.tsx` | GAME OVER · 404 | Server |

`/juego/[id]` y `/juego/[id]/jugar` exportan `generateStaticParams()` con los 8 ids. Si `getGame(id)` devuelve `undefined`, la página llama `notFound()`.

En Next 16 `params` es una Promise: `const { id } = await props.params`. Los tipos `PageProps<'/juego/[id]'>` y `LayoutProps<'/'>` son helpers globales generados por typegen — no se importan.

## Arquitectura visual

**Sistema ya existente en `app/globals.css` — se reutiliza, no se duplica:**

- Tokens: `--bg`, `--bg-2`, `--bg-3`, `--ink`, `--ink-dim`, `--ink-faint`, `--cyan`, `--magenta`, `--yellow`, `--green`, `--gold`, `--silver`, `--bronze`, `--line`, `--line-2`.
- Puente Tailwind en `@theme inline`: `bg-bg-2`, `text-ink-dim`, `border-line`, `font-pixel`, `font-mono`, etc.
- Primitivas: `.btn` (+ `.magenta` `.yellow` `.ghost` `.lg` `.xl` `.pulse`), `.chip`, `.field`.
- Utilidades: `pixel`, `neon-cyan`, `neon-magenta`, `neon-yellow`, `neon-green`, `flicker`, `fade-in`, `slide-in`, `divider`, `spinner`.
- Marco: `.av-bg`, `.av-noise`, `.av-app`, `.av-main` (ya montados en `app/layout.tsx`).
- Bloque `@media (prefers-reduced-motion: reduce)` al final del archivo.

**Se agrega a `app/globals.css`, dentro de `@layer components`, solo el arte CSS que Tailwind no expresa sin volverse ilegible:**

- Las 8 portadas generadas por CSS: `.cover-bg`, `.cover-bricks`, `.cover-tetro`, `.cover-snake`, `.cover-glot`, `.cover-invaders`, `.cover-rocas`, `.cover-rana`, `.cover-duelo` (multi-gradiente sobre `::before` / `::after`).
- El monitor: `.crt`, `.crt-screen`, `.crt-bottom`, `.game-arena`, `.grid-floor`, `.player-ship`, `.enemy`.
- Los `@keyframes` que consuman esas clases.

Cada nueva animación decorativa se agrega al bloque `prefers-reduced-motion`. El `.spinner` sigue girando: señala carga.

**Todo lo demás en utilidades Tailwind:** layout, barra de navegación, panel móvil, hero, filtros, grilla, tarjetas, detalle, tablero de puntajes, HUD, modal, formulario de acceso, podio y tabla del salón.

**Medidas heredadas del prototipo que hay que respetar:**

- Ancho de contenido `max-w-[1320px]`; el reproductor `max-w-[1100px]`; el salón `max-w-[1200px]`.
- Padding lateral 32px en escritorio, 16px por debajo de 720px.
- Grilla de juegos: `repeat(auto-fill, minmax(280px, 1fr))`, gap 22px.
- Detalle: dos columnas `1.4fr 1fr`, una sola columna por debajo de 900px.
- Barra de navegación: `sticky top-0 z-50`, `backdrop-blur`, borde inferior `--line`. Por debajo de 840px se ocultan enlaces y créditos y aparece la hamburguesa.
- Podio: 3 columnas, 1 columna por debajo de 720px.

## Correcciones al prototipo

Estas seis desviaciones son deliberadas. El resto es fidelidad 1:1.

1. **Navegación con `<Link>` real.** El prototipo usa `<a onClick>` sin `href`: no es enfocable, no abre en pestaña nueva, no comparte URL. Se reemplaza por `next/link` con href real; el estado activo se calcula con `usePathname()` y se marca con `aria-current="page"`.
2. **Tarjeta sin interactivo anidado.** El prototipo pone un `<button>JUGAR</button>` dentro de un `<div onClick>` que hace lo mismo. La tarjeta pasa a ser un `<Link>` y el "JUGAR" queda como `<span>` con el aspecto de `.btn`. Mismo pixel, un solo destino de teclado.
3. **`--ink-faint` sube a `#767ca6`.** El valor actual `#4a4f70` da 2.5:1 contra `--bg` y se usa en etiquetas, fechas y pie de página. `#767ca6` da ≈4.9:1 y cumple WCAG AA. El tono frío apagado se conserva.
4. **Objetivos táctiles de 44px.** `.chip` hoy mide ~33px de alto (padding 12/14 + fuente 9px). Se le agrega `min-height: 44px` en `globals.css`. Aplica a los filtros de categoría y a las pestañas del salón.
5. **Búsqueda sin tildes.** El prototipo compara con `toLowerCase().includes()`, así que "caida" no encuentra CAÍDA. La comparación normaliza con `normalize("NFD")` y quita diacríticos en ambos lados.
6. **Nivel derivado del puntaje.** El prototipo lo sube desde un `useEffect` con `score % 2500 < 100`, que dispara varias veces mientras el puntaje está dentro de la ventana. Aquí el nivel es `1 + Math.floor(score / 2500)`, calculado en el render.

## Modelo de datos

Sin backend. Tres módulos en `lib/`, todos tipados.

```ts
// lib/games.ts
export type Categoria = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type Game = {
  id: string;          // "bloque-buster"
  title: string;       // "BLOQUE BUSTER"
  short: string;       // texto de la tarjeta
  long: string;        // texto del detalle
  cat: Categoria;
  cover: string;       // clase CSS: "cover-bricks"
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string;       // "12.4K"
};
export const GAMES: Game[];
export const CATS: readonly ["TODOS", ...Categoria[]];
export function getGame(id: string): Game | undefined;
```

```ts
// lib/scores.ts
export type ScoreRow = { rank: number; name: string; score: number; date: string };
export function seededScores(seed: number, count?: number): ScoreRow[];
```

`seededScores` se porta tal cual del prototipo (LCG `s * 9301 + 49297 % 233280`). Es determinista: misma semilla, mismas filas en servidor y cliente. Esto es lo que permite renderizar el tablero del detalle en el servidor sin desajuste de hidratación.

```ts
// lib/session.ts
export type SessionUser = { name: string };            // "PX_KAI", máx 10 caracteres
export type SavedScore = { game: string; score: number; name: string; at: number };
export const USER_KEY = "av:user:v1";
export const SCORES_KEY = "av:scores:v1";
```

Convenciones:

- Los 8 juegos y sus textos se copian sin cambios de `references/templates/data.jsx`.
- Los números se formatean con `toLocaleString("es-ES")`.
- Todo acceso a localStorage va en `try/catch`. Si falla (modo privado, cuota), la sesión y los puntajes viven solo en memoria y la app sigue funcionando.
- localStorage se lee **después del montaje**, nunca en el inicializador de `useState`: el servidor no tiene localStorage y leerlo en el primer render rompe la hidratación. La barra renderiza "Iniciar Sesión" hasta que el efecto resuelve la sesión.

## Componentes

`components/` en la raíz, alcanzable como `@/components/...`. Importaciones directas al archivo: sin `index.ts` que re-exporte.

| Archivo | Tipo | Responsabilidad |
| --- | --- | --- |
| `session-provider.tsx` | cliente | Contexto de sesión: `user`, `signIn`, `signOut`, `saveScore`. Lee localStorage en `useEffect` |
| `site-nav.tsx` | cliente | Barra sticky, enlaces activos por `usePathname()`, panel móvil, botón de sesión |
| `site-footer.tsx` | servidor | Pie con el aviso de versión |
| `game-cover.tsx` | servidor | `<div className={"cover-bg " + game.cover}>` |
| `game-card.tsx` | cliente | Tarjeta con inclinación 3D al mover el mouse. Envuelta en `<Link>` |
| `library-browser.tsx` | cliente | Buscador + chips de categoría + grilla filtrada + estado vacío |
| `leaderboard.tsx` | servidor | Lista "MEJORES PUNTUACIONES" del detalle |
| `game-player.tsx` | cliente | HUD, CRT, pausa, puntaje simulado, modal de fin |
| `game-over-dialog.tsx` | cliente | Modal: `role="dialog"`, `aria-modal`, foco al abrir, Tab no sale del modal |
| `auth-form.tsx` | cliente | Pestañas entrar/crear, campos, invitado, botones sociales inertes |
| `hall-of-fame.tsx` | cliente | Pestañas por juego, podio, tabla, fila "tu mejor marca" |

Frontera Server/Client: las `page.tsx` son Server Components y el estado baja a las hojas. `SessionProvider` envuelve el contenido en `app/layout.tsx` porque la barra y tres pantallas (reproductor, acceso, salón) lo necesitan.

## Comportamiento por pantalla

**Biblioteca (`/`).** Hero con "ARCADE VAULT" parpadeante y la línea "INSERTA UNA MONEDA PARA JUGAR". Buscador por título (sin distinguir mayúsculas ni tildes) y 5 chips de categoría. La lista filtrada se calcula en el render, sin efecto. Grilla de tarjetas; cada tarjeta lleva a `/juego/[id]`. Sin resultados: bloque "NO HAY RESULTADOS" ocupando todo el ancho de la grilla. La inclinación 3D de la tarjeta solo se activa con puntero fino y sin `prefers-reduced-motion`.

**Detalle (`/juego/[id]`).** Portada 16:10, 4 etiquetas, título en neón cian, descripción larga, tira de estadísticas (partidas, mejor global, dificultad). "▶ JUGAR AHORA" va a `/juego/[id]/jugar`; "VOLVER AL VAULT" va a `/`. A la derecha, tablero de 10 posiciones con las tres primeras destacadas.

**Reproductor (`/juego/[id]/jugar`).** HUD con jugador, puntuación, vidas y nivel. El jugador sale de la sesión o "INVITADO", derivado en el render (no se copia a estado local). El puntaje sube entre 10 y 99 cada 220ms mientras no esté en pausa ni terminado; el intervalo se limpia al desmontar. Las vidas son decorativas y fijas en 3. Marco CRT con arena decorativa. PAUSA superpone "EN PAUSA" y el botón pasa a "REANUDAR". FIN abre el modal con la puntuación final congelada, un campo de iniciales (mayúsculas, 10 caracteres, inicializado con el nombre de sesión al abrir el modal) y "GUARDAR PUNTUACIÓN", que agrega un `SavedScore` a localStorage y muestra "▸ PUNTUACIÓN GUARDADA_". Desde el modal: "JUGAR DE NUEVO" reinicia, "VOLVER AL VAULT" va a `/`. SALIR vuelve al detalle.

**Acceso (`/acceso`).** Tarjeta centrada, dos pestañas. "CREAR CUENTA" añade el campo de correo con la animación `slide-in` y cambia el texto del botón principal. Ningún campo es obligatorio. Enviar guarda `{ name }` en mayúsculas, recortado a 10 caracteres (o "PLAYER1" si el usuario está vacío) y redirige a `/`. "JUGAR COMO INVITADO" borra la sesión y redirige a `/`. Cada `<label>` se asocia a su `<input>` por `htmlFor`/`id`, con `autoComplete` correcto. Google y GitHub son `type="button"` con `disabled` y sin acción.

**Salón (`/salon`).** Pestañas por juego (la primera activa es BLOQUE BUSTER), podio de tres con orden visual plata-oro-bronce, tabla de 12 filas con entrada escalonada de 50ms y encabezados accesibles (RANGO, JUGADOR, PUNTUACIÓN, FECHA). Con sesión activa aparecen las filas "▸ TU MEJOR MARCA EN {juego}" y la marca del usuario en amarillo, con la misma fórmula mock del prototipo.

**Barra de navegación.** Enlaces Biblioteca (activo también en `/juego/*`) y Salón de la Fama. Sin sesión: botón "Iniciar Sesión" a `/acceso`. Con sesión: botón con el nombre que cierra la sesión al hacer clic, igual que el prototipo. Por debajo de 840px: botón hamburguesa con `aria-label="Menú"` y `aria-expanded`, panel lateral con fondo oscurecido; Esc, el fondo y cualquier enlace lo cierran. Con el panel cerrado sus enlaces no reciben foco.

**404 (`app/not-found.tsx`).** "GAME OVER · 404" en fuente pixel, una línea explicando que ese juego no está en el vault y un botón de vuelta a `/`.

## Plan de implementación

1. Crear `lib/games.ts` y `lib/scores.ts` portando `data.jsx` con tipos. Verificación: `npx tsc --noEmit` pasa.
2. Agregar a `app/globals.css` el arte CSS (covers, CRT, arena) y sus keyframes; aplicar las correcciones 3 y 4 (`--ink-faint`, `min-height` de `.chip`). Verificación: `npm run dev` compila y el fondo sigue igual.
3. Crear `lib/session.ts` y `components/session-provider.tsx`, y montarlo en `app/layout.tsx`. Verificación: la app carga sin errores de hidratación.
4. Crear `components/site-nav.tsx` y `components/site-footer.tsx`; montarlos en `app/layout.tsx` alrededor de `<main className="av-main">`. Verificación: la barra se ve y el panel móvil abre a 375px.
5. Reemplazar `app/page.tsx` por la Biblioteca: hero servidor + `library-browser.tsx` + `game-card.tsx` + `game-cover.tsx`. Verificación: `/` muestra 8 tarjetas, filtra por chip y por texto.
6. Crear `app/juego/[id]/page.tsx` con `generateStaticParams`, `notFound()` y `components/leaderboard.tsx`. Verificación: `/juego/caida` renderiza el detalle.
7. Crear `app/not-found.tsx`. Verificación: `/juego/xxx` muestra el 404 arcade.
8. Crear `app/juego/[id]/jugar/page.tsx` y `components/game-player.tsx` sin el modal. Verificación: el puntaje corre y la pausa lo detiene.
9. Agregar `components/game-over-dialog.tsx` y conectarlo al botón FIN. Verificación: guardar escribe `av:scores:v1`.
10. Crear `app/acceso/page.tsx` y `components/auth-form.tsx`. Verificación: entrar deja el nombre visible en la barra tras recargar.
11. Crear `app/salon/page.tsx` y `components/hall-of-fame.tsx`. Verificación: cambiar de pestaña cambia podio y tabla.
12. Borrar de `public/` los SVG del scaffold que ya nadie referencia y actualizar la sección "Project" de `CLAUDE.md` (ya no es un scaffold; listar rutas y `components/`).

## Criterios de aceptación

- [ ] `npm run build` termina sin errores y `npx tsc --noEmit` no reporta nada.
- [ ] `npm run lint` pasa sin errores.
- [ ] Las 5 rutas responden: `/`, `/juego/bloque-buster`, `/juego/bloque-buster/jugar`, `/acceso`, `/salon`.
- [ ] `/juego/no-existe` y `/juego/no-existe/jugar` devuelven la pantalla 404, no un error en blanco.
- [ ] La consola del navegador no muestra errores de hidratación en ninguna de las 5 rutas.
- [ ] En `/`, escribir "cai" en el buscador deja una sola tarjeta (CAÍDA).
- [ ] En `/`, el chip PUZZLE deja una sola tarjeta; SHOOTER deja dos.
- [ ] En `/`, buscar "zzzz" muestra "NO HAY RESULTADOS".
- [ ] Las 8 tarjetas muestran una portada distinta, sin imágenes de mapa de bits.
- [ ] Hacer clic en una tarjeta navega a `/juego/[id]` y la URL cambia.
- [ ] Cada tarjeta es un único destino de teclado: Tab la enfoca una sola vez.
- [ ] En `/juego/[id]`, el tablero lista 10 filas ordenadas de mayor a menor puntaje y son las mismas tras recargar.
- [ ] En `/juego/[id]/jugar`, la puntuación crece sola y PAUSA la congela.
- [ ] En `/juego/[id]/jugar`, con puntaje 5000 el nivel del HUD muestra `03`.
- [ ] FIN abre el modal; guardar la puntuación agrega una entrada a `av:scores:v1` en localStorage.
- [ ] Abierto el modal de fin de juego, el foco entra en él y Tab no lo abandona.
- [ ] Salir del reproductor con la partida en curso no genera avisos en la consola (el intervalo se limpia).
- [ ] Entrar en `/acceso` con usuario "px_kai" deja "PX_KAI" en la barra, y sigue ahí tras recargar.
- [ ] Enviar `/acceso` con el usuario vacío deja "PLAYER1" en la barra.
- [ ] Cerrar sesión borra `av:user:v1` y la barra vuelve a "Iniciar Sesión".
- [ ] Con localStorage bloqueado, iniciar sesión y guardar puntaje no lanzan excepciones.
- [ ] Cada campo de `/acceso` se enfoca al hacer clic en su etiqueta.
- [ ] Los botones Google y GitHub están `disabled`.
- [ ] Con sesión activa, `/salon` muestra la fila "TU MEJOR MARCA"; sin sesión, no.
- [ ] Cambiar de pestaña en `/salon` cambia las filas del podio y de la tabla.
- [ ] La tabla de `/salon` expone las columnas RANGO, JUGADOR, PUNTUACIÓN y FECHA como encabezados a un lector de pantalla.
- [ ] En la barra, el enlace de la pantalla actual tiene `aria-current="page"`; Biblioteca lo conserva en `/juego/[id]`.
- [ ] A 375px de ancho ninguna pantalla tiene scroll horizontal y la hamburguesa abre el panel.
- [ ] El botón hamburguesa tiene `aria-label` y su `aria-expanded` refleja si el panel está abierto.
- [ ] Recorrer la Biblioteca solo con Tab alcanza buscador, chips y las 8 tarjetas, con anillo de foco visible.
- [ ] Con `prefers-reduced-motion: reduce` no hay parpadeo, pulso, inclinación de tarjeta ni desplazamiento de la rejilla de fondo.
- [ ] `--ink-faint` sobre `--bg` mide al menos 4.5:1 en un medidor de contraste.
- [ ] Todos los chips y botones `.btn` miden al menos 44px de alto.
- [ ] Ninguna `page.tsx` contiene `'use client'`.
- [ ] No existe ningún `index.ts` en `components/` ni en `lib/`.
- [ ] Ningún archivo bajo `app/` ni `components/` importa algo de `references/`.
- [ ] Comparadas lado a lado con el prototipo abierto en el navegador, a 1440px y a 375px, las 5 pantallas tienen el mismo orden de elementos, el mismo número de columnas y los mismos colores y fuentes.

## Decisiones

- **Sí:** rutas en español (`/juego/[id]`, `/acceso`, `/salon`). La interfaz y el README están en español; la URL es parte del producto.
- **Sí:** rutas anidadas en lugar del hash del prototipo. Habilita enlaces compartibles, botón atrás y prerenderizado.
- **Sí:** Tailwind para layout y componentes, `globals.css` solo para tokens, primitivas y arte CSS. Traducir los degradados multicapa de las portadas a valores arbitrarios de Tailwind produce clases ilegibles y alto riesgo de desviación visual.
- **No:** CSS Modules. Abriría un tercer sistema de estilos junto a Tailwind y `globals.css` sin ganar nada aquí.
- **No:** copiar `styles.css` entero al global. Contradice el comentario de cabecera de `globals.css` y ensucia el alcance.
- **Sí:** el reproductor replica el prototipo completo, con puntaje simulado y modal. Deja el contrato de fin de partida listo para cuando entren juegos reales.
- **No:** motor de juego, canvas, bucle de render. Es otro spec.
- **Sí:** sesión falsa en localStorage con claves versionadas `av:user:v1` y `av:scores:v1`. El prefijo permite cambiar el formato más adelante sin romper lo guardado. Las claves cambian respecto al prototipo (`av_user`, `av_scores`): no hay datos previos que preservar.
- **No:** mezclar los puntajes guardados en los rankings. Eso ya es lógica de producto, no una pantalla.
- **No:** persistencia solo en memoria. Perder la sesión al recargar haría inservible la verificación manual del flujo de acceso.
- **Sí:** `seededScores` determinista, así el tablero del detalle se renderiza en el servidor.
- **Sí:** filtros de la Biblioteca y pestañas del Salón en estado local, no en la URL. Compartir un filtro no es un caso de uso del MVP.
- **Sí:** el modal de fin de juego no se cierra con Esc. Cerrarlo dejaría la partida terminada sin puntaje guardado ni salida clara; el usuario debe elegir una de sus tres acciones.
- **Sí:** el botón de nombre en la barra cierra la sesión al primer clic, como el prototipo. Un menú desplegable de cuenta queda para el spec de perfil.
- **Sí:** botones Google y GitHub `disabled`. Un botón enfocable que no hace nada es peor que uno visiblemente inactivo.
- **Sí:** corregir contraste, objetivos táctiles, búsqueda sin tildes y nivel derivado ahora. Sale más barato que auditarlo con 5 pantallas ya construidas.
- **Sí:** definición con una sola ronda de preguntas. El usuario confirmó rutas, estilos, reproductor, persistencia, ubicación del arte CSS y extras. Las correcciones al prototipo, los nombres de archivo de `components/` y los valores concretos (`#767ca6`, 44px) son propuestas por defecto para revisar al leer este borrador.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Desajuste de hidratación por leer localStorage en el primer render | La sesión se lee en `useEffect`; el servidor siempre renderiza el estado sin sesión |
| `Math.random()` o `Date.now()` en render de servidor | Los puntajes usan semilla determinista; el azar y el reloj solo se tocan dentro del intervalo del reproductor y de manejadores de eventos |
| El arte CSS de las portadas se rompe al portarlo | Se copia textualmente de `styles.css`; se compara contra el prototipo abierto al lado |
| Tailwind no genera las clases del arte CSS | Van en `@layer components` de `globals.css`, que se emite siempre; `@source not "../references"` ya excluye el prototipo del escaneo |
| `LayoutProps` / `PageProps` no resuelven en `tsc` | Requieren que `next dev` o `next build` hayan corrido antes para generar `.next/types` |
| Datos mock incoherentes: `Game.best` (p. ej. 28.450) no coincide con el primer lugar de `seededScores` (50.000+) | Se acepta en el MVP, ambos son datos falsos. Se reconcilian cuando exista backend |
| `.btn` usa `clip-path` y recorta el anillo de foco | `globals.css` ya lo dibuja por dentro con `outline-offset: -6px`; se verifica con Tab en cada botón |
| Formato `es-ES` distinto entre Node y navegador | Los números del servidor son datos estáticos; los que cambian en el cliente (puntaje del HUD) se pintan solo tras el montaje |

## Lo que **no** está en este spec

- Juegos jugables. Ninguno de los ocho.
- Backend, base de datos, autenticación real, OAuth.
- Rankings reales o persistencia compartida entre usuarios.
- Sistema de créditos.
- Menú de cuenta, perfil de usuario.
- Filtros o pestañas sincronizados con la URL.
- Tests automatizados.

Cada uno de ellos, si entra, va en su propio spec.
