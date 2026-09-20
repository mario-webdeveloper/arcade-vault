import type { ReactNode } from "react";

export type PixelIconKind = "gamepad" | "gratis" | "trofeo" | "cohete";

// Static shapes hoisted out of the component so React reuses the same elements.
const SHAPES: Record<PixelIconKind, ReactNode> = {
  gamepad: (
    <>
      <rect x="2" y="6" width="12" height="6" />
      <rect x="0" y="8" width="2" height="4" />
      <rect x="14" y="8" width="2" height="4" />
      {/* d-pad and buttons are cut-outs: same colour as the body they'd vanish */}
      <rect x="5" y="7.5" width="1" height="3" className="fill-bg" />
      <rect x="4" y="8.5" width="3" height="1" className="fill-bg" />
      <rect x="10.5" y="7.5" width="1.5" height="1.5" className="fill-bg" />
      <rect x="10.5" y="9.5" width="1.5" height="1.5" className="fill-bg" />
    </>
  ),
  gratis: (
    <>
      <rect
        x="3"
        y="3"
        width="10"
        height="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="5" y="6" width="1.5" height="4" />
      <rect x="5" y="6" width="4" height="1.5" />
      <rect x="5" y="8" width="3" height="1" />
      <rect x="10" y="6" width="1.5" height="4" />
    </>
  ),
  trofeo: (
    <>
      <rect x="3" y="2" width="10" height="2" />
      <rect x="3" y="2" width="2" height="6" />
      <rect x="11" y="2" width="2" height="6" />
      <rect x="5" y="8" width="6" height="2" />
      <rect x="7" y="10" width="2" height="3" />
      <rect x="5" y="13" width="6" height="1.5" />
      <rect x="1" y="3" width="2" height="3" />
      <rect x="13" y="3" width="2" height="3" />
    </>
  ),
  cohete: (
    <>
      <rect x="7" y="1" width="2" height="2" />
      <rect x="6" y="3" width="4" height="2" />
      <rect x="5" y="5" width="6" height="6" />
      <rect x="4" y="11" width="2" height="2" />
      <rect x="10" y="11" width="2" height="2" />
      <rect x="7" y="6" width="2" height="2" className="fill-bg" />
      <rect x="6" y="13" width="1" height="2" />
      <rect x="9" y="13" width="1" height="2" />
    </>
  ),
};

/** Decorative pixel icon: takes the colour of its parent (`currentColor`) and glows with it. */
export function PixelIcon({ kind }: { kind: PixelIconKind }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="size-11 drop-shadow-[0_0_8px_currentColor]"
    >
      {SHAPES[kind]}
    </svg>
  );
}
