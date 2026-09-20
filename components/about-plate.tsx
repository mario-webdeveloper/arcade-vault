import { VAULT_STATS } from "@/lib/home";

type Row = { label: string; value: string; tone: string; big?: boolean; led?: boolean };

// Figures come from the catalog, never typed by hand. No version number on purpose:
// the footer and package.json already disagree, a third screen would add a third truth.
const ROWS: Row[] = [
  {
    label: "JUEGOS",
    value: String(VAULT_STATS.games).padStart(2, "0"),
    tone: "neon-cyan",
    big: true,
  },
  {
    label: "CATEGORÍAS",
    value: String(VAULT_STATS.cats).padStart(2, "0"),
    tone: "neon-magenta",
    big: true,
  },
  {
    label: "MEJOR MARCA",
    value: VAULT_STATS.bestScore.toLocaleString("es-ES"),
    tone: "neon-yellow",
    big: true,
  },
  { label: "ESTADO", value: "EN CONSTRUCCIÓN", tone: "neon-green", led: true },
  { label: "COSTO", value: "$0", tone: "neon-cyan" },
];

// Four "screws" at the corners, like the data plate on the side of an arcade cabinet.
const SCREWS = [
  "top-1.5 left-1.5",
  "top-1.5 right-1.5",
  "bottom-1.5 left-1.5",
  "bottom-1.5 right-1.5",
];

/** Project data plate: a `<dl>` of fine-ruled rows fed by `VAULT_STATS`. */
export function AboutPlate() {
  return (
    <section
      aria-label="Ficha del proyecto"
      className="relative w-full border border-dashed border-cyan/40 bg-[image:linear-gradient(180deg,var(--bg-2),var(--bg-3))] px-5 pt-5 pb-2 min-[721px]:px-7"
    >
      {SCREWS.map((pos) => (
        <span
          key={pos}
          aria-hidden="true"
          className={`absolute size-1.5 bg-ink-faint/60 ${pos}`}
        />
      ))}
      <p
        aria-hidden="true"
        className="mb-1 border-b border-line pb-3 font-pixel text-[10px] uppercase leading-[1.25] tracking-[0.22em] text-ink-faint"
      >
        Ficha del proyecto
      </p>
      <dl>
        {ROWS.map(({ label, value, tone, big, led }) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 border-b border-line-2 py-4 last:border-b-0"
          >
            <dt className="font-pixel text-[10px] uppercase leading-[1.25] tracking-[0.16em] text-ink">
              {label}
            </dt>
            <dd
              className={`flex min-w-0 items-center gap-2.5 text-right font-pixel leading-[1.25] tracking-[0.04em] ${tone} ${
                big ? "text-[length:clamp(18px,5vw,24px)]" : "text-[12px]"
              }`}
            >
              {led ? (
                <span
                  aria-hidden="true"
                  className="led-pulse size-2 shrink-0 bg-green shadow-[0_0_8px_var(--green)]"
                />
              ) : null}
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
