/** Decorative CSS-art cover; the parent must be `relative` with its own size. */
export function GameCover({ cover }: { cover: string }) {
  return <div aria-hidden="true" className={`cover-bg ${cover}`} />;
}
