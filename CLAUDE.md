# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault: online games platform where players compete for highest score (README is in Spanish). Current state: the visual MVP from `specs/01-mvp-pantallas-visuales.md` — five screens ported from the prototype in `references/templates/` — plus the landing from `specs/02-home-evolucionado.md` (Home at `/`, catalog moved to `/biblioteca`) and the About + Contact page from `specs/03-acerca-y-contacto.md` (`/acerca`), with mock data and a fake session, and the Supabase base wiring from `specs/04-integracion-supabase.md` (clients + `/api/health`, no tables). **No playable game, database schema, real auth or real rankings yet.** Server code: the contact form's Server Action, which sends real email through Resend (see "Server code and environment"), and the `/api/health` Route Handler (see "Supabase").

Spec-driven development: specs live in `specs/` and are written/implemented with the `/spec` and `/spec-impl` skills (`.claude/skills/`, from `Klerith/fernando-skills`). `/spec-impl` works on a `spec-NN-slug` branch and never commits on its own. New behavior goes in a new spec, not in code by surprise.

No test runner is configured.

### Routes (`app/`)

| Route | File | Screen |
| --- | --- | --- |
| `/` | `page.tsx` | Home landing: hero with CRT cabinet, figures strip, why, featured games (`FEATURED`), activity (demo data), closing (FAQ + `$0` + final CTA). Sections below the hero reveal on scroll |
| `/biblioteca` | `biblioteca/page.tsx` | Library: hero + `LibraryBrowser` (search accent-insensitive, category chips) |
| `/juego/[id]` | `juego/[id]/page.tsx` | Game detail + leaderboard. `generateStaticParams` for the 8 ids, `notFound()` otherwise |
| `/juego/[id]/jugar` | `juego/[id]/jugar/page.tsx` | Player: decorative CRT, simulated score, pause, game-over dialog |
| `/acceso` | `acceso/page.tsx` | Fake sign-in: any username works, social buttons are disabled |
| `/salon` | `salon/page.tsx` | Hall of fame: podium + table per game, "your best mark" row when signed in |
| `/acerca` | `acerca/page.tsx` | About + contact: hero with project plate, pillars, honest status panel, divider, contact form (`#contacto`). Static, own `metadata`; sections below the hero reveal on scroll |
| 404 | `not-found.tsx` | "GAME OVER · 404" |

`page.tsx` files are Server Components (no `'use client'`); state lives in the leaf components below. `app/layout.tsx` mounts `SessionProvider`, `SiteNav` and `SiteFooter` around `<main className="av-main">`.

Naming convention: **"VAULT" is the catalog.** Every "back" link and redirect (detail, hall, 404, game-over dialog, sign-in) goes to `/biblioteca`; only the nav logo goes to `/`.

### Components (`components/`)

Imported by direct path (`@/components/...`); there are no barrel files. `'use client'` only where needed.

- Client: `session-provider` (context: `user`, `signIn`, `signOut`, `saveScore`; also exports `useSession`), `site-nav` (sticky bar + mobile panel, active link from `usePathname()`; Inicio / Biblioteca / Salón / Acerca de, full bar from 1210px, hamburger below: with four links the bar needs ~1205px incl. scrollbar, so the cut was raised from 1200px), `game-card` (whole card is one `<Link>`, pointer tilt), `library-browser`, `game-player`, `game-over-dialog` (focus trap, no Esc), `auth-form`, `hall-of-fame`, `home-hero-ctas` (second hero button follows the session), `scroll-reveal` (the only scroll island: after mount marks below-the-fold `[data-reveal]` elements `pending`, then `in` when visible; `globals.css` hides only `pending`, under `prefers-reduced-motion: no-preference`, so no JS / reduced motion shows everything), and the contact islands: `contact-form` (`useActionState` on `sendContact`; the inner component owns the state and an outer `key` remounts it for "send another"; per-field errors on blur, focusable error summary, honeypot), `contact-message-field` (textarea + character counter, isolated so typing repaints only it) and `contact-terminal` (VAULT-OS report of a real send: `status` on success, `alert` on failure).
- Server: `site-footer`, `game-cover` (CSS-art cover from `Game.cover`), `leaderboard`, and the Home blocks: `home-hero` (copy + 3 floating silhouettes + cabinet), `home-cabinet` (decorative CRT reusing `.crt` / `.game-arena`), `home-stats`, `home-features`, `home-activity`, `home-closing`, plus the reusable `section-head` (kicker + `<h2>` + rule) and `pixel-icon` (8 kinds; fixed `size-11`, shrink from the parent with `[&>svg]:size-5`). The featured-games section is inline in `app/page.tsx`. The `/acerca` blocks: `about-hero`, `about-plate` (project data plate, figures from `VAULT_STATS`, no version number on purpose), `about-pillars`, `about-status` (only `HECHO` / `PENDIENTE`), `about-divider` and `contact-section`.

