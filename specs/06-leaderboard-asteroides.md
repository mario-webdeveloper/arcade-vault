# SPEC 06 — Leaderboard real de Asteroides en Supabase

> **Estado:** Implementado
> **Depende de:** SPEC 04, SPEC 05
> **Fecha:** 2026-09-27
> **Objetivo:** Crear en Supabase las tablas `games` (solo `asteroides`) y `scores`, guardar puntuaciones de Asteroides con un RPC validado y mostrar su ranking real (top 10 por nombre, mejor marca y partidas) en detalle, Salón, catálogo y diálogo de fin de partida.

## Por qué existe este spec

SPEC 04 dejó los clientes Supabase sin tablas. SPEC 05 dejó el primer juego real, pero sus puntuaciones solo viven en `av:scores:v1` y todos los rankings son `seededScores`. Este spec da el primer uso real a la base: ranking compartido entre jugadores, sin auth todavía.

Sin auth no hay identidad fiable. Por eso la escritura pasa por una función Postgres que valida, y la tabla no admite inserts directos.

## Alcance

**Dentro:**

- Primera migración (`supabase/migrations/`): tablas `games` y `scores`, RLS, función `submit_score`, vista `leaderboard`. Semilla: una fila en `games` (`asteroides`, tope 1.000.000).
- Regenerar `lib/supabase/database.types.ts`.
- `lib/supabase/public.ts` (`server-only`): cliente de lectura **sin cookies** para páginas prerenderizadas.
- `lib/leaderboard.ts` (`server-only`): `getLeaderboard(gameId)` y `getGameStats(gameId)`; devuelven `null` si Supabase falla.
- `lib/score-action.ts` (`'use server'`): `submitScore` llama al RPC y ejecuta `revalidatePath` de las rutas afectadas.
- `GameOverDialog`: para `asteroides`, además de guardar en local, envía al servidor y muestra "PUESTO #N"; si falla, "GUARDADO SOLO EN ESTE EQUIPO" + REINTENTAR.
- `/juego/asteroides`: leaderboard, "Partidas" y "Mejor global" reales.
- `/salon`: podio + tabla de `asteroides` reales; "tu mejor marca" de `asteroides` = mejor puntuación en `av:scores:v1`.
- `/biblioteca` (tarjeta de `asteroides`): `best` real.
- ISR: `revalidate = 60` en esas rutas + `revalidatePath` tras cada guardado.
- Estado degradado: "RANKING NO DISPONIBLE" y `—` si la lectura falla.
- `CLAUDE.md`: esquema, RPC, cliente público, patrón de lectura.

**Fuera de alcance (para specs futuros):**

- Auth real, perfiles, identidad por usuario.
- Los otros 8 juegos en BD: siguen con `seededScores` y `best`/`plays` estáticos.
- Catálogo completo en BD (`lib/games.ts` sigue siendo la fuente de textos, portadas y categorías).
- `FEATURED` y cifras de la Home con datos reales.
- Contar partidas iniciadas (solo se cuentan puntuaciones guardadas).
- Anti-trampas más allá de validación y tope (firma de partidas, rate limit, captcha).
- Secret key / cliente admin.
- Realtime, moderación de nombres, borrado de puntuaciones.

## Modelo de datos

```sql
-- supabase/migrations/<timestamp>_leaderboard.sql
create table public.games (
  id         text primary key,          -- mismo id que lib/games.ts
  title      text not null,
  max_score  integer not null check (max_score > 0),
  created_at timestamptz not null default now()
);

create table public.scores (
  id         bigint generated always as identity primary key,
  game_id    text not null references public.games(id),
  name       text not null check (char_length(name) between 1 and 10),
  score      integer not null check (score >= 0),
  created_at timestamptz not null default now()
);
create index scores_game_score_idx on public.scores (game_id, score desc);

-- RLS: lectura pública en ambas; sin políticas de insert/update/delete.
-- Vista `leaderboard` (security_invoker): mejor marca por (game_id, name) y su fecha.
-- Función submit_score(p_game text, p_name text, p_score int) returns int
--   security definer, search_path = ''. Valida: juego existe, nombre recortado
--   1..10, score entero 0..games.max_score. Inserta y devuelve el puesto (1-based)
--   del nombre en el ranking por mejor marca. grant execute a anon, authenticated.

insert into public.games (id, title, max_score) values ('asteroides', 'ASTEROIDES', 1000000);
```

