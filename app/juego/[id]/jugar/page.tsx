import { notFound } from "next/navigation";
import { AsteroidsPlayer } from "@/components/asteroids-player";
import { GamePlayer } from "@/components/game-player";
import { GAMES, getGame } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map(({ id }) => ({ id }));
}

export default async function PlayPage(props: PageProps<"/juego/[id]/jugar">) {
  const { id } = await props.params;
  const game = getGame(id);
  if (!game) notFound();

  // Only asteroides has a real engine; the rest keep the simulated player.
  if (game.id === "asteroides") return <AsteroidsPlayer title={game.title} />;

  return <GamePlayer id={game.id} title={game.title} />;
}
