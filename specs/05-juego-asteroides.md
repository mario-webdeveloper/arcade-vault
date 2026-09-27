# SPEC 05 — Juego Asteroides jugable

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-27
> **Objetivo:** Portar el Asteroids de `references/started-games/02-asteroids/` como juego nuevo `asteroides`, jugable en `/juego/asteroides/jugar` dentro del CRT, con un motor en canvas que notifica a React puntaje, vidas, nivel, pausa y fin de partida.

## Por qué existe este spec

Hasta ahora ningún juego es jugable: `GamePlayer` simula el puntaje con un `setInterval`. Este es el primer juego real y fija el patrón para los siguientes: motor TypeScript sin React que pinta en su propio canvas y emite eventos; React solo escucha y muestra.

`asteroides` es un juego **nuevo**. `rocas` (id existente, mock) se parece por casualidad y no se toca.

Fuente: `game.js` (≈510 líneas, clases `Bullet`, `Asteroid`, `PowerUp`, `Ship`, `Particle`, canvas fijo 800×600, loop `requestAnimationFrame` con `dt` limitado a 50 ms). El CRT (`.crt-screen`) ya es 4:3, igual que 800×600.

## Alcance

**Dentro:**

- Entrada nueva en `GAMES` (`lib/games.ts`): id `asteroides`. El catálogo pasa a 9 juegos.
- Portada CSS nueva `cover-asteroides` en `app/globals.css`.
- Motor TypeScript en `games/asteroides/` (raíz del repo, sin React, sin `'use client'`): port fiel de la jugabilidad original (física, tamaños, puntos, power-up triple disparo, niveles, invencibilidad al reaparecer).
- El motor pinta en su canvas y **mantiene su HUD dentro del canvas** (SCORE, NIVEL, iconos de vida, indicador `3x`).
- El motor **notifica a React** los cambios de estado: puntaje, vidas, nivel, pausa y fin de partida.
- Paleta neón del Vault en el canvas: nave cian, asteroides magenta/amarillo, power-up y `3x` en verde/cian, fondo negro.
- `components/asteroids-player.tsx` (cliente): barra superior como la de `GamePlayer` (JUGADOR, PUNTUACIÓN, VIDAS, NIVEL, botones PAUSA / FIN / SALIR) con valores **reales** del motor, canvas dentro del `.crt`, overlay "EN PAUSA", y `GameOverDialog` al terminar.
- `components/asteroids-touch-controls.tsx` (cliente): botonera bajo el CRT (◄ ► ▲ FUEGO), visible solo con `pointer: coarse`; mantener pulsado = tecla mantenida.
- Controles de teclado: flechas + espacio (original), WASD alternativo (A/D girar, W empuje), P o Esc = pausa/reanudar.
- Autopausa cuando la pestaña pierde visibilidad (`visibilitychange`).
- `app/juego/[id]/jugar/page.tsx`: si `id === "asteroides"` monta `AsteroidsPlayer`; el resto sigue con `GamePlayer` simulado.
- `CLAUDE.md`: estado del proyecto, rutas, componentes y carpeta `games/`.

**Fuera de alcance (para specs futuros):**

- Otros juegos jugables (los 8 restantes, incluido `rocas`, siguen con el player simulado).
- Rankings reales / Supabase: detalle y Salón siguen con `seededScores` mock para `asteroides`.
- Actualizar `best` / `plays` con partidas reales.
- "Tu mejor marca" del Salón con las puntuaciones guardadas en `av:scores:v1` (hoy es una fórmula mock en `hall-of-fame.tsx`, para todos los juegos).
- Sonido.
- OVNIs u otras mecánicas que no estén en `game.js`.
- Gamepad.
- Registro genérico de motores (se hace cuando llegue el segundo juego real).

## Modelo de datos

```ts
// lib/games.ts — entrada nueva
{
  id: "asteroides",
  title: "ASTEROIDES",
  short: "…",            // frase corta, estilo del catálogo
  long: "…",             // sin mencionar mecánicas que no existen (OVNIs)
  cat: "SHOOTER",
  cover: "cover-asteroides",
  color: "cyan",
  best: 0,
  plays: "0",
}
```

