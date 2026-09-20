# SPEC 03 — Acerca de y Contacto con envío real por Resend

> **Estado:** aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-09-20
> **Objetivo:** Añadir `/acerca` —misión, pilares, estado honesto del proyecto y un formulario de contacto que envía correos reales con Resend— y un cuarto enlace en la barra.

## Por qué existe este spec

SPEC 02 dejó fuera `about.jsx` del prototipo con una razón explícita: *"el formulario además no tendría destino"*. Este spec le da destino, y al hacerlo cambia dos cosas de naturaleza en el proyecto:

1. **Aparece la primera ruta con lógica de servidor.** Hoy no hay ni una Server Action, ni un Route Handler, ni una variable de entorno en todo el repositorio. El envío de correo introduce `'use server'`, `server-only`, `RESEND_API_KEY` y la primera dependencia de runtime (`resend`).
2. **Aparece el primer formulario que puede fallar.** `components/auth-form.tsx` es el único `<form>` de la app y no tiene validación, ni mensajes de error, ni estado de envío, ni una sola región `aria-live` en todo `components/`. No hay patrón que copiar: este spec lo define, y lo define para que el resto del portal pueda reusarlo.

El prototipo (`references/templates/home-about/about.jsx`, `styles.css:1068-1146`) es un buen punto de partida visual con defectos que no se portan: tres `<label>` sin `htmlFor` y controles sin `id` ni `name`; validación que es solo un `shake` de 400ms, invisible para tecnología de apoyo; éxito que ni se anuncia ni mueve el foco; `.reveal { opacity: 0 }` en CSS puro, de modo que sin JS el formulario es permanentemente invisible; y cero `prefers-reduced-motion` en 1744 líneas. Este spec porta la intención, no el marcado.

Se conserva lo que define la identidad: negro casi puro, Press Start 2P + JetBrains Mono, cuarteto neón, marcos discontinuos, el divisor magenta con píxeles y el terminal VAULT-OS. Cada desviación está justificada en "Evolución respecto al prototipo".

## Skills obligatorias en la implementación

`CLAUDE.md` del repo las exige y este spec las asume:

- `frontend-design` y `ui-ux-pro-max`: de ellas salen las decisiones de "Evolución respecto al prototipo" y las reglas de la sección "Formulario y feedback". La referencia visual no es una restricción: es un punto de partida que se mejora cuando la mejora está argumentada.
- `vercel-react-best-practices`: `app/acerca/page.tsx` sin `'use client'`; islas cliente mínimas y solo donde hay estado; sin estado derivado en efectos; importaciones por ruta directa; el contador de caracteres aislado para que teclear no repinte el formulario.

## Alcance

**Dentro:**

- Ruta `/acerca` con cuatro bloques: hero con ficha del proyecto, "En qué creemos", "En qué vamos" y "Contacto".
- Cuarto enlace "Acerca de" en la barra y el panel móvil; "Salón de la Fama" se acorta a "Salón" en la barra.
- Formulario: nombre, correo, tema (radios), mensaje con contador.
- Envío por Server Action con validación en servidor y dos correos por Resend: aviso al buzón del proyecto y acuse de recibo a quien escribió.
- Errores por campo, resumen de errores enfocable, estado de envío, y terminal VAULT-OS como informe real de éxito y de fallo.
- Variables de entorno preparadas: `.env.example` versionado y `.env.local` local con la clave vacía para que el usuario la ponga.
- Responsive en 375 / 768 / 1024 / 1440 px, `prefers-reduced-motion` y foco visible.

**Fuera de alcance (para specs futuros):**

- Rate limit, captcha (Turnstile) y Zod. El usuario lo descartó: *"es solo algo de prueba"*.
- Dominio verificado en Resend. Mientras no exista, el remitente es `onboarding@resend.dev`.
- Panel o bandeja de mensajes recibidos, adjuntos, guardar mensajes en base de datos.
- Juegos jugables, cuenta real, ranking real. Todo sigue siendo mock.
- Tests automatizados: sigue sin runner.
- Enlace a Contacto en el pie de página.

## Rutas

| Ruta | Archivo | Cambio |
| --- | --- | --- |
| `/acerca` | `app/acerca/page.tsx` | **Nueva.** Server Component con `metadata` propia |
| `/acerca#contacto` | — | Ancla a la sección de contacto (`id="contacto"`) |

La barra pasa a `Inicio · Biblioteca · Salón · Acerca de`. `/acceso` sigue fuera de `NAV_LINKS`.

## Evolución respecto al prototipo

Nueve cambios. Cada uno resuelve un problema concreto.

