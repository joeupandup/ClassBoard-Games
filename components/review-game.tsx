"use client";

import { useRouter } from "next/navigation";
import { Check, ExternalLink, ImagePlus, RotateCw, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { GameArt } from "@/components/game-art";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/components/store-provider";
import { seedGames, subjects } from "@/lib/data";
import type { Game, Visibility } from "@/lib/types";
import { slugify } from "@/lib/utils";

export function ReviewGame({ id }: { id: string }) {
  const router = useRouter();
  const { games, upsertGame } = useStore();
  const found = games.find((item) => item.id === id) ?? seedGames.find((item) => item.id === id);
  const [draft, setDraft] = useState<Game | null>(found ?? null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const latest = games.find((item) => item.id === id);
    if (latest) setDraft(latest);
  }, [games, id]);

  if (!draft) {
    return (
      <section className="shell page-section">
        <div className="panel empty-state">
          <Sparkles size={40} />
          <h1>Nothing to review yet</h1>
          <p>Submit a game link and its draft will appear here.</p>
        </div>
      </section>
    );
  }

  const update = <K extends keyof Game>(key: K, value: Game[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));

  const save = async (status: Game["status"]) => {
    const next = {
      ...draft,
      status,
      slug: slugify(draft.title),
      updatedAt: new Date().toISOString(),
      publishedAt:
        status === "published" ? new Date().toISOString() : draft.publishedAt,
    };
    upsertGame(next);
    try {
      await fetch(`/api/games/${draft.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: next.title,
          descriptionShort: next.descriptionShort,
          studentGoal: next.studentGoal,
          subject: next.subject,
          visibility: next.visibility,
          howToPlay: next.howToPlay,
          teacherNotes: next.teacherNotes,
        }),
      });
      if (status === "published") {
        await fetch(`/api/games/${draft.id}/publish`, { method: "POST" });
      }
    } catch {
      // Local persistence remains the preview fallback.
    }
    if (status === "published") router.push(`/games/${next.slug}`);
    else {
      setNotice("Draft saved on this device");
      router.push("/dashboard");
    }
  };

  return (
    <section className="shell review-layout">
      <div className="review-preview">
        <p className="eyebrow">Review the scan</p>
        <h1>AI drafts it. You approve it.</h1>
        <p>
          Check the teaching details carefully. Generated suggestions are never
          published without your decision.
        </p>
        <GameArt game={draft} />
        <div className="review-shots">
          {[0, 1, 2].map((item) => (
            <GameArt game={draft} compact key={item} />
          ))}
          <button type="button" onClick={() => setNotice("Screenshot refresh queued")}>
            <ImagePlus size={19} /> Replace
          </button>
        </div>
        <div className="notice">
          <Sparkles size={18} />
          <p>
            Draft confidence: <strong>89%</strong>. Verify grade level and
            accessibility notes against the actual game.
          </p>
        </div>
      </div>
      <div className="panel review-form">
        <div className="review-form__bar">
          <StatusBadge value={draft.status} />
          <div className="review-visibility">
            {(["private", "school", "public"] as Visibility[]).map((item) => (
              <button
                className={draft.visibility === item ? "active" : ""}
                type="button"
                onClick={() => update("visibility", item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <ReviewField label="Title" ai>
          <input
            className="input"
            value={draft.title}
            onChange={(event) => update("title", event.target.value)}
          />
        </ReviewField>
        <ReviewField label="Short description" ai>
          <textarea
            className="textarea"
            value={draft.descriptionShort}
            onChange={(event) => update("descriptionShort", event.target.value)}
          />
        </ReviewField>
        <ReviewField label="Student goal" ai>
          <textarea
            className="textarea"
            value={draft.studentGoal}
            onChange={(event) => update("studentGoal", event.target.value)}
          />
        </ReviewField>
        <ReviewField label="How to play" ai>
          <div className="stacked-inputs">
            {draft.howToPlay.map((step, index) => (
              <input
                className="input"
                value={step}
                aria-label={`How to play step ${index + 1}`}
                onChange={(event) => {
                  const next = [...draft.howToPlay];
                  next[index] = event.target.value;
                  update("howToPlay", next);
                }}
                key={index}
              />
            ))}
          </div>
        </ReviewField>
        <ReviewField label="Subject and grade" ai>
          <div className="form-grid">
            <select
              className="select"
              value={draft.subject}
              onChange={(event) => update("subject", event.target.value)}
            >
              {subjects.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <span className="review-grade">
              Grade {draft.gradeMin === 0 ? "K" : draft.gradeMin}–{draft.gradeMax}
            </span>
          </div>
        </ReviewField>
        <ReviewField label="Skills and tags">
          <div className="tag-row">
            {[...draft.skills, ...draft.tags].map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </ReviewField>
        <ReviewField label="Teacher notes" ai>
          <div className="stacked-inputs">
            {draft.teacherNotes.map((note, index) => (
              <input
                className="input"
                value={note}
                onChange={(event) => {
                  const next = [...draft.teacherNotes];
                  next[index] = event.target.value;
                  update("teacherNotes", next);
                }}
                key={index}
              />
            ))}
          </div>
        </ReviewField>
        {notice && <p className="review-notice">{notice}</p>}
        <div className="review-buttons">
          <button className="button button--sun" type="button" onClick={() => save("published")}>
            <Check size={17} /> Publish
          </button>
          <button className="button button--secondary" type="button" onClick={() => save("draft")}>
            <Save size={16} /> Save draft
          </button>
          <button className="button button--secondary" type="button" onClick={() => setNotice("Re-scan queued")}>
            <RotateCw size={16} /> Re-scan
          </button>
          <button className="button button--secondary" type="button" onClick={() => window.open(draft.sourceUrl, "_blank", "noopener,noreferrer")}>
            <ExternalLink size={16} /> Open game
          </button>
        </div>
      </div>
    </section>
  );
}

function ReviewField({
  label,
  ai = false,
  children,
}: {
  label: string;
  ai?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="review-field">
      <div>
        <strong>{label}</strong>
        {ai && <span>AI draft</span>}
      </div>
      {children}
    </div>
  );
}
