import type { Metadata } from "next";
import Link from "next/link";
import { Check, Gamepad2, Plus } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { seedGames } from "@/lib/data";

export const metadata: Metadata = {
  title: "Wellesley Games",
  description: "Original classroom games from Wellesley Games.",
};

export default function WellesleyPublisherPage() {
  const games = seedGames.filter(
    (game) => game.publisherId === "publisher-wellesley",
  );

  return (
    <>
      <section className="publisher-hero">
        <div className="shell publisher-hero__inner">
          <div className="publisher-hero__mark">WG</div>
          <div>
            <p className="eyebrow">Verified publisher</p>
            <h1>Wellesley Games</h1>
            <p>
              Original, classroom-tested games built for projectors,
              touchscreens and teachers who want the room involved.
            </p>
            <div className="publisher-facts">
              <span>
                <Check size={15} /> Verified creator
              </span>
              <span>
                <Gamepad2 size={15} /> {games.length} published games
              </span>
            </div>
          </div>
          <Link className="button button--sun" href="/publish">
            <Plus size={16} /> Import Wellesley game
          </Link>
        </div>
      </section>
      <section className="page-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The collection</p>
              <h2>Made to earn its place in a lesson</h2>
              <p className="section-heading__copy">
                Every game keeps its teaching metadata separate from its
                publisher identity, so it remains easy to find by skill and
                subject.
              </p>
            </div>
          </div>
          <div className="game-grid game-grid--library">
            {games.map((game) => (
              <GameCard game={game} key={game.id} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
