import type { Game } from "@/lib/types";

export function GameArt({
  game,
  compact = false,
}: {
  game: Game;
  compact?: boolean;
}) {
  return (
    <div
      className={`game-art game-art--${game.accent} ${
        compact ? "game-art--compact" : ""
      }`}
      role="img"
      aria-label={`${game.title} preview`}
    >
      <span className="game-art__grid" aria-hidden="true" />
      <span className="game-art__motif" aria-hidden="true">
        {game.motif}
      </span>
      <span className="game-art__label">{game.title}</span>
      <span className="game-art__corner" aria-hidden="true">
        CB
      </span>
    </div>
  );
}
