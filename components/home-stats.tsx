import { CATS } from "@/lib/games";
import { FEATURED, VAULT_STATS } from "@/lib/home";

// Built at module scope from the catalog: nothing here is typed by hand, so a ninth
// game changes the strip on its own. FEATURED is sorted by `best`, so [0] owns the top mark.
const STATS = [
  {
    label: "JUEGOS",
    value: String(VAULT_STATS.games).padStart(2, "0"),
    detail: "EN EL VAULT",
    tone: "neon-cyan",
  },
  {
    label: "CATEGORÍAS",
    value: String(VAULT_STATS.cats).padStart(2, "0"),
    detail: CATS.filter((cat) => cat !== "TODOS").join(", "),
    tone: "neon-magenta",
  },
  {
    label: "MEJOR MARCA",
    value: VAULT_STATS.bestScore.toLocaleString("es-ES"),
    detail: FEATURED[0].title,
    tone: "neon-yellow",
  },
];

/** Three catalog figures right under the hero: the evidence for what the hero claims. */
export function HomeStats() {
  return (
    <section
      aria-label="El Vault en cifras"
      className="border-y border-line bg-bg-2/70"
    >
      <dl className="mx-auto grid max-w-[1320px] grid-cols-1 divide-y divide-line-2 px-4 min-[721px]:grid-cols-3 min-[721px]:divide-x min-[721px]:divide-y-0 min-[721px]:divide-line min-[721px]:px-8">
        {STATS.map(({ label, value, detail, tone }) => (
          <div
            key={label}
            className="flex flex-col gap-2 py-5 min-[721px]:px-8 min-[721px]:py-7 min-[721px]:first:pl-0 min-[721px]:last:pr-0"
          >
            <dt className="font-pixel text-[10px] uppercase leading-[1.25] tracking-[0.16em] text-ink">
              {label}
            </dt>
            <dd
              className={`order-first font-pixel text-[length:clamp(26px,8vw,36px)] leading-none tracking-[0.04em] min-[721px]:text-[length:clamp(22px,3.2vw,44px)] ${tone}`}
            >
              {value}
            </dd>
            <dd className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-faint">
              {detail}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