### Data (`lib/`)

- `games.ts`: `Game` type, `GAMES` (8), `CATS`, `getGame(id)`.
- `home.ts`: Home data. `FEATURED` (top 4 of `GAMES` by `best`) and `VAULT_STATS` are derived from `GAMES`/`CATS` at module scope; `RECENT_SCORES` and `TOP_TODAY` are static mock literals (no `Date.now()`/`Math.random()`: the Home is prerendered), shown labelled as demo data.
- `scores.ts`: `seededScores(seed, count)` — deterministic LCG, so server and client render the same board (no hydration mismatch).
- `session.ts`: `SessionUser`, `SavedScore`, keys `av:user:v1` / `av:scores:v1`, and storage helpers. Every localStorage access is in `try/catch`; if storage is blocked the session/scores live in memory only. The session is read in an effect **after mount**, never in a `useState` initializer.
- `about.ts`: static `/acerca` content (`PILLARS`, `STATUS_ITEMS`), prerendered (no `Date.now()`/`Math.random()`).
- `contact.ts`: shared by client and server (no directive): `TOPICS`, `LIMITS`, `ContactState`, `INITIAL_STATE`, and `validateContact`, the **single source of truth** for the form rules (client anticipates on blur, server decides on every send).

### Server code and environment

Contact server code lives in `lib/` (the other server code is the Supabase Route Handler, see "Supabase"):

- `contact-action.ts` (`'use server'`): `sendContact(prev, formData)`. Order: honeypot `sitio_web` filled → returns `sent` without calling Resend; `validateContact` → `invalid`; **awaits** `sendNotice` → `failed` (`reason: "config" | "delivery"`); the acknowledgement goes in `after()` so it can never sink a message that reached the team. A `'use server'` file may only export async functions.
- `mailer.ts` (`import "server-only"`): Resend SDK (`emails.send` returns `{ data, error }`, option is `replyTo`), HTML-escapes name/email/message, never throws from `sendReceipt`. Env vars are read **inside** functions, never at module scope, so a missing key can't break the import or the build. Details for the visitor go to the UI in plain words; technical detail goes to `console.error`, never to the screen.
- Env vars (`.env.example` is versioned, `.env.local` is not; `.gitignore` has `!.env.example`): `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (default `onboarding@resend.dev`), `CONTACT_TO_EMAIL`, optional `CONTACT_PUBLIC_EMAIL` (read at build: `/acerca` is static, changing it needs a rebuild). Restart `next dev` after editing `.env.local`.
- Until a domain is verified in Resend, `onboarding@resend.dev` only delivers to the account owner: `CONTACT_TO_EMAIL` must be that address and the acknowledgement to anyone else will fail (logged, harmless).
- Out of scope, by design: rate limit, captcha, Zod, message storage.

### Supabase

Remote project `blemopksbrerjdeubtdd` (`.mcp.json` points to it). Base wiring only: **0 tables in `public`**, no auth, no `proxy.ts`, no local Docker stack, no migrations.

- `lib/supabase/server.ts` (`import "server-only"`): async `createClient()` with `createServerClient<Database>` over `await cookies()` (`getAll` / `setAll`; `setAll` in `try/catch` because a Server Component can't write cookies; its second `headers` argument is ignored until auth arrives). Also exports `readSupabaseEnv()` → `{ url, key } | null`.
- `lib/supabase/client.ts`: `createClient()` with `createBrowserClient<Database>`. No importers yet.
- `lib/supabase/database.types.ts`: generated, never edit by hand. Regenerate after any schema change with MCP `generate_typescript_types` or `npm run db:types` (needs `npx supabase login`).
- Env vars are read **inside** `createClient()`, never at module scope; missing vars throw a generic error. Import by direct path (`@/lib/supabase/server`), no barrel.
- `app/api/health/route.ts`: `GET` → `await connection()` (request time, never prerendered), then pings `${URL}/auth/v1/health` with `apikey` header (5 s timeout). `200 {ok:true, latencyMs}`; missing env `503 {ok:false, reason:"config"}`; network error / non-2xx `503 {ok:false, reason:"unreachable"}` with detail only in `console.error`. `Cache-Control: no-store`. Public: never put URLs, keys or error messages in the body.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`, not the legacy anon key). No secret key / admin client yet.
- `supabase/` from `npx supabase init`: `config.toml` (its `project_id` is the local stack name, not the remote ref) and `.gitignore` (`.temp`, `.branches`). `supabase` CLI is a devDependency.

