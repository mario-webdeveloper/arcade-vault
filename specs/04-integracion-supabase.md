# SPEC 04 — Integración base con Supabase

> **Estado:** Aprobado
> **Depende de:** SPEC 03
> **Fecha:** 2026-09-27
> **Objetivo:** Conectar la app al proyecto Supabase `blemopksbrerjdeubtdd` con clientes tipados de servidor y navegador, sin tablas ni auth, verificable con `GET /api/health`.

## Por qué existe este spec

Auth real, puntajes, rankings, Realtime y Edge Functions dependen de la misma base: SDK instalado, variables de entorno, clientes y carpeta `supabase/`. Hacerlo aparte deja cada spec futuro enfocado en su dominio.

SPEC 03 fijó las convenciones de servidor que aquí se reusan: env vars leídas dentro de funciones, `import "server-only"`, detalle técnico a `console.error` y nunca a la respuesta.

Estado de partida: el proyecto Supabase existe y está vacío (0 tablas en `public`). `.mcp.json` ya apunta a él. `package.json` no tiene ningún paquete de Supabase.

## Alcance

**Dentro:**

- Dependencias `@supabase/supabase-js` y `@supabase/ssr`; `supabase` (CLI) como devDependency.
- `lib/supabase/server.ts`: `createClient()` async con `createServerClient` + `cookies()` de `next/headers`, con `import "server-only"`.
- `lib/supabase/client.ts`: `createClient()` con `createBrowserClient`. Sin importadores todavía.
- `lib/supabase/database.types.ts`: tipos generados del esquema actual (vacío), usados como genérico `<Database>` en ambos clientes.
- `app/api/health/route.ts`: `GET` que comprueba la conexión real.
- `supabase/` creado con `npx supabase init` (`config.toml`, `.gitignore`). Solo archivos locales: no se crea carpeta de migraciones.
- Env vars `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.example` (versionado) y `.env.local` (local).
- Script `db:types` en `package.json`.
- `CLAUDE.md`: sección "Supabase" (archivos, env vars, cómo regenerar tipos).

**Fuera de alcance (para specs futuros):**

- Auth real, `proxy.ts` de refresco de sesión, reemplazo de `SessionProvider` / `lib/session.ts`.
- Tablas, RLS, `profiles`, puntajes, rankings reales.
- Realtime, Edge Functions (`supabase/functions/`), Storage.
- Secret key / service role y cliente admin.
- Stack local con Docker (`supabase start`).
- UI nueva: ninguna pantalla cambia.

## Modelo de datos

Este spec no introduce tablas. Estructuras nuevas:

