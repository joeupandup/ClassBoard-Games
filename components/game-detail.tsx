"use client";

import Link from "next/link";
import {
  Bookmark,
  Check,
  ExternalLink,
  Flag,
  Play,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { GameArt } from "@/components/game-art";
import { GameCard } from "@/components/game-card";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/components/store-provider";
import type { Game } from "@/lib/types";
import { gradeBand, sourceLabel } from "@/lib/utils";

export function GameDetail({
  initialGame,
  slug,
}: {
  initialGame?: Game;
  slug: string;
}) {
  const { games, saved, saveGame, incrementPlay } = useStore();
  const game =
    games.find((item) =>
      initialGame ? item.id === initialGame.id : item.slug === slug,
    ) ?? initialGame;
  const [message, setMessage] = useState("");
  if (!game) {
    return (
      <section className="shell page-section">
        <div className="panel empty-state">
          <h1>Game not found</h1>
          <p>This game may still be a private draft or may have been removed.</p>
          <Link className="button button--secondary" href="/explore">
            Back to the library
          </Link>
        </div>
      </section>
    );
  }
  const isSaved = saved.has(game.id);
  const similar = games
    .filter(
      (item) =>
        item.id !== game.id &&
        (item.subject === game.subject ||
          item.categories.some((category) => game.categories.includes(category))),
    )
    .slice(0, 3);

  const play = () => {
    incrementPlay(game.id);
    window.open(game.sourceUrl, "_blank", "noopener,noreferrer");
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: game.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Link copied");
      }
    } catch {
      setMessage("Sharing cancelled");
    }
  };

  const report = async () => {
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          gameId: game.id,
          reason: "broken",
          details: "Reported from the game detail page.",
        }),
      });
      setMessage(
        response.ok
          ? "Report received for review"
          : "Report saved for the local preview",
      );
    } catch {
      setMessage("Report saved for the local preview");
    }
  };

  return (
    <>
      <div className="shell breadcrumbs">
        <Link href="/explore">Explore</Link> / {game.subject} / {game.title}
      </div>
      <section className="shell detail-layout">
        <div>
          <GameArt game={game} />
          <div className="detail-thumbs">
            {[0, 1, 2].map((item) => (
              <div className={item === 0 ? "active" : ""} key={item}>
                <GameArt game={game} compact />
              </div>
            ))}
          </div>
          <div className="notice detail-safety">
            <ShieldCheck size={20} />
            <p>
              This game opens on <strong>{sourceLabel(game.sourcePlatform)}</strong>{" "}
              in a separate tab. ClassBoard Games never forces embedding when a
              source blocks it.
            </p>
          </div>
        </div>
        <div className="detail-content">
          <div className="detail-publisher">
            <Link href="/publishers/wellesley-games">
              {game.publisherId === "publisher-wellesley"
                ? "Wellesley Games"
                : "Teacher Community"}
            </Link>
            {game.publisherId === "publisher-wellesley" && <Check size={14} />}
          </div>
          <h1>{game.title}</h1>
          <p className="detail-lead">{game.descriptionShort}</p>
          <div className="detail-meta">
            <span>{gradeBand(game)}</span>
            <span>{game.subject}</span>
            <StatusBadge value={game.visibility} />
          </div>
          <button className="button button--sun button--full detail-play" type="button" onClick={play}>
            <Play size={19} fill="currentColor" />
            Play game
            <ExternalLink size={16} />
          </button>
          <div className="detail-actions">
            <button type="button" onClick={() => saveGame(game.id)}>
              <Bookmark size={17} fill={isSaved ? "currentColor" : "none"} />
              {isSaved ? "Saved" : "Save to collection"}
            </button>
            <button type="button" onClick={share}>
              <Share2 size={17} />
              {message || "Share"}
            </button>
          </div>
          <section className="detail-section">
            <h2>Student goal</h2>
            <p>{game.studentGoal}</p>
          </section>
          <section className="detail-section">
            <h2>How to play</h2>
            <ol>
              {game.howToPlay.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
          <section className="detail-section">
            <h2>Skills practised</h2>
            <div className="tag-row">
              {game.skills.map((skill) => (
                <span className="tag" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
          <section className="detail-section">
            <h2>Teacher notes</h2>
            <ul>
              {game.teacherNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
          <div className="technical-card">
            <span>
              <small>Source</small>
              <strong>{sourceLabel(game.sourcePlatform)}</strong>
            </span>
            <span>
              <small>Play mode</small>
              <strong>{game.playMode === "hosted" ? "Hosted" : "New tab"}</strong>
            </span>
            <span>
              <small>Last checked</small>
              <strong>Today</strong>
            </span>
          </div>
          <button
            className="report-link"
            type="button"
            onClick={report}
          >
            <Flag size={14} /> Report an issue
          </button>
        </div>
      </section>
      {similar.length > 0 && (
        <section className="page-section page-section--white">
          <div className="shell">
            <h2 className="detail-similar-title">Similar games</h2>
            <div className="game-grid">
              {similar.map((item) => (
                <GameCard game={item} key={item.id} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
