// Same decorative arena as the player (CSS lives in globals.css), so the hero
// shows a screen that is already switched on instead of promising one.
const ARENA = (
  <div className="game-arena">
    <div className="grid-floor" />
    <div className="enemy e1" />
    <div className="enemy e2" />
    <div className="enemy e3" />
    <div className="player-ship" />
  </div>
);

/** Decorative CRT cabinet for the hero: marquee, live arena and status LED. */
export function HomeCabinet() {
  return (
    <div aria-hidden="true" className="crt p-4 min-[721px]:p-6">
      <div className="mb-3 flex items-center justify-between gap-3 border border-magenta/45 bg-magenta/8 px-3 py-2 font-pixel text-[8px] tracking-[0.2em] min-[721px]:text-[9px]">
        <span className="text-magenta [text-shadow:0_0_8px_rgba(255,0,110,0.7)]">
          ARCADE VAULT
        </span>
        <span className="text-yellow">1 FICHA</span>
      </div>
      <div className="crt-screen">{ARENA}</div>
      <div className="crt-bottom">
        <span className="flex items-center gap-1.5">
          <span className="led-pulse size-2 rounded-full bg-green shadow-[0_0_6px_var(--green)]" />
          SEÑAL OK
        </span>
        <span>CRT-83 · 60 HZ</span>
      </div>
    </div>
  );
}