```ts
// app/api/health/route.ts — cuerpo de respuesta
type Health =
  | { ok: true; latencyMs: number }
  | { ok: false; reason: "config" | "unreachable" };
```

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=https://blemopksbrerjdeubtdd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # sb_publishable_…
```

Convenciones:

- Env vars leídas **dentro** de `createClient()`, nunca a nivel de módulo: una clave ausente no rompe el import ni el build.
- `lib/supabase/*` se importa por ruta directa (`@/lib/supabase/server`); sin barrel.

## Plan de implementación

1. `npm i @supabase/supabase-js @supabase/ssr` y `npm i -D supabase`. `npm run build` sigue verde.
2. `npx supabase init` (sin Docker ni `start`). Añadir script `"db:types": "supabase gen types typescript --project-id blemopksbrerjdeubtdd > lib/supabase/database.types.ts"`.
3. Env vars: añadir bloque Supabase a `.env.example`. Crear las mismas claves en `.env.local`: URL rellena, publishable key obtenida con MCP `get_publishable_keys`.
4. Generar `lib/supabase/database.types.ts` con MCP `generate_typescript_types` (alternativa: `npm run db:types` tras `supabase login`).
5. Escribir `lib/supabase/server.ts` y `lib/supabase/client.ts` según el `@supabase/ssr` instalado. Server con `getAll` / `setAll` sobre `cookies()` y `setAll` en `try/catch` (un Server Component no puede escribir cookies). Antes, leer `node_modules/next/dist/docs/01-app/` para `cookies()` y Route Handlers en Next 16, y el README del paquete instalado.
6. `app/api/health/route.ts`: dinámico, sin caché.
   - Sin env vars: `503 {ok:false, reason:"config"}`.
   - Crea el cliente server (prueba el cableado) y hace ping a `${URL}/auth/v1/health` con header `apikey`, midiendo latencia.
   - Fallo de red o respuesta no-2xx: `503 {ok:false, reason:"unreachable"}` y `console.error` con el detalle.
   - Éxito: `200 {ok:true, latencyMs}`.
7. Actualizar `CLAUDE.md`: sección "Supabase" y nota de que ya existe un Route Handler además de la Server Action de contacto.

## Criterios de aceptación

- [ ] `package.json` lista `@supabase/supabase-js` y `@supabase/ssr` en `dependencies`, y `supabase` en `devDependencies`.
- [ ] Existe `supabase/config.toml` y no existe `supabase/migrations/`.
- [ ] El proyecto remoto sigue con 0 tablas en `public`.
- [ ] `.env.example` contiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `.env.local` no está en git.
- [ ] `lib/supabase/server.ts` importa `server-only`.
- [ ] Ningún archivo de `lib/supabase/` lee env vars a nivel de módulo.
- [ ] Ambos clientes usan `<Database>` de `lib/supabase/database.types.ts`.
- [ ] Con claves correctas, `GET /api/health` responde `200` con `{"ok":true,"latencyMs":<n>}`.
- [ ] Sin `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `GET /api/health` responde `503` con `{"ok":false,"reason":"config"}`.
- [ ] Sin `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `npm run build` pasa.
- [ ] Con URL inválida, `GET /api/health` responde `503` con `{"ok":false,"reason":"unreachable"}`, y el detalle solo aparece en la consola del servidor.
- [ ] `npm run lint` y `npm run build` pasan.
- [ ] `/`, `/biblioteca`, `/salon`, `/acceso` y `/acerca` renderizan igual que antes.

## Decisiones

- **Sí:** `@supabase/ssr`. Patrón oficial para App Router con cookies; lo necesitará el spec de auth.
- **No:** `proxy.ts` ahora. Sin auth no hay sesión que refrescar y correría en cada request para nada. Llega con auth.
- **Sí:** publishable key (`sb_publishable_…`).
- **No:** anon key legacy. Supabase la está retirando.
- **No:** secret key ni cliente admin. Llegan con el primer spec que los necesite (Edge Functions / admin).
- **Sí:** `supabase init` + CLI como devDependency. `config.toml` y `supabase/functions/` serán necesarios para Edge Functions, y habilita `gen types`.
- **No:** stack local con Docker. Setup pesado en Windows; se trabaja contra el proyecto remoto.
- **No:** migraciones en este spec. No se toca la base de datos; el esquema llega con el primer spec que lo necesite.
- **Sí:** `/api/health` como verificación. Prueba conexión real sin tablas y sirve para monitoreo.
- **No:** script npm aparte (no prueba el cliente de Next) ni solo build (no prueba red).
- **Sí:** ping a `auth/v1/health`. Endpoint estable que existe sin esquema.
- **No:** consultar una tabla inexistente para detectar conexión. Truco frágil que depende del código de error.
- **Sí:** tipos generados desde ya aunque el esquema esté vacío. Los clientes nacen tipados y cuando un spec futuro cambie el esquema solo hay que regenerarlos.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Falta la publishable key en `.env.local` | Env vars leídas dentro de funciones; `/api/health` devuelve `reason:"config"` y el resto de la app aún no usa Supabase. |
| API de `@supabase/ssr` o de Next 16 distinta a la conocida | El paso 5 obliga a leer las docs locales de Next y el README del paquete instalado antes de escribir. |
| OneDrive bloquea `.next/` o binarios en `node_modules/` | Procedimiento ya documentado en `CLAUDE.md` (borrar `.next/server` y `.next/static` y reconstruir). |
| `/api/health` es público | Solo expone `ok`, `latencyMs` y `reason`; nunca URLs, claves ni mensajes de error. |

## Lo que **no** está en este spec

- Auth real ni `proxy.ts`.
- Tablas, RLS, perfiles, puntajes, rankings.
- Realtime, Edge Functions, Storage.
- Secret key / cliente admin.
- Cambios de UI.

Cada uno, si llega, va en su propio spec.
