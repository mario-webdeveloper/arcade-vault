import { SectionHead } from "@/components/section-head";
import { STATUS_ITEMS } from "@/lib/about";

// Only two states exist and they are real: nothing in the repo backs an "in progress" one.
const DONE = STATUS_ITEMS.filter((item) => item.done);
const PENDING = STATUS_ITEMS.filter((item) => !item.done);

/** One group of the objectives panel. The state is said in words (the `<h3>`), never by glyph or colour alone. */
function Group({
  label,
  glyph,
  labelTone,
  glyphTone,
  textTone,
  items,
}: {
  label: string;
  glyph: string;
  labelTone: string;
  glyphTone: string;
  textTone: string;
  items: typeof STATUS_ITEMS;
}) {
  return (
    <div className="px-5 py-6 min-[721px]:px-7">
      <h3
        className={`mb-3 font-pixel text-[11px] font-normal leading-[1.4] tracking-[0.16em] ${labelTone}`}
      >
        <span aria-hidden="true">{glyph} </span>
        {label}
      </h3>
      <ul>
        {items.map(({ text }) => (
          <li
            key={text}
            className={`flex gap-3 border-b border-dashed border-line-2 py-3 text-[14px] leading-[1.5] last:border-b-0 ${textTone}`}
          >
            <span aria-hidden="true" className={`shrink-0 ${glyphTone}`}>
              {glyph}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "En qué vamos": an honest objectives panel, HECHO on one side and PENDIENTE on the other. */
export function AboutStatus() {
  return (
    <section
      aria-labelledby="vamos-title"
      data-reveal
      className="mx-auto mt-16 max-w-[1320px] px-4 min-[721px]:mt-24 min-[721px]:px-8"
    >
      <SectionHead
        id="vamos-title"
        kicker="EN QUÉ VAMOS"
        title="EN QUÉ VAMOS"
        color="magenta"
      />
      <div className="border border-line bg-[image:linear-gradient(180deg,var(--bg-2),var(--bg-3))]">
        <div className="grid grid-cols-1 divide-y divide-line min-[721px]:grid-cols-[1.2fr_1fr] min-[721px]:divide-x min-[721px]:divide-y-0">
          <Group
            label="HECHO"
            glyph="✔"
            labelTone="neon-green"
            glyphTone="text-green"
            textTone="text-ink"
            items={DONE}
          />
          <Group
            label="PENDIENTE"
            glyph="○"
            labelTone="neon-yellow"
            glyphTone="text-yellow"
            textTone="text-ink-dim"
            items={PENDING}
          />
        </div>
        <p className="border-t border-dashed border-line px-5 py-4 font-mono text-[12px] tracking-[0.06em] text-ink-faint min-[721px]:px-7">
          Hoy las puntuaciones, la sesión y la actividad son de demostración.
        </p>
      </div>
    </section>
  );
}