## Skills

Para cualquier tarea relacionada con diseño, rediseño o implementación de interfaces de usuario, aplica obligatoriamente las skills correspondientes.

- **Diseño UI/UX:** usa siempre `frontend-design` y `ui-ux-pro-max` antes de crear o modificar una interfaz. Aplícalas para definir estructura visual, jerarquía, layout, componentes, estilos, responsive design, accesibilidad y experiencia de usuario.

- **Referencias visuales:** si el usuario proporciona una captura de pantalla, mockup, diseño de referencia o describe una interfaz que desea recrear o mejorar, usa `frontend-design` y `ui-ux-pro-max` para analizarla y convertirla en una propuesta de UI coherente con el proyecto.

- **React / Next.js:** cuando crees, modifiques, refactorices u optimices código React o Next.js (`.tsx`, `.jsx`, componentes, layouts, páginas, etc.), usa siempre `vercel-react-best-practices`.

Estas skills deben aplicarse de forma proactiva cuando la tarea corresponda a su ámbito, aunque el usuario no las mencione explícitamente.

## Stack notes

- Next.js 16.3.5 App Router + React 19.2 + TypeScript (`strict`). Per AGENTS.md, this Next version differs from training data: read `node_modules/next/dist/docs/01-app/` before writing Next code.
- Tailwind v4, CSS-first: no `tailwind.config`. Theme tokens live in `app/globals.css` (`@import "tailwindcss"` + `@theme inline`); PostCSS plugin set in `postcss.config.mjs`. Dark mode via `prefers-color-scheme` swapping `--background`/`--foreground`.
- Fonts: Geist / Geist Mono via `next/font/google` in `app/layout.tsx`, exposed as `--font-geist-sans` / `--font-geist-mono`.
- `@/*` path alias maps to repo root (no `src/` dir), e.g. `@/app/...`.
- `LayoutProps<"/">` in `app/layout.tsx` is a global type helper generated by Next typegen (into `.next/types`) — not imported. Needs `next dev`/`next build` to have run for `tsc` to see it.
- `AGENTS.md` block is written and re-added by `next dev`; don't remove it. `next-env.d.ts` and `.env*` are gitignored (except the versioned `.env.example`).
- The repo sits inside OneDrive, which can lock `.next/`: `npm run build` may fail with `EPERM ... unlink '.next/server/...'` (or `.next/static/...`). Delete `.next/server` and `.next/static` (gitignored build output, not `.next/dev`) and rebuild.
- Playwright MCP screenshots (and any other MCP output) go in `.playwright-screenshots/` at repo root. `--output-dir .playwright-screenshots` in the local MCP config (`claude mcp get playwright`) only covers screenshots **without** `filename`; a bare `filename` lands in the repo root. So either omit `filename` or pass `.playwright-screenshots/<name>.png`.
- `references/` (prototype JSX/HTML/CSS) is not app source: excluded from ESLint (`globalIgnores`) and from Tailwind scanning (`@source not`), and app code must not import from it.