1. **Hero asimétrico con "ficha del proyecto".** El prototipo centra todo y fija `padding: 80px 32px 40px`, sin reducirlo en móvil (64px de gutter a 360px, el 18% del ancho). La nueva versión pone copy a la izquierda y una placa de datos a la derecha: filas con reglas finas, como la placa del lateral de un mueble arcade. Sus cifras salen de `VAULT_STATS`, no se escriben a mano. No se reusa el gabinete CRT del Home: es la firma de esa página y repetirlo abarata las dos.
2. **Kickers que describen.** `▸ ACERCA DE`, `▸ EN QUÉ CREEMOS`, `▸ EN QUÉ VAMOS`, `▸ CONTACTO`, con la rotación de color neón y sin numerar, igual que fijó SPEC 02.
3. **Un bloque que dice la verdad: "En qué vamos".** El prototipo afirma *"PROYECTO EN CONSTANTE CRECIMIENTO"* sin decir dónde está. Aquí es un panel de objetivos de videojuego con dos estados reales, `✔ HECHO` y `○ PENDIENTE`, y una línea que dice en claro que los juegos aún no son jugables y que puntuaciones, sesión y actividad son de demostración. Coherente con SPEC 02.
4. **Pilares con contenido, no consignas.** Las tres tarjetas del prototipo son una línea de 10px en Press Start 2P, con un emoji ❤️ que se lee "red heart" en mitad de la frase y un `transitionDelay` escalonado que no anima nada (solo retrasa 160ms el hover de la tercera). Pasan a cuatro tarjetas con `<h3>` y párrafo, una por color neón, iconos `aria-hidden` y sin emoji.
5. **Formulario accesible.** Cada control lleva `<label htmlFor>`, `id`, `name` y `autoComplete`. Errores en línea atados con `aria-describedby` más `aria-invalid`, resumen de errores enfocable, validación al salir del campo, valores conservados si el envío falla, botón deshabilitado mientras envía.
6. **Selector de tema.** Cuatro radios nativos dentro de `<fieldset>` con `<legend>`, pintados como `.chip`. El tema entra en el asunto del correo y la bandeja se ordena sola.
7. **El terminal deja de ser decorado y pasa a ser el informe real.** En el prototipo imprime cuatro `[OK]` enlatados y aparece de golpe, dentro de `.contact-form`, de modo que el marco discontinuo cian se superpone al marco verde. Aquí es un componente propio, fuera del formulario, que solo imprime lo que ocurrió: validación, entrega con referencia del envío o `[FALLO]` con vía de recuperación. Es el único elemento donde se gasta audacia.
8. **Promesas no verificables fuera.** `RESPUESTA EN 24-48H` y `SIN SPAM, JAMÁS` se sustituyen por tres líneas que el código sí cumple (ver "Contenido de cada bloque").
9. **Movimiento que respeta al usuario.** `shake` del formulario, parpadeo de los píxeles del divisor y del cursor del terminal van bajo `motion-safe:`; con `prefers-reduced-motion: reduce` no se mueve nada. El `shake` deja de ser el único aviso de error. El reveal reusa el mecanismo `[data-reveal]` + `scroll-reveal.tsx` de SPEC 02, que degrada bien sin JS, en lugar del `.reveal { opacity: 0 }` del prototipo.

## Modelo de datos

Un módulo puro compartido por cliente y servidor, uno solo de servidor, y uno de contenido.

```ts
// lib/contact.ts — sin directiva: lo importan el cliente y el servidor
export const TOPICS = [
  { id: "sugerencia", label: "Sugerencia",        subject: "Sugerencia" },
  { id: "juego",      label: "Proponer un juego", subject: "Propuesta de juego" },
  { id: "fallo",      label: "Reportar un fallo", subject: "Reporte de fallo" },
  { id: "saludo",     label: "Saludar",           subject: "Saludo" },
] as const;
export type ContactTopic = (typeof TOPICS)[number]["id"];

export const LIMITS = {
  nombre:  { min: 2,  max: 40 },
  correo:  { max: 254 },
  mensaje: { min: 10, max: 2000, warnAt: 1800 },
} as const;

export type ContactField = "nombre" | "correo" | "tema" | "mensaje";
export type ContactValues = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactState =
  | { status: "idle" | "invalid"; values: ContactValues; errors: ContactErrors }
  | { status: "failed"; values: ContactValues; errors: ContactErrors; reason: "config" | "delivery" }
  | { status: "sent"; nombre: string; correo: string; tema: ContactTopic; ref: string | null };

export const INITIAL_STATE: ContactState;
export function validateContact(values: ContactValues): ContactErrors;
```

```ts
// lib/contact-action.ts — 'use server'
export async function sendContact(prev: ContactState, formData: FormData): Promise<ContactState>;

// lib/mailer.ts — import "server-only"
export async function sendNotice(input: NoticeInput): Promise<{ ok: true; ref: string } | { ok: false; reason: "config" | "delivery" }>;
export async function sendReceipt(input: ReceiptInput): Promise<void>;   // best-effort: registra y no lanza
```

