"use client";

import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  FileText,
  Link2,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useStore } from "@/components/store-provider";
import { subjects } from "@/lib/data";
import type { Game, Visibility } from "@/lib/types";
import { detectPlatform, slugify } from "@/lib/utils";
import { isSafePublicUrl } from "@/lib/validation";

const steps = [
  ["Opening the public game", Link2],
  ["Capturing representative screens", Camera],
  ["Reading classroom clues", ScanLine],
  ["Drafting teacher notes", FileText],
  ["Preparing your review", Sparkles],
] as const;

export function SubmitGameFlow() {
  const router = useRouter();
  const { upsertGame } = useStore();
  const [url, setUrl] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("school");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("3–5");
  const [language, setLanguage] = useState("English");
  const [notes, setNotes] = useState("");
  const [rights, setRights] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const platform = useMemo(() => detectPlatform(url), [url]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!isSafePublicUrl(url)) {
      setError("Enter a public HTTP or HTTPS game URL. Local addresses are blocked.");
      return;
    }
    if (!rights) {
      setError("Please confirm that you have the right to share this game.");
      return;
    }

    setProcessing(true);
    for (let index = 0; index < steps.length; index += 1) {
      setActiveStep(index);
      await new Promise((resolve) => window.setTimeout(resolve, 620));
    }

    const id = `local-${Date.now()}`;
    const title =
      notes.match(/(?:called|named|title[:\s]+)([^,.]+)/i)?.[1]?.trim() ||
      "New Classroom Challenge";
    const [gradeMin, gradeMax] =
      grade === "K–2" ? [0, 2] : grade === "6+" ? [6, 8] : [3, 5];
    const game: Game = {
      id,
      ownerId: "teacher-joseph",
      publisherId: "publisher-community",
      title,
      slug: `${slugify(title)}-${id.slice(-5)}`,
      sourceUrl: url,
      canonicalUrl: url,
      sourcePlatform: platform,
      status: "ready_for_review",
      visibility,
      descriptionShort:
        "A newly scanned classroom game. Review this draft description before publishing.",
      studentGoal:
        "Students practise the target lesson skill through a focused interactive challenge.",
      howToPlay: [
        "Open the game on the classroom screen.",
        "Read or listen to each prompt.",
        "Respond as a class, in teams or individually.",
      ],
      teacherNotes: [
        notes || `Check the ${language} instructions before the lesson.`,
      ],
      subject: subject || "English",
      gradeMin,
      gradeMax,
      categories: [subject || "Vocabulary"],
      skills: ["Target skill", "Quick recall"],
      tags: ["new scan", language.toLowerCase()],
      activityTypes: ["Multiple Choice"],
      screenshots: [],
      playMode: "new_tab",
      embedAllowed: false,
      accent: "blue",
      motif: "🎮",
      plays: 0,
      saves: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastScannedAt: new Date().toISOString(),
    };
    upsertGame(game);

    try {
      await fetch("/api/games/submit-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url,
          visibility,
          subject,
          gradeBand: grade,
          language,
          notes,
          rightsConfirmed: rights,
        }),
      });
    } catch {
      // Local persistence keeps the prototype usable without Cloudflare bindings.
    }
    router.push(`/review/${id}`);
  };

  if (processing) {
    const progress = ((activeStep + 1) / steps.length) * 100;
    return (
      <section className="scan-page">
        <div className="scan-page__orb">
          <Sparkles />
        </div>
        <p className="eyebrow">ClassBoard scanner</p>
        <h1>Preparing your game</h1>
        <p className="scan-page__url">{url}</p>
        <div className="scan-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="scan-step-list">
          {steps.map(([label, Icon], index) => (
            <div
              className={
                index < activeStep
                  ? "complete"
                  : index === activeStep
                    ? "active"
                    : ""
              }
              key={label}
            >
              <span>
                {index < activeStep ? <Check size={16} /> : <Icon size={17} />}
              </span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>
        <p className="scan-page__note">
          This local build demonstrates the production queue. On Cloudflare,
          Browser Run performs the real capture asynchronously.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="submit-intro">
        <div className="shell">
          <p className="eyebrow">Submit a public game</p>
          <h1>
            Paste a link.
            <br />
            We’ll prepare the listing.
          </h1>
          <p>
            No manual screenshots. No blank description box. You review every
            field before the game reaches a class or the public library.
          </p>
        </div>
      </section>
      <section className="shell submit-layout">
        <form className="panel submit-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="game-url">Public game URL</label>
            <div className="url-field">
              <Link2 size={18} />
              <input
                id="game-url"
                className="input"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://your-game.example/play"
                required
              />
            </div>
            <span className="field-hint">
              {url.length > 8
                ? `Detected source: ${platform}`
                : "The page must work without a login."}
            </span>
          </div>
          <div className="field">
            <span className="field-label">Who can see it?</span>
            <div className="segmented">
              {(["private", "school", "public"] as Visibility[]).map((value) => (
                <button
                  className={visibility === value ? "active" : ""}
                  type="button"
                  key={value}
                  onClick={() => setVisibility(value)}
                  aria-pressed={visibility === value}
                >
                  {value[0].toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="subject">Subject override</label>
              <select
                id="subject"
                className="select"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              >
                <option value="">Let the scanner decide</option>
                {subjects.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="grade">Likely grade band</label>
              <select
                id="grade"
                className="select"
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
              >
                <option>K–2</option>
                <option>3–5</option>
                <option>6+</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="language">Game language</label>
            <select
              id="language"
              className="select"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option>English</option>
              <option>Traditional Chinese</option>
              <option>Bilingual</option>
              <option>Other</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="notes">A useful clue for the scanner</label>
            <textarea
              id="notes"
              className="textarea"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="For example: This is called Farm Sounds and my K2 students play in three teams."
            />
          </div>
          <label className="rights-check">
            <input
              type="checkbox"
              checked={rights}
              onChange={(event) => setRights(event.target.checked)}
            />
            <span>
              I made this game or have permission to share it on ClassBoard
              Games.
            </span>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button--sun button--full" type="submit">
            <ScanLine size={18} /> Scan game
          </button>
        </form>
        <aside className="submit-aside">
          <div className="panel scanner-list">
            <p className="overline">What happens next</p>
            {steps.map(([label, Icon], index) => (
              <div key={label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon size={18} />
                <strong>{label}</strong>
              </div>
            ))}
          </div>
          <div className="notice notice--sun">
            <ShieldCheck size={20} />
            <p>
              <strong>You stay in control.</strong> The scanner creates a draft;
              only you can publish it.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