```ts
// games/asteroides/engine.ts — contrato con React
export type AsteroidsSnapshot = {
  score: number;
  lives: number;   // 3 al empezar
  level: number;   // 1 al empezar
};

export type AsteroidsEvents = {
  onChange: (snap: AsteroidsSnapshot) => void; // solo cuando cambia algún valor, nunca por frame
  onPauseChange: (paused: boolean) => void;
  onGameOver: (finalScore: number) => void;
};

export type AsteroidsAction = "left" | "right" | "thrust" | "fire";

export type AsteroidsGame = {
  pause(): void;
  resume(): void;
  togglePause(): void;
  end(): void;                                   // botón FIN: detiene y dispara onGameOver
  restart(): void;                               // JUGAR DE NUEVO
  setAction(action: AsteroidsAction, down: boolean): void; // botonera táctil
  destroy(): void;                               // cancela rAF y quita listeners
};

export function createAsteroidsGame(
  canvas: HTMLCanvasElement,
  events: AsteroidsEvents,
): AsteroidsGame;
```

Convenciones:

- Resolución interna fija 800×600; el canvas se escala por CSS al ancho de `.crt-screen` (mismo 4:3).
- Coordenadas con origen arriba-izquierda, velocidades en px/s, `dt` en segundos (igual que el original).
- Estados internos: `"playing" | "dead" | "paused" | "gameover"`.
- Sin globals: todo el estado vive en el closure/instancia de `createAsteroidsGame`.
- `Math.random()` y `performance.now()` solo se ejecutan tras montar (dentro del motor), nunca en render.
- La puntuación guardada usa el `saveScore` existente (`av:scores:v1`) con `game: "asteroides"`. Sin claves nuevas de localStorage.

## Plan de implementación

1. Entrada `asteroides` en `GAMES` + `.cover-asteroides` en `globals.css`. Verificar: aparece en `/biblioteca`, `/juego/asteroides` renderiza, `/juego/asteroides/jugar` muestra el player simulado (aún sin motor).
2. `games/asteroides/entities.ts`: port a TS de `Bullet`, `Asteroid`, `PowerUp`, `Ship`, `Particle`, utilidades (`wrap`, `dist`, `rand`) y constantes. `draw` recibe el `ctx` por parámetro (sin `ctx` global). Colores neón. Sin cambios en la app todavía.
3. `games/asteroides/engine.ts`: `createAsteroidsGame` con loop rAF, `update`/`draw`, HUD en canvas, input de teclado (flechas, WASD, espacio, P/Esc) en `window` con `preventDefault` solo para esas teclas, `visibilitychange` → pausa, y eventos `onChange` / `onPauseChange` / `onGameOver`. Se quita el overlay "ESPACIO PARA REINICIAR" y el reinicio con espacio. Las teclas se ignoran mientras el foco está en un `input`/`textarea`.
4. `components/asteroids-player.tsx`: crea el motor en `useEffect` (ref al canvas), `destroy()` en el cleanup. Estado React: snapshot, `paused`, `over`, `finalScore`. Barra con valores reales (vidas como ♥ según `lives`). PAUSA → `togglePause()`, FIN → `end()`, SALIR → `/juego/asteroides`. Overlay "EN PAUSA" existente. `GameOverDialog` con `onRestart` → `restart()`.
5. `app/juego/[id]/jugar/page.tsx`: bifurcar a `AsteroidsPlayer` para `asteroides`. Probar partida completa con teclado.
6. `components/asteroids-touch-controls.tsx`: 4 botones bajo el CRT, `pointerdown`/`pointerup`/`pointercancel`/`pointerleave` → `setAction`, `touch-action: none`, visibles solo con `@media (pointer: coarse)`, con `aria-label`. Montarlo en `AsteroidsPlayer`.
7. Actualizar `CLAUDE.md` (estado, tabla de rutas, componentes, carpeta `games/`, patrón motor → eventos → React).

## Criterios de aceptación