```ts
// lib/about.ts — contenido estático, sin Date.now() ni Math.random()
export type Pillar = { title: string; body: string; color: Game["color"]; icon: PixelIconKind };
export type StatusItem = { text: string; done: boolean };
export const PILLARS: Pillar[];        // 4
export const STATUS_ITEMS: StatusItem[];
```

Convenciones:

- `validateContact` es **la única fuente de verdad** de las reglas: la usa el cliente al salir de un campo y el servidor en cada envío. El servidor manda; el cliente solo adelanta el aviso.
- Los nombres de campo (`nombre`, `correo`, `tema`, `mensaje`) van en español, como en `auth-form.tsx`. Los ids llevan el prefijo del formulario: `contacto-nombre`, `contacto-correo`, `contacto-mensaje`.
- Las cifras de la ficha se derivan de `VAULT_STATS` (`lib/home.ts`) y se formatean con `toLocaleString("es-ES")`.
- La ficha **no lleva número de versión**: el pie dice `v2.6.0` y `package.json` dice `0.1.0`, dos verdades que no se deben repetir en una tercera pantalla.

### Variables de entorno

```bash
# .env.example — versionado
RESEND_API_KEY=
CONTACT_FROM_EMAIL="Arcade Vault <onboarding@resend.dev>"
CONTACT_TO_EMAIL=
# Opcional. Correo visible en la página (bloque <noscript> y error de envío). Se lee en build.
CONTACT_PUBLIC_EMAIL=
```

- `.env.local` se crea con las mismas claves y **sin valores** en `RESEND_API_KEY` y `CONTACT_TO_EMAIL`: el usuario pega su clave ahí. Está ignorado por `.gitignore:42` (`.env*`); `.env.example` necesita la excepción `!.env.example`.
- Mientras el remitente sea `onboarding@resend.dev`, Resend solo entrega al correo dueño de la cuenta: `CONTACT_TO_EMAIL` debe ser ese correo.
- Las variables se leen **dentro de las funciones**, nunca en el ámbito del módulo, para que una clave ausente no rompa la importación.
- `next dev` no recarga `.env.local` en caliente: hay que reiniciarlo tras pegar la clave.

## Arquitectura del envío

```
contact-form.tsx  ('use client')   useActionState -> formAction
      |
      v
contact-action.ts ('use server')   sendContact(prev, formData)
      |   1. honeypot relleno            -> devuelve "sent" y no envía nada
      |   2. validateContact             -> "invalid" con errores por campo
      |   3. await sendNotice()          -> "failed" si Resend falla o falta la clave
      |   4. after(sendReceipt())        -> acuse fuera del camino crítico
      |   5. devuelve "sent" con ref
      v
mailer.ts ('server-only')          Resend SDK, escape de HTML
```

- **Server Action y no Route Handler.** Trae la comprobación Origin/Host, no deja un endpoint público que martillear y es el camino idiomático de esta versión para formularios (`node_modules/next/dist/docs/01-app/02-guides/forms.md`, `server-actions.md`). Una Server Action no hace dinámica la página: `/acerca` sigue prerenderizándose.
- **El aviso se espera; el acuse no.** Si el aviso falla, el envío falla y el usuario lo ve. El acuse va en `after()` (`import { after } from "next/server"`) porque con `onboarding@resend.dev` y sin dominio verificado **fallará para cualquier destinatario que no sea el dueño de la cuenta**, y eso no puede tumbar un envío que sí llegó al equipo. Sus fallos se registran con `console.error`.
- El SDK de `resend` se instala en el paso 1; **los nombres exactos de sus opciones (`replyTo`, forma de `{ data, error }`) se verifican contra los tipos del paquete instalado**, no de memoria.

## Seguridad del correo

- **Validación estricta en servidor**, siempre, aunque el cliente ya haya validado.
- **Rechazo de `\r` y `\n`** en `nombre`, `correo` y `tema`: es lo que evita la inyección de cabeceras (el nombre va en el asunto y el correo en `reply_to`).
- **`tema` contra la lista cerrada `TOPICS`**: un valor fuera de la lista es un error, no un asunto libre.
- **Escape de HTML** de nombre, correo y mensaje antes de construir el cuerpo de ambos correos.
- **`reply_to`** del aviso con el correo de quien escribe, para responder directo desde la bandeja.
- **Honeypot**: campo señuelo `sitio_web`, fuera de pantalla, `tabIndex={-1}`, `autoComplete="off"`, contenedor `aria-hidden`. Si llega relleno, la acción devuelve `sent` sin referencia y no llama a Resend. Es la única defensa anti-bot y se acepta como suficiente para una prueba.
- **La clave no sale del servidor**: `lib/mailer.ts` abre con `import "server-only"` y `RESEND_API_KEY` no lleva el prefijo `NEXT_PUBLIC_`.
- **Si falta `RESEND_API_KEY` o `CONTACT_TO_EMAIL`**, la acción devuelve `failed` con `reason: "config"` y el visitante ve un mensaje legible; el detalle técnico va a `console.error`, nunca a la pantalla.

