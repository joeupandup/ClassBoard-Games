import type { Metadata } from "next";
import { GameDetail } from "@/components/game-detail";
import { seedGames } from "@/lib/data";

export function generateStaticParams() {
  return seedGames.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = seedGames.find((item) => item.slug === slug);
  return game
    ? { title: game.title, description: game.descriptionShort }
    : { title: "Game not found" };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = seedGames.find((item) => item.slug === slug);
  return <GameDetail initialGame={game} slug={slug} />;
}