- [x] `/biblioteca` muestra 9 juegos, incluido ASTEROIDES con portada `cover-asteroides`; `rocas` sigue igual.
- [x] `/juego/asteroides` renderiza detalle y leaderboard (mock); `npm run build` prerenderiza `/juego/asteroides` y `/juego/asteroides/jugar`.
- [x] En `/juego/asteroides/jugar` el juego corre en un canvas dentro de `.crt-screen`, escalado sin deformarse.
- [x] El canvas muestra su propio HUD: SCORE, NIVEL, iconos de vida y `3x Ns` con power-up activo.
- [x] Destruir un asteroide grande / mediano / pequeño suma 20 / 50 / 100 y la barra React muestra el mismo puntaje que el canvas.
- [x] Perder una vida baja los ♥ de la barra; pasar de nivel actualiza NIVEL en la barra.
- [x] Flechas y WASD giran y empujan; espacio dispara; la página no hace scroll al pulsarlas.
- [x] P, Esc y el botón PAUSA pausan y reanudan; la barra muestra PAUSA/REANUDAR y el overlay "EN PAUSA" en sincronía.
- [x] Cambiar de pestaña pausa el juego.
- [x] Al perder las 3 vidas se abre `GameOverDialog` con el puntaje final; no aparece el texto "ESPACIO PARA REINICIAR".
- [x] FIN abre `GameOverDialog` con el puntaje actual y el motor deja de moverse.
- [x] GUARDAR PUNTUACIÓN guarda en `av:scores:v1` con `game: "asteroides"` y el puntaje final. (El Salón sigue mostrando "tu mejor marca" mock: leer las puntuaciones guardadas queda para un spec futuro.)
- [x] JUGAR DE NUEVO reinicia: puntaje 0, 3 vidas, nivel 1, asteroides nuevos.
- [x] Escribir iniciales en el diálogo no mueve ni dispara la nave.
- [x] Salir de la ruta (SALIR o navegación) no deja rAF ni listeners activos (sin errores en consola al volver a entrar).
- [x] En viewport táctil (`pointer: coarse`) aparecen ◄ ► ▲ FUEGO bajo el CRT y mantenerlos pulsados controla la nave; en escritorio con ratón no aparecen.
- [x] Los otros 8 juegos siguen usando el player simulado sin cambios.
- [x] `games/asteroides/` no importa React ni tiene `'use client'`.
- [x] Sin errores ni warnings de hidratación en consola; `npm run lint` y `npm run build` pasan.

## Decisiones

- **Sí:** juego nuevo con id `asteroides`. Es el juego real; `rocas` es un mock anterior.
- **No:** reusar o renombrar `rocas`. Cambiaría una URL existente y mezclaría mock con real.
- **Sí:** `rocas` se queda. Borrarlo no es parte de este spec.
- **Sí:** `best: 0`, `plays: "0"`. Honesto: aún no hay récords reales. Consecuencia aceptada: no entra en `FEATURED`.
- **Sí:** motor TS puro en `games/asteroides/` con API imperativa + eventos. El juego vive en su canvas; React solo escucha. Sin re-render a 60 fps.
- **No:** copiar `game.js` a `public/` con `next/script`. Globals en `window`, sin tipos, imposible limpiar al cambiar de ruta.
- **No:** estado del juego en `useState`/`useReducer`. Re-render por frame.
- **Sí:** HUD en canvas **y** barra React a la vez. El HUD es parte del juego; la barra da el marco de la plataforma.
- **Sí:** `onChange` solo cuando cambia un valor. Evita renders innecesarios.
- **Sí:** `GameOverDialog` existente para el fin de partida. Reusa guardado en localStorage y el flujo de la plataforma.
- **No:** overlay "GAME OVER / ESPACIO PARA REINICIAR" del original. Duplicaría el diálogo.
- **Sí:** paleta neón del Vault. Encaja con el CRT y los scanlines.
- **Sí:** `AsteroidsPlayer` separado y bifurcación en `jugar/page.tsx`. No complica `GamePlayer`.
- **No:** registro genérico de motores. Con un solo juego real sería abstracción prematura.
- **Sí:** WASD y P/Esc además de los controles originales.
- **Sí:** botonera táctil bajo el CRT solo con `pointer: coarse`. No tapa el área de juego.
- **No:** botones superpuestos en el canvas.
- **Sí:** rankings mock para `asteroides` como el resto. Los reales llegan con Supabase.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| rAF o listeners vivos tras salir de la ruta (React Strict Mode monta dos veces en dev) | `destroy()` idempotente en el cleanup del `useEffect`; el motor no toca nada fuera de su canvas y sus listeners. |
| Espacio/flechas hacen scroll o activan el botón enfocado | `preventDefault` en las teclas del juego; se ignoran cuando el foco está en `input`/`textarea`. |
| Esc: el diálogo lo ignora a propósito y el juego lo usa para pausar | Con `over` activo el motor está en `gameover` e ignora P/Esc. |
| Canvas borroso al escalar | Resolución interna 800×600 y escala CSS proporcional; no se toca DPR en este spec. |
| `dt` enorme al volver de otra pestaña | Autopausa en `visibilitychange` + tope de `dt` a 50 ms del original. |
| Next 16 difiere de lo conocido | Leer `node_modules/next/dist/docs/01-app/` antes de tocar `page.tsx`. |

## Lo que **no** está en este spec

- Otros juegos jugables.
- Rankings reales, Supabase, actualización de `best`/`plays`.
- Sonido, gamepad, OVNIs.
- Registro genérico de motores.

Cada uno, si llega, va en su propio spec.