```ts
// lib/leaderboard.ts
export type GameStats = { best: number; plays: number }; // plays = count(scores)
getLeaderboard(gameId: string, limit = 10): Promise<ScoreRow[] | null>; // ScoreRow de lib/scores.ts
getGameStats(gameId: string): Promise<GameStats | null>;

// lib/score-action.ts
export type SubmitResult = { ok: true; rank: number } | { ok: false };
submitScore(input: { game: string; name: string; score: number }): Promise<SubmitResult>;
```

Convenciones:

- `ScoreRow` existente (`rank`, `name`, `score`, `date` `dd/mm/aaaa`) se reusa: `Leaderboard` y `HallOfFame` no cambian de contrato.
- Fechas formateadas en servidor en UTC (`dd/mm/aaaa`) para no romper hidratación.
- Env vars leídas dentro de funciones; detalle de errores solo en `console.error`.
- Sin claves nuevas de localStorage: `av:scores:v1` sigue igual.

## Plan de implementación

1. Migración con tablas, índice, RLS, vista, función y semilla; aplicar con MCP `apply_migration`. Verificar con `execute_sql`: 1 fila en `games`; `submit_score` rechaza juego inexistente, nombre vacío/11 chars, score negativo y > 1.000.000; acepta uno válido y devuelve puesto. Revisar `get_advisors` (seguridad). Borrar las filas de prueba.
2. Regenerar `database.types.ts` (MCP `generate_typescript_types`). `npm run build` verde.
3. `lib/supabase/public.ts` + `lib/leaderboard.ts`. Leer antes `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` y `09-revalidating.md`.
4. `/juego/[id]`: si `id === "asteroides"` usa `getLeaderboard`/`getGameStats`; resto sigue mock. `revalidate = 60`. `Leaderboard` acepta `rows: ScoreRow[] | null` y muestra "RANKING NO DISPONIBLE" con `null` y "SIN PUNTUACIONES TODAVÍA" con `[]`.
5. `/salon`: la página lee el ranking de `asteroides` y lo pasa a `HallOfFame` como prop; "tu mejor marca" de `asteroides` desde `av:scores:v1` (tras montar). `revalidate = 60`.
6. `/biblioteca`: la página lee `getGameStats("asteroides")` y la pasa a `LibraryBrowser` → `GameCard` sustituye `best` de `asteroides` (`—` si `null`). `revalidate = 60`.
7. `lib/score-action.ts` + `GameOverDialog`: guardar local siempre; para `asteroides` llamar `submitScore` con estado enviando / "PUESTO #N" / "GUARDADO SOLO EN ESTE EQUIPO" + REINTENTAR. Tras éxito, `revalidatePath` de `/juego/asteroides`, `/salon`, `/biblioteca`.
8. Actualizar `CLAUDE.md` (estado, sección Supabase: tablas, RPC, cliente público; datos reales solo para `asteroides`).

## Criterios de aceptación

- [x] `public` tiene exactamente `games` y `scores`; `games` tiene una fila: `asteroides` con `max_score = 1000000`.
- [x] RLS activo en ambas tablas; `insert` directo a `scores` con la publishable key es rechazado.
- [x] `submit_score` rechaza juego inexistente, nombre vacío o de 11+ caracteres, score negativo y score > 1.000.000.
- [x] `get_advisors` (security) no reporta problemas en las tablas, vista o función nuevas, salvo los WARN 0028/0029 (`anon`/`authenticated_security_definer_function_executable`) en `submit_score`, esperados por diseño.
- [x] `database.types.ts` incluye `games`, `scores`, `leaderboard` y `submit_score`.
- [x] Ningún archivo nuevo lee env vars a nivel de módulo; `public.ts` y `leaderboard.ts` importan `server-only`.
- [x] `npm run build` prerenderiza `/juego/asteroides`, `/salon` y `/biblioteca` (marcadas ISR, no dinámicas).
- [x] Guardar una partida de asteroides muestra "PUESTO #N" y la fila aparece en `scores`.
- [x] Tras guardar, al recargar `/juego/asteroides`, `/salon` y `/biblioteca` se ve el nuevo dato sin esperar 60 s.
- [x] El leaderboard de asteroides muestra máx. 10 filas y un nombre aparece una sola vez (con su mejor marca).
- [x] "Partidas" = número de filas en `scores` para `asteroides`; "Mejor global" = máximo score.
- [x] Sin filas, el leaderboard dice "SIN PUNTUACIONES TODAVÍA" y "Mejor global" muestra `0`.
- [x] Con Supabase inaccesible (URL inválida), las tres rutas renderizan, el leaderboard dice "RANKING NO DISPONIBLE", la mejor marca muestra `—`, y el detalle solo aparece en consola del servidor.
- [x] Con el RPC fallando, el diálogo muestra "GUARDADO SOLO EN ESTE EQUIPO" y REINTENTAR; la puntuación sí queda en `av:scores:v1`.
- [x] "Tu mejor marca" de asteroides en `/salon` coincide con la mejor puntuación local guardada.
- [x] Los otros 8 juegos muestran exactamente lo mismo que antes (mock), y la Home no cambia.
- [x] Sin errores ni warnings de hidratación; `npm run lint` y `npm run build` pasan.