## Formulario y feedback

Reglas de `ui-ux-pro-max` (todas de severidad alta o crítica) aplicadas al formulario:

- **Resumen de errores enfocable** encima de los campos: `role="alert"`, `tabIndex={-1}`, `<h3>` "Revisa estos campos" y un enlace `href="#contacto-…"` por campo inválido. Tras un envío inválido el foco va a él. **No sustituye** a los errores en línea.
- **Error por campo** bajo el control, con `id` propio, referenciado por `aria-describedby`, más `aria-invalid="true"` mientras exista. Nunca solo un borde de color.
- **Validación al salir del campo** (`onBlur`) con `validateContact`. El error se retira al teclear cuando el valor pasa a ser válido, no antes. No se mueve el foco en cada blur.
- **Mensajes que dicen qué hacer, sin disculpas:**
  - `nombre`: "Escribe tu nombre (entre 2 y 40 caracteres)."
  - `correo`: "Escribe un correo válido, por ejemplo jugador@vault.gg."
  - `mensaje`: "Escribe al menos 10 caracteres." / "El mensaje supera los 2000 caracteres."
  - `tema`: "Elige un tema."
  - saltos de línea: "El nombre no puede tener saltos de línea." (y equivalente para correo).
- **Envío**: el botón pasa a `disabled` con el texto `ENVIANDO…` mientras `pending`; el `<form>` lleva `aria-busy={pending}`. Sin doble envío.
- **Éxito**: el terminal es `role="status"`, recibe el foco (`tabIndex={-1}`) y sustituye al formulario. `ENVIAR OTRO MENSAJE` remonta un formulario vacío (cambia una `key`).
- **Fallo de entrega**: el formulario **se queda**, con los valores conservados, y encima aparece el terminal en modo fallo con `role="alert"` y el foco. React 19 reinicia los campos no controlados tras una acción, así que **cada campo toma su `defaultValue` de `state.values`**.
- **Selector de tema**: `<input type="radio" name="tema">` nativos, con `sugerencia` marcado por defecto (no existe el estado "sin elegir"). Son nativos y no botones `aria-pressed` porque la elección es excluyente: las flechas del teclado funcionan solas, Tab entra al grupo una sola vez y el valor viaja en el `FormData`. Cada `<label>` lleva `chip` y el estado marcado se pinta con `has-checked:` y `has-focus-visible:`, sin CSS nuevo.
- **Contador del mensaje**: `n / 2000`, `aria-hidden` en uso normal; a partir de 1800 caracteres pasa a `role="status"` y a magenta. **Sin `maxLength`**: pegar un texto largo no se trunca en silencio; el contador se pone en rojo y el error aparece al salir del campo. Vive en `contact-message-field.tsx` para que teclear repinte solo el contador.

## Componentes

`components/` en la raíz, importaciones directas al archivo, sin `index.ts`.

| Archivo | Tipo | Responsabilidad |
| --- | --- | --- |
| `about-hero.tsx` | servidor | Kicker, `<h1>` de tres líneas, misión en dos párrafos y la ficha |
| `about-plate.tsx` | servidor | Ficha del proyecto: `<dl>` con filas y reglas finas, desde `VAULT_STATS` |
| `about-pillars.tsx` | servidor | 4 tarjetas, una por color neón, mapa de clases literal por color |
| `about-status.tsx` | servidor | Panel de objetivos: `<ul>` con `✔ HECHO` / `○ PENDIENTE` |
| `about-divider.tsx` | servidor | Barra magenta + 24 píxeles parpadeantes, `aria-hidden` |
| `contact-section.tsx` | servidor | `SectionHead`, intro, tres líneas de expectativa, correo directo opcional, `<noscript>` |
| `contact-form.tsx` | **cliente** | `useActionState`, campos, resumen de errores, honeypot, gestión de foco |
| `contact-message-field.tsx` | **cliente** | `<textarea>` + contador aislados |
| `contact-terminal.tsx` | **cliente** (lo importa un cliente) | Terminal VAULT-OS: éxito y fallo |

`app/acerca/page.tsx` sigue siendo Server Component: exporta `metadata`, compone y monta `<ScrollReveal />` al final. Los únicos componentes cliente **nuevos** son `contact-form`, `contact-message-field` y `contact-terminal`.

