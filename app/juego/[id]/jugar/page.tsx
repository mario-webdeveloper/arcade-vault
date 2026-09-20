import { notFound } from "next/navigation";
import { GamePlayer } from "@/components/game-player";
import { GAMES, getGame } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map(({ id }) => ({ id }));
}

export default async function PlayPage(props: PageProps<"/juego/[id]/jugar">) {
  const { id } = await props.params;
  const game = getGame(id);
  if (!game) notFound();

  return <GamePlayer id={game.id} title={game.title} />;
}
