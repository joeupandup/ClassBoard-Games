"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Clock3,
  FolderPlus,
  Gamepad2,
  Plus,
  Radio,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { GameArt } from "@/components/game-art";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/components/store-provider";
import type { Game } from "@/lib/types";
import { formatNumber, gradeBand } from "@/lib/utils";

type Tab = "all" | "review" | "published" | "private";

export function Dashboard() {
  const { games, collections, addCollection } = useStore();
  const [tab, setTab] = useState<Tab>("all");
  const [newCollection, setNewCollection] = useState("");
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const mine = games.filter((game) => game.ownerId === "teacher-joseph");
  const visible = useMemo(
    () =>
      mine.filter((game) => {
        if (tab === "review")
          return game.status === "ready_for_review" || game.status === "draft";
        if (tab === "published") return game.status === "published";
        if (tab === "private") return game.visibility === "private";
        return true;
      }),
    [mine, tab],
  );

  const createCollection = async (event: FormEvent) => {
    event.preventDefault();
    addCollection(newCollection);
    try {
      await fetch("/api/collections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: newCollection,
          description: "A new teaching collection.",
          visibility: "private",
        }),
      });
    } catch {
      // The local collection is already persisted for preview use.
    }
    setNewCollection("");
    setShowCollectionForm(false);
  };

  return (
    <div className="shell dashboard">
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Teacher dashboard</p>
          <h1>Good morning, Joseph.</h1>
          <p>Your games are organised and ready for the board.</p>
        </div>
        <Link className="button button--sun" href="/submit">
          <Plus size={17} /> Add a game
        </Link>
      </div>
      <div className="metric-grid">
        <Metric icon={Gamepad2} label="Total games" value={String(mine.length)} />
        <Metric
          icon={Radio}
          label="Published"
          value={String(mine.filter((game) => game.status === "published").length)}
        />
        <Metric
          icon={Clock3}
          label="Needs review"
          value={String(
            mine.filter((game) => game.status === "ready_for_review").length,
          )}
        />
        <Metric
          icon={BarChart3}
          label="Total plays"
          value={formatNumber(mine.reduce((total, game) => total + game.plays, 0))}
        />
      </div>
      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <h2>My games</h2>
          <div className="dashboard-tabs" role="tablist">
            {(["all", "review", "published", "private"] as Tab[]).map((item) => (
              <button
                className={tab === item ? "active" : ""}
                role="tab"
                aria-selected={tab === item}
                onClick={() => setTab(item)}
                key={item}
              >
                {item === "all"
                  ? "All games"
                  : item === "review"
                    ? "Needs review"
                    : item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="game-table panel">
          {visible.map((game) => (
            <DashboardGame game={game} key={game.id} />
          ))}
        </div>
      </section>
      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <div>
            <h2>Collections</h2>
            <p>Prepare a shelf for a class, unit or emergency lesson.</p>
          </div>
          <button
            className="button button--secondary button--small"
            type="button"
            onClick={() => setShowCollectionForm((value) => !value)}
          >
            <FolderPlus size={16} /> New collection
          </button>
        </div>
        {showCollectionForm && (
          <form className="collection-form" onSubmit={createCollection}>
            <input
              className="input"
              value={newCollection}
              onChange={(event) => setNewCollection(event.target.value)}
              placeholder="Collection name"
              autoFocus
              required
            />
            <button className="button button--dark" type="submit">
              Create
            </button>
          </form>
        )}
        <div className="collection-grid">
          {collections.map((collection) => (
            <article className="collection-card panel" key={collection.id}>
              <div className="collection-card__covers">
                {collection.gameIds.slice(0, 3).map((id) => {
                  const game = games.find((item) => item.id === id);
                  return game ? (
                    <span className={`cover-${game.accent}`} key={id}>
                      {game.motif}
                    </span>
                  ) : null;
                })}
              </div>
              <BookOpen size={19} />
              <h3>{collection.title}</h3>
              <p>{collection.description}</p>
              <span>
                {collection.gameIds.length} games · {collection.visibility}
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="analytics-preview">
        <div>
          <p className="eyebrow">Analytics preview</p>
          <h2>Shark Alarm is earning its keep.</h2>
          <p>
            512 lifetime plays. Friday Warm-ups is your most opened collection
            this month.
          </p>
        </div>
        <div className="analytics-bars" aria-label="Illustrative play chart">
          {[38, 52, 47, 70, 58, 92, 76, 100, 82, 96].map((height, index) => (
            <span style={{ height: `${height}%` }} key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gamepad2;
  label: string;
  value: string;
}) {
  return (
    <div className="metric-card panel">
      <Icon size={20} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function DashboardGame({ game }: { game: Game }) {
  return (
    <div className="game-row">
      <div className="game-row__art">
        <GameArt game={game} compact />
      </div>
      <div>
        <Link href={`/games/${game.slug}`}>{game.title}</Link>
        <span>
          {gradeBand(game)} · {game.subject} · {game.plays} plays
        </span>
      </div>
      <StatusBadge value={game.status} />
      {game.status === "ready_for_review" ? (
        <Link className="button button--small" href={`/review/${game.id}`}>
          Review
        </Link>
      ) : (
        <Link className="button button--secondary button--small" href={`/games/${game.slug}`}>
          View
        </Link>
      )}
    </div>
  );
}