## Decisiones

- **Sí:** Supabase para `games` y `scores`. Ranking compartido; primer uso real de SPEC 04.
- **No:** solo localStorage. Ranking de un único navegador.
- **Sí:** `games` solo con `asteroides`. La tabla lista los juegos reales que tenemos; los demás entran cuando sean jugables.
- **No:** migrar el catálogo completo. Rompería el prerender y `generateStaticParams` sin ganancia.
- **Sí:** RPC `submit_score` security definer llamado desde Server Action con la publishable key. Valida en la base y sin secret key.
- **No:** secret key + cliente admin. Más superficie de riesgo para lo mismo.
- **No:** insert directo con política RLS. Cualquiera escribiría por la API REST sin la validación de puesto.
- **Sí:** tope de 1.000.000 en `games.max_score`. Corta valores absurdos; por juego, ajustable.
- **Sí:** top 10 con una fila por nombre. Un jugador no llena el ranking.
- **Sí:** `plays` = puntuaciones guardadas. Honesto: no registramos partidas iniciadas.
- **Sí:** ISR (`revalidate = 60`) + `revalidatePath` al guardar. Rápido y fresco tras cada guardado.
- **No:** render dinámico por request. Más lento y sin prerender.
- **Sí:** cliente de lectura sin cookies (`lib/supabase/public.ts`). El de `server.ts` usa `cookies()` y volvería dinámicas las rutas.
- **Sí:** guardar siempre en local y además en remoto. Un fallo de red no pierde la puntuación.
- **Sí:** mensaje honesto si la lectura falla. La página sigue viva.
- **No:** `FEATURED`/Home con datos reales. Evita volver dinámica la Home.
- **Sí:** "tu mejor marca" de asteroides desde `av:scores:v1`. Sin auth, el nombre no identifica a nadie en la BD.
- **Sí:** otros 8 juegos con mock sin cambios. Mezclar puntuaciones simuladas en un ranking real sería engañoso.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `cookies()` vuelve dinámicas las rutas ISR | Lecturas con `lib/supabase/public.ts`, sin cookies. Criterio de build lo comprueba. |
| Supabase caído en build | `getLeaderboard`/`getGameStats` devuelven `null`; el build pasa y se prerenderiza el estado degradado, que ISR corrige en ≤60 s. |
| Trampas (puntuación falsa vía RPC) | Validación + tope en la función. Anti-trampas real queda para otro spec; aceptado. |
| Nombres ofensivos | Sin moderación en este spec; aceptado. |
| Función security definer mal configurada | `search_path = ''`, nombres calificados, revisión con `get_advisors`. |
| Advisor 0028/0029 avisa que `anon`/`authenticated` ejecutan `submit_score` (security definer) | Intencional: es la única vía de escritura, sin secret key. La función valida juego, nombre y tope; se acepta el WARN. |
| Hidratación por fechas | Fecha formateada en servidor con zona fija; el cliente no la recalcula. |
| Next 16 difiere de lo conocido | Leer docs locales de caching/revalidating antes del paso 3. |

## Lo que **no** está en este spec

- Auth, perfiles, identidad por usuario.
- Los otros 8 juegos en BD, catálogo completo en BD.
- Home/`FEATURED` con datos reales.
- Anti-trampas avanzado, moderación, Realtime, secret key.

Cada uno, si llega, va en su propio spec.