**Reutilizados sin cambios:** `section-head.tsx` (`{ kicker, title, color, id }`), `scroll-reveal.tsx`, `lib/home.ts` (`VAULT_STATS`), la clase `.field`, la clase `.btn`, la clase `.chip`.

**Modificados:**

- `components/site-nav.tsx`: cuarta entrada en `NAV_LINKS` (`{ href: "/acerca", label: "Acerca de", isActive: (p) => p === "/acerca" }`) y `"Salón de la Fama"` → `"Salón"`. El corte `min-[1200px]` **no se toca**. Si un cuarto enlace no cupiera a 1200px, ver "Riesgos".
- `components/pixel-icon.tsx`: se amplía `PixelIconKind` con `corazon`, `navegador`, `planta` y `sobre` y su registro `SHAPES`, sobre la misma rejilla 16×16 de `<rect>` con recortes `fill-bg`. `trofeo` se reusa.
- `app/globals.css`: `.field textarea` (hoy `.field` solo estiliza `input`), estado `aria-invalid`, `@keyframes shake` y `@keyframes pxblink`. Toda animación de clase que se añada entra en el bloque `prefers-reduced-motion: reduce` existente; las que se apliquen con `motion-safe:` ya quedan excluidas.
- `.gitignore`: `!.env.example` tras la línea 42.
- `package.json`: dependencia `resend`.
- `CLAUDE.md`: tabla de rutas, lista de componentes y una nota sobre el primer código de servidor y las variables de entorno.

## Contenido de cada bloque

Todo el texto es propuesta por defecto para revisar al leer este borrador.

**Hero.** Kicker `▸ ACERCA DE` en amarillo. `<h1>` de tres `<span>`: `GUARDAMOS` en blanco, `LOS ARCADES` en degradado cian, `QUE NOS MARCARON` en degradado magenta (vault = bóveda: un lugar donde se guarda lo que importa). Misión en dos párrafos. Primero: nació del amor por los clásicos y quiere preservar y celebrar los arcades que definieron una generación. Segundo: hoy es un portal en construcción, con catálogo, salón de la fama y mecánica de puntuación ya dibujados, y los juegos llegan después. A la derecha, la ficha: `JUEGOS 08`, `CATEGORÍAS 04`, `MEJOR MARCA 184.220`, `ESTADO EN CONSTRUCCIÓN`, `COSTO $0`. Una columna por debajo de 901px, con la ficha bajo el copy.

**En qué creemos (`▸ EN QUÉ CREEMOS`).** Cuatro tarjetas, 4 / 2 / 1 columnas como `home-features`:

- magenta · `corazon` · **HECHO POR JUGADORES**: nació de jugar los mismos clásicos una y otra vez; las decisiones se toman pensando en quien tiene el mando en la mano.
- cian · `navegador` · **SIN INSTALAR NADA**: los juegos se construyen para correr en cualquier navegador; un enlace y a jugar.
- amarillo · `trofeo` · **LA MARCA MANDA**: un puntaje es un puntaje; el salón de la fama existe para competir contra otros y contra tu mejor marca.
- verde · `planta` · **CRECE A LA VISTA**: el proyecto avanza por etapas y dice en cuál está; lo que aún no funciona se rotula como demostración.

**En qué vamos (`▸ EN QUÉ VAMOS`).** Panel con dos grupos. `✔ HECHO`: catálogo con búsqueda y categorías; ficha de cada juego con tabla de posiciones; salón de la fama con podio por juego; portada y esta página. `○ PENDIENTE`: primer juego jugable; cuentas y sesión reales; ranking con marcas reales. Pie del panel: "Hoy las puntuaciones, la sesión y la actividad son de demostración." No se escribe el número de juegos a mano.

**Divisor.** Barra magenta, 24 píxeles cian/magenta/amarillo parpadeando en `steps(2)`, barra magenta. `aria-hidden`.

**Contacto (`▸ CONTACTO`, `id="contacto"`).** `<h2>` "ESCRÍBENOS". Subtítulo: "Una sugerencia, un juego que te gustaría ver, un fallo que encontraste o solo un saludo." Tres LEDs, cada uno una afirmación que el código cumple: `TE LLEGA UN ACUSE DE RECIBO`, `TU CORREO SOLO SE USA PARA RESPONDERTE`, `NO HAY LISTA DE CORREO`. Si `CONTACT_PUBLIC_EMAIL` existe: "También puedes escribir a …" con `mailto:` y el icono `sobre`. `<noscript>`: "¿Sin JavaScript? Si el formulario no responde, escríbenos a …" (con el correo si existe). Columnas `1fr 1.2fr` desde 901px, una por debajo.

**Terminal, éxito.**

```
vault@arcade:~$ ./send_message --tema=sugerencia
[OK] Validación: 4 campos correctos
[OK] Aviso entregado al equipo · ref 3f9a12c4
[..] Acuse de recibo en cola para jugador@vault.gg
> MENSAJE RECIBIDO. GRACIAS, PX_KAI._
```

