"use client";

import { Grid2X2, List, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { GameCard } from "@/components/game-card";
import { useStore } from "@/components/store-provider";
import { activityTypes, categories, subjects } from "@/lib/data";

export function ExploreLibrary() {
  const { games } = useStore();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [activity, setActivity] = useState("");
  const [grade, setGrade] = useState("");
  const [sort, setSort] = useState("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = games.filter((game) => {
      const searchable = [
        game.title,
        game.subject,
        game.descriptionShort,
        ...game.skills,
        ...game.categories,
        ...game.tags,
        ...game.activityTypes,
      ]
        .join(" ")
        .toLowerCase();
      if (needle && !searchable.includes(needle)) return false;
      if (subject && game.subject !== subject) return false;
      if (category && !game.categories.includes(category)) return false;
      if (activity && !game.activityTypes.includes(activity)) return false;
      if (grade) {
        const [minimum, maximum] =
          grade === "K–2"
            ? [0, 2]
            : grade === "3–5"
              ? [3, 5]
              : [6, 12];
        if (game.gradeMin > maximum || game.gradeMax < minimum) return false;
      }
      return game.status === "published";
    });

    return [...list].sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "saved") return b.saves - a.saves;
      return b.plays - a.plays;
    });
  }, [activity, category, games, grade, query, sort, subject]);

  const clear = () => {
    setQuery("");
    setSubject("");
    setCategory("");
    setActivity("");
    setGrade("");
  };

  return (
    <>
      <section className="library-hero">
        <div className="shell">
          <p className="eyebrow">Explore the library</p>
          <h1>Find the right game by skill, not by memory.</h1>
          <div className="library-search">
            <Search aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try “past tense”, “Grade 3”, “team game” or “weather”"
              aria-label="Search games"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>
      <div className="shell library-layout">
        <button
          className="button button--secondary filter-toggle"
          type="button"
          onClick={() => setFiltersOpen((value) => !value)}
        >
          <SlidersHorizontal size={17} />
          Filters
        </button>
        <aside className={`filter-panel ${filtersOpen ? "is-open" : ""}`}>
          <div className="filter-panel__head">
            <strong>Filter games</strong>
            <button type="button" onClick={clear}>
              Clear all
            </button>
          </div>
          <FilterSelect
            label="Subject"
            value={subject}
            onChange={setSubject}
            options={subjects}
          />
          <FilterSelect
            label="Grade band"
            value={grade}
            onChange={setGrade}
            options={["K–2", "3–5", "6+"]}
          />
          <FilterSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={categories}
          />
          <FilterSelect
            label="Activity type"
            value={activity}
            onChange={setActivity}
            options={activityTypes}
          />
          <div className="filter-note">
            <strong>Looking for originals?</strong>
            Select Wellesley Games from the publisher page.
          </div>
        </aside>
        <section className="library-results">
          <div className="results-toolbar">
            <strong>
              {filtered.length} game{filtered.length === 1 ? "" : "s"}
            </strong>
            <div>
              <label>
                Sort
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="popular">Most played</option>
                  <option value="saved">Most saved</option>
                  <option value="newest">Newest</option>
                </select>
              </label>
              <span className="view-toggle" aria-label="Grid view selected">
                <Grid2X2 size={16} />
                <List size={16} />
              </span>
            </div>
          </div>
          {filtered.length ? (
            <div className="game-grid game-grid--library">
              {filtered.map((game) => (
                <GameCard game={game} key={game.id} showPublisher />
              ))}
            </div>
          ) : (
            <div className="panel empty-state">
              <Search size={38} />
              <h3>No games match those filters</h3>
              <p>Try a broader skill, clear a filter or add the game you need.</p>
              <button className="button button--secondary" type="button" onClick={clear}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="filter-group">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">All {label.toLowerCase()}s</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
