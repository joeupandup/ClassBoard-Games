"use client";

import {
  Check,
  FileCode2,
  LockKeyhole,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useStore } from "@/components/store-provider";
import type { Game, Visibility } from "@/lib/types";
import { slugify } from "@/lib/utils";

export function HtmlGamePublisher() {
  const { upsertGame } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("English");
  const [visibility, setVisibility] = useState<Visibility>("school");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setStatus("Choose a self-contained .html file first.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".html")) {
      setStatus("Only .html files are accepted by this importer.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus("That file is over the current 10 MB upload limit.");
      return;
    }
    setBusy(true);
    setStatus("Checking the HTML package…");
    const html = await file.text();
    if (!/<html[\s>]/i.test(html) && !/<!doctype html>/i.test(html)) {
      setStatus("This does not appear to be a complete HTML document.");
      setBusy(false);
      return;
    }

    const slug = slugify(title);
    const id = `hosted-${Date.now()}`;
    const form = new FormData();
    form.set("file", file);
    form.set("title", title);
    form.set("slug", slug);
    form.set("subject", subject);
    form.set("visibility", visibility);
    form.set("publisherId", "publisher-wellesley");

    try {
      const response = await fetch("/api/hosting/html", {
        method: "POST",
        body: form,
      });
      if (!response.ok) throw new Error("Cloudflare bindings are not active locally.");
      const result = (await response.json()) as { game?: Game };
      if (result.game) upsertGame(result.game);
      setStatus("Uploaded to the Wellesley Games review queue.");
    } catch {
      const localGame: Game = {
        id,
        ownerId: "teacher-joseph",
        publisherId: "publisher-wellesley",
        title,
        slug,
        sourceUrl: `https://play.classboardgames.com/wellesley/${slug}/`,
        canonicalUrl: `https://play.classboardgames.com/wellesley/${slug}/`,
        sourcePlatform: "hosted",
        status: "ready_for_review",
        visibility,
        descriptionShort:
          "A self-contained Wellesley classroom game awaiting metadata review.",
        studentGoal: "Review and describe the target student outcome.",
        howToPlay: ["Open the game.", "Follow the on-screen prompts.", "Review learning together."],
        teacherNotes: ["Uploaded through the secure HTML game importer."],
        subject,
        gradeMin: 1,
        gradeMax: 5,
        categories: [subject],
        skills: ["Needs review"],
        tags: ["Wellesley Games", "self-contained HTML"],
        activityTypes: ["Interactive Game"],
        screenshots: [],
        playMode: "hosted",
        embedAllowed: true,
        accent: "blue",
        motif: "🎮",
        plays: 0,
        saves: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      upsertGame(localGame);
      setStatus(
        "Validated and saved locally. Connect R2 to upload it to the game domain.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="hosting-upload-hero">
        <div className="shell">
          <p className="eyebrow">Wellesley Games importer</p>
          <h1>Give a finished HTML game a permanent classroom address.</h1>
          <p>
            This importer is intentionally strict: one complete HTML file, no
            server dependency, no mystery build process.
          </p>
        </div>
      </section>
      <section className="shell upload-layout">
        <form className="panel upload-form" onSubmit={publish}>
          <label className={`drop-zone ${file ? "has-file" : ""}`}>
            <input
              type="file"
              accept=".html,text/html"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file ? <FileCode2 size={38} /> : <UploadCloud size={38} />}
            <strong>{file ? file.name : "Drop a self-contained HTML file here"}</strong>
            <span>
              {file
                ? `${(file.size / 1024).toFixed(1)} KB · ready for validation`
                : "or click to browse · maximum 10 MB"}
            </span>
          </label>
          <div className="field">
            <label htmlFor="host-title">Game title</label>
            <input
              id="host-title"
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Castle Builder Grammar Race"
              required
            />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="host-subject">Subject</label>
              <select
                id="host-subject"
                className="select"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              >
                <option>English</option>
                <option>Maths</option>
                <option>Science</option>
                <option>Languages</option>
                <option>Classroom Routines</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="host-visibility">Initial visibility</label>
              <select
                id="host-visibility"
                className="select"
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as Visibility)
                }
              >
                <option value="private">Private</option>
                <option value="school">School</option>
                <option value="public">Public after review</option>
              </select>
            </div>
          </div>
          {status && <p className="upload-status">{status}</p>}
          <button
            className="button button--sun button--full"
            type="submit"
            disabled={busy}
          >
            <UploadCloud size={18} />
            {busy ? "Validating…" : "Upload to Wellesley Games"}
          </button>
        </form>
        <aside className="upload-rules">
          <div className="panel">
            <p className="overline">Accepted now</p>
            {[
              "A single complete .html document",
              "Inline CSS and JavaScript",
              "Data URLs and embedded media",
              "Keyboard, mouse and touch input",
            ].map((rule) => (
              <p key={rule}>
                <Check size={16} /> {rule}
              </p>
            ))}
          </div>
          <div className="notice">
            <LockKeyhole size={20} />
            <p>
              Games are served from <strong>play.classboardgames.com</strong>,
              separate from teacher accounts and dashboard cookies.
            </p>
          </div>
          <div className="notice notice--sun">
            <ShieldCheck size={20} />
            <p>
              Public publishing still requires a metadata and moderation review.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
