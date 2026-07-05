"use client";

import Link from "next/link";
import { Bookmark, ExternalLink, Play } from "lucide-react";
import { GameArt } from "@/components/game-art";
import { useStore } from "@/components/store-provider";
import type { Game } from "@/lib/types";
import { formatNumber, gradeBand } from "@/lib/utils";

export function GameCard({
  game,
  showPublisher = false,
}: {
  game: Game;
  showPublisher?: boolean;
}) {
  const { saved, saveGame, incrementPlay } = useStore();
  const isSaved = saved.has(game.id);

  const play = () => {
    incrementPlay(game.id);
    window.open(game.sourceUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="game-card">
      <Link href={`/games/${game.slug}`} className="game-card__visual">
        <GameArt game={game} />
        <span className="grade-stamp">{gradeBand(game)}</span>
      </Link>
      <div className="game-card__body">
        {showPublisher && (
          <span className="overline">
            {game.publisherId === "publisher-wellesley"
              ? "Wellesley Games"
              : "Teacher Community"}
          </span>
        )}
        <Link href={`/games/${game.slug}`} className="game-card__title">
          {game.title}
        </Link>
        <p>{game.descriptionShort}</p>
        <div className="tag-row">
          <span className="tag">{game.subject}</span>
          {game.skills.slice(0, 2).map((skill) => (
            <span className="tag tag--quiet" key={skill}>
              {skill}
            </span>
          ))}
        </div>
        <div className="game-card__footer">
          <button className="play-link" type="button" onClick={play}>
            <Play size={15} fill="currentColor" aria-hidden="true" />
            Play
            <ExternalLink size={13} aria-hidden="true" />
          </button>
          <span className="game-card__metric">{formatNumber(game.plays)} plays</span>
          <button
            className={`icon-button ${isSaved ? "is-saved" : ""}`}
            type="button"
            onClick={() => saveGame(game.id)}
            aria-label={isSaved ? `Unsave ${game.title}` : `Save ${game.title}`}
            aria-pressed={isSaved}
          >
            <Bookmark size={17} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </article>
  );
}
