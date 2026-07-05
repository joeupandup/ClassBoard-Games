"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { seedCollections, seedGames } from "@/lib/data";
import type { Collection, Game } from "@/lib/types";

interface StoreValue {
  games: Game[];
  collections: Collection[];
  saved: Set<string>;
  hydrated: boolean;
  saveGame: (id: string) => void;
  upsertGame: (game: Game) => void;
  addCollection: (title: string) => void;
  incrementPlay: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const storageKey = "classboard-games-v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [games, setGames] = useState(seedGames);
  const [collections, setCollections] = useState(seedCollections);
  const [saved, setSaved] = useState<Set<string>>(new Set(["shark"]));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          games?: Game[];
          collections?: Collection[];
          saved?: string[];
        };
        if (parsed.games?.length) setGames(parsed.games);
        if (parsed.collections?.length) setCollections(parsed.collections);
        if (parsed.saved) setSaved(new Set(parsed.saved));
      }
    } catch {
      // A blocked localStorage should not stop browsing.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ games, collections, saved: [...saved] }),
    );
  }, [collections, games, hydrated, saved]);

  const saveGame = useCallback((id: string) => {
    setSaved((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const upsertGame = useCallback((game: Game) => {
    setGames((current) => {
      const existing = current.findIndex((item) => item.id === game.id);
      if (existing === -1) return [game, ...current];
      const next = [...current];
      next[existing] = game;
      return next;
    });
  }, []);

  const addCollection = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setCollections((current) => [
      ...current,
      {
        id: `collection-${Date.now()}`,
        ownerId: "teacher-joseph",
        title: trimmed,
        description: "A new teaching collection.",
        gameIds: [],
        visibility: "private",
      },
    ]);
  }, []);

  const incrementPlay = useCallback((id: string) => {
    setGames((current) =>
      current.map((game) =>
        game.id === id ? { ...game, plays: game.plays + 1 } : game,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      games,
      collections,
      saved,
      hydrated,
      saveGame,
      upsertGame,
      addCollection,
      incrementPlay,
    }),
    [
      addCollection,
      collections,
      games,
      hydrated,
      incrementPlay,
      saveGame,
      saved,
      upsertGame,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}
