// Same rule as the prototype's `.div-pixels`: every 3rd pixel magenta, every 5th yellow
// (5th wins), the rest cyan. Full class strings so Tailwind can see them.
const PIXEL_TONE = {
  cyan: "bg-cyan shadow-[0_0_6px_var(--cyan)]",
  magenta: "bg-magenta shadow-[0_0_6px_var(--magenta)]",
  yellow: "bg-yellow shadow-[0_0_6px_var(--yellow)]",
} as const;

const PIXELS = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  const tone = n % 5 === 0 ? "yellow" : n % 3 === 0 ? "magenta" : "cyan";
  return { n, tone: PIXEL_TONE[tone] };
});

const BAR =
  "h-px min-w-0 flex-1 bg-[image:linear-gradient(90deg,transparent,var(--magenta),transparent)]";

/** Decorative rule between the status panel and the contact block. Blinks only with `motion-safe`. */
export function AboutDivider() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto mt-16 flex max-w-[1320px] items-center gap-4 px-4 min-[721px]:mt-24 min-[721px]:px-8"
    >
      <div className={BAR} />
      <div className="flex shrink-0 gap-1">
        {PIXELS.map(({ n, tone }) => (
          <span
            key={n}
            style={{ animationDelay: `${n * 90}ms` }}
            className={`size-1.5 motion-safe:animate-[pxblink_2.4s_steps(2)_infinite] ${tone}`}
          />
        ))}
      </div>
      <div className={BAR} />
    </div>
  );
}