La línea `ref` sale del identificador que devuelve Resend (primeros 8 caracteres) y se omite si `ref` es `null` (caso honeypot). El acuse dice "en cola", no "enviado": `after()` no permite saber el resultado.

**Terminal, fallo.**

```
vault@arcade:~$ ./send_message --tema=fallo
[OK] Validación: 4 campos correctos
[FALLO] No se pudo entregar el aviso
> TU MENSAJE SIGUE EN EL FORMULARIO. REINTENTA O ESCRIBE A <correo>.
```

Con `reason: "config"` la segunda línea de error dice "El envío no está disponible ahora mismo" y no nombra variables. `[FALLO]` va en magenta y con el texto por delante: el color no es la única señal. Los tres puntos de la barra del terminal son decorativos (`aria-hidden`) y su línea inferior es verde, no cian.

## Plan de implementación

Cada paso deja el sistema funcionando y compilando.

1. `npm install resend`. Añadir `!.env.example` a `.gitignore`. Crear `.env.example` y `.env.local` con las claves de "Variables de entorno". Verificación: `git status` muestra `.env.example` y no `.env.local`; `npm run build` pasa.
2. Crear `lib/contact.ts` (`TOPICS`, `LIMITS`, tipos, `INITIAL_STATE`, `validateContact`). Verificación: `npx tsc --noEmit` pasa.
3. Crear `lib/mailer.ts` y `lib/contact-action.ts`. Comprobar contra los tipos instalados de `resend` las opciones exactas del SDK. Verificación: `npx tsc --noEmit` pasa y `npm run build` pasa.
4. Añadir a `app/globals.css` `.field textarea`, el estado `aria-invalid` y los `@keyframes shake` y `pxblink`; ampliar `components/pixel-icon.tsx` con `corazon`, `navegador`, `planta` y `sobre`. Verificación: `npm run dev` compila y las pantallas de SPEC 01 y 02 no cambian.
5. Crear `lib/about.ts`, `components/about-plate.tsx` y `components/about-hero.tsx`, y con ellos `app/acerca/page.tsx` (hero + `metadata` + `ScrollReveal`). Verificación: `/acerca` muestra el hero y la ficha con 08, 04 y 184.220.
6. Añadir "Acerca de" a `NAV_LINKS` en `components/site-nav.tsx` y acortar "Salón de la Fama" a "Salón". Verificación: cuatro enlaces sin envolverse a 1200px y a 1440px; el activo es correcto en las siete rutas; el panel móvil a 375px los lista.
7. Crear `components/about-pillars.tsx` y montarlo. Verificación: cuatro tarjetas, cuatro colores, 4 / 2 / 1 columnas.
8. Crear `components/about-status.tsx` y `components/about-divider.tsx` y montarlos. Verificación: el panel muestra los dos grupos; con movimiento reducido el divisor no parpadea.
9. Crear `components/contact-terminal.tsx`, `components/contact-message-field.tsx`, `components/contact-form.tsx` y `components/contact-section.tsx` y montarlos. Verificación: el formulario se ve; enviarlo vacío muestra el resumen de errores con el foco y no llama a Resend.
10. **Envío real.** El usuario pega `RESEND_API_KEY` y `CONTACT_TO_EMAIL` en `.env.local` y se reinicia `npm run dev`. Verificación: un envío válido llega a `CONTACT_TO_EMAIL` con asunto `[Arcade Vault] {tema} · {nombre}` y `reply_to` correcto; con la clave vacía el terminal muestra el fallo y el formulario conserva lo escrito.
11. Pasada responsive (375 / 768 / 1024 / 1440), movimiento reducido, teclado y JavaScript desactivado.
12. Actualizar `CLAUDE.md`.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores y `npx tsc --noEmit` no reporta nada.
- [ ] `npm run lint` pasa sin errores.
- [ ] `/acerca` existe, tiene `metadata` propia con título `Acerca de · Arcade Vault` y no muestra errores de hidratación en la consola.
- [ ] La barra tiene cuatro enlaces `Inicio · Biblioteca · Salón · Acerca de`, ninguno se envuelve ni desborda a 1200px, y el activo es Acerca de en `/acerca`.
- [ ] `/salon` sigue titulándose "Salón de la Fama"; solo cambia la etiqueta de la barra.
- [ ] La ficha imprime `08`, `04` y `184.220`, y ninguno de esos tres números está escrito a mano en el JSX.
- [ ] No aparece en `/acerca` la cadena `24-48`, `SPAM`, `EN VIVO` ni ❤️.
- [ ] La página tiene un único `<h1>`; "En qué creemos", "En qué vamos" y "Escríbenos" son `<h2>`; los pilares y el resumen de errores son `<h3>`.
- [ ] Cada control del formulario tiene `<label htmlFor>` con un `id` que coincide, y el grupo de tema tiene `<fieldset>` con `<legend>`.
- [ ] Enviar el formulario vacío muestra el resumen de errores con un enlace por campo inválido, mueve el foco a él y **no** produce ninguna llamada a Resend.
- [ ] Cada campo inválido tiene `aria-invalid="true"` y un mensaje enlazado por `aria-describedby`.
- [ ] `validateContact` rechaza `\n` y `\r` en `nombre`, `correo` y `tema`, y rechaza un `tema` fuera de `TOPICS`.
- [ ] Un correo sin forma válida y un mensaje de menos de 10 o más de 2000 caracteres se rechazan con el texto de "Formulario y feedback".
- [ ] Con `sitio_web` relleno desde la consola del navegador, el envío devuelve éxito y **no** llega ningún correo ni aparece en el panel de Resend.
- [ ] Con clave y destino válidos, un envío real llega a `CONTACT_TO_EMAIL` con asunto `[Arcade Vault] {tema} · {nombre}` y `reply_to` igual al correo escrito.
- [ ] Un mensaje `<b>hola</b>` llega como texto literal, no como HTML interpretado.
- [ ] Si el destinatario del acuse es el dueño de la cuenta Resend, el acuse llega; si no lo es, el envío principal sigue terminando en éxito.
- [ ] Con `RESEND_API_KEY` vacía no hay excepción no controlada: el terminal muestra el fallo, el formulario conserva lo escrito, y el texto visible no nombra ninguna variable de entorno.
- [ ] Mientras se envía, el botón está `disabled` y dice `ENVIANDO…`.
- [ ] El terminal de éxito es `role="status"`, recibe el foco y `ENVIAR OTRO MENSAJE` deja un formulario vacío.
- [ ] Con las flechas del teclado se cambia el tema; Tab entra al grupo de tema una sola vez.
- [ ] El contador no es un `role="status"` por debajo de 1800 caracteres y sí lo es desde 1800.
- [ ] `RESEND_API_KEY` no aparece en ningún archivo bajo `.next/static/`.
- [ ] `.env.local` no está en `git status`; `.env.example` sí.
- [ ] Con `prefers-reduced-motion: reduce` no hay reveal, ni parpadeo en el divisor, ni `shake`, ni cursor parpadeante en el terminal.
- [ ] Todos los botones y enlaces con aspecto de control miden al menos 44px de alto, incluidos los radios de tema.
- [ ] Recorrer `/acerca` solo con Tab alcanza los enlaces de la barra, los cuatro radios (como un grupo), los tres campos, el botón de envío y, si existe, el `mailto:`, con anillo de foco visible.
- [ ] Todo SVG decorativo de la página tiene `aria-hidden="true"`.
- [ ] A 375px `/acerca` no tiene scroll horizontal y la ficha queda bajo el copy.
- [ ] Con JavaScript desactivado se ven los cuatro bloques y el bloque `<noscript>`.
- [ ] `app/acerca/page.tsx` no contiene `'use client'`.
- [ ] Los únicos componentes cliente nuevos son `contact-form`, `contact-message-field` y `contact-terminal`.
- [ ] Ningún archivo bajo `app/`, `components/` ni `lib/` importa algo de `references/`.

## Decisiones

- **Sí:** `/acerca` con el contacto dentro. El usuario eligió una sola página: el formulario gana contexto de la historia que lo precede y dos pantallas cortas duplicarían navegación.
- **Sí:** acortar "Salón de la Fama" a "Salón" en la barra. El usuario eligió esta opción frente a subir el corte de 1200px, que está escrito en seis sitios de `site-nav.tsx` y calculado para tres enlaces.
- **No:** enlace a Contacto en el pie ni ruta `/contacto`. Una sola entrada, con `#contacto` como ancla.
- **Sí:** contenido "misión + pilares + estado honesto". Coincide con SPEC 02, que ya decidió no prometer lo que la app no cumple.
- **No:** línea de tiempo con fechas. Inventaría hitos que el repositorio no respalda.
- **No:** estado "en curso" en el panel de objetivos. Nada en el repositorio lo respalda; solo `HECHO` y `PENDIENTE`.
- **Sí:** formulario con tema, contador y acuse de recibo. El usuario marcó las cuatro opciones, que se contradecían; al pedírselo eligió "tema + contador + acuse" y se descartó "nada más".
- **Sí:** todo por variables de entorno y clave que pone el usuario. Se prepara `.env.example` y `.env.local` con la clave vacía.
- **Sí (propuesta por defecto):** Server Action con `useActionState`. El usuario no eligió mecanismo, solo dijo "solo necesito que enviemos correos"; se toma la opción recomendada por los docs de Next 16.3.5. Un Route Handler no traería la comprobación Origin/Host y dejaría un endpoint público.
- **Sí:** el aviso se espera y el acuse va en `after()`. El acuse fallará mientras no haya dominio verificado y no puede tumbar un envío que sí llegó.
- **Sí:** validación estricta en servidor y honeypot; **No:** rate limit, captcha, Zod. El usuario dijo *"es solo algo de prueba, tampoco es para tanto"*. La validación no es opcional (evita inyección de cabeceras); el honeypot cuesta diez líneas y es la única defensa anti-bot. Si se quiere aún más mínimo, se retira el honeypot sin tocar nada más.
- **Sí (propuesta por defecto):** `CONTACT_PUBLIC_EMAIL` como variable aparte y opcional. Mostrar el buzón del proyecto en el HTML lo expone a rastreadores; una variable distinta permite mostrar otro correo o ninguno.
- **Sí:** radios nativos y no botones `aria-pressed` para el tema. La elección es excluyente y así funcionan las flechas y el `FormData` sin código.
- **Sí:** sin `maxLength` en el mensaje. Truncar al pegar pierde texto en silencio; el contador y el error lo hacen visible.
- **Sí:** el terminal fuera del `<form>`, como componente propio. Evita el marco discontinuo cian superpuesto al verde del prototipo.
- **No:** el gabinete CRT en el hero. Es la firma del Home.
- **No:** número de versión en la ficha. Pie y `package.json` ya se contradicen.
- **Sí:** `defaultValue` desde `state.values` en cada campo. React 19 reinicia los campos no controlados tras una acción y sin esto un fallo de entrega borraría lo escrito.
- **Sí:** definición con dos rondas de preguntas. El usuario confirmó ruta, mecanismo (sin elección explícita), anti-spam, Resend, barra, contenido y campos. Los nombres de archivo, los límites de longitud, los textos y el nombre `sitio_web` del honeypot son propuestas por defecto para revisar al leer este borrador.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Con `onboarding@resend.dev` Resend solo entrega al correo dueño de la cuenta: el acuse a cualquier otro fallará y `CONTACT_TO_EMAIL` debe ser ese correo | El acuse va en `after()` con `console.error` y nunca bloquea; la solución real es verificar un dominio, fuera de este spec |
| Sin rate limit, alguien puede martillear la acción y agotar la cuota gratuita de Resend, y cada envío consume dos correos | Aceptado por el usuario para una prueba; el honeypot frena bots ingenuos. Si el sitio sale de la fase de prueba, va en su propio spec |
| `useActionState` exige que el formulario sea componente cliente; los docs de Next lo describen como *"queue submissions if JavaScript isn't loaded yet"*, que no es lo mismo que funcionar con JS desactivado | No se promete "funciona sin JS" en los criterios. El bloque `<noscript>` da una salida útil y su texto ("si el formulario no responde") es cierto en ambos casos |
| React 19 reinicia los campos tras la acción y un fallo borra lo escrito | `defaultValue` desde `state.values`; hay un criterio de aceptación |
| Un cuarto enlace no cabe a 1200px aunque "Salón" ahorre caracteres | El paso 6 lo mide. Si envuelve, se sube el corte y se cambian sus seis apariciones y el comentario que da la cifra de ~1195px |
| `role="alert"` más mover el foco puede anunciar dos veces el resumen de errores | Es el patrón que recomienda la guía de `ui-ux-pro-max` (`role="alert"` + `tabindex="-1"` + foco); se prueba con un lector de pantalla en el paso 11 |
| `CONTACT_PUBLIC_EMAIL` se lee en build porque `/acerca` es estática | Cambiarlo exige recompilar; se documenta en `.env.example` |
| Las opciones del SDK de `resend` (`replyTo`, forma de `{ data, error }`) pueden diferir de lo que se espera | El paso 3 las comprueba contra los tipos instalados antes de escribir el mailer |
| Al desplegar detrás de un proxy que reescribe el host, la comprobación Origin/Host de las Server Actions puede rechazar envíos | Revisar `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` al desplegar |
| `next dev` no recarga `.env.local` en caliente | El paso 10 indica reiniciar el servidor tras pegar la clave |
| El `after()` puede cortarse si la plataforma limita la duración de la ruta | El acuse es best-effort por diseño; el aviso, que es el que importa, se espera antes de responder |

## Lo que **no** está en este spec

- Rate limit, captcha, Zod.
- Dominio verificado y remitente propio en Resend.
- Bandeja de mensajes recibidos, adjuntos, persistencia de mensajes.
- Juegos jugables, cuenta real, ranking real.
- Enlace a Contacto en el pie de página.
- Tests automatizados.

Cada uno de ellos, si entra, va en su propio spec.
