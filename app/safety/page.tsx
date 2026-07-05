import type { Metadata } from "next";
import {
  CheckCircle2,
  ExternalLink,
  FileWarning,
  LockKeyhole,
  PencilLine,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = { title: "Safety and trust" };

const items = [
  [CheckCircle2, "Teachers press Publish", "AI produces suggestions, never an automatic public listing."],
  [PencilLine, "Every field stays editable", "Titles, goals, tags, grades and teaching notes remain under teacher control."],
  [ExternalLink, "Embedding respects the source", "Blocked games open separately; ClassBoard never bypasses frame policies."],
  [LockKeyhole, "Hosted games use another origin", "Game code cannot access dashboard cookies or teacher account data."],
  [FileWarning, "Public games can be reported", "Moderators receive a clear record and can unpublish while reviewing."],
  [ShieldCheck, "Rights matter", "Only submit games you created or have permission to distribute."],
] as const;

export default function SafetyPage() {
  return (
    <>
      <section className="safety-hero">
        <div className="shell">
          <p className="eyebrow">Safety, ownership and control</p>
          <h1>Classroom software should explain its rules clearly.</h1>
          <p>
            ClassBoard Games is for teachers and about children’s learning. That
            makes permission, moderation and technical isolation product
            features—not small print.
          </p>
        </div>
      </section>
      <section className="shell safety-grid">
        {items.map(([Icon, title, copy]) => (
          <article className="safety-card" key={title}>
            <Icon />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="shell policy-section" id="copyright">
        <div>
          <p className="eyebrow">Publishing policy</p>
          <h2>Own it, have permission, or leave it as a private link.</h2>
        </div>
        <div>
          <p>
            Public listings and hosted copies must be submitted by the creator or
            someone with clear distribution permission. A link to another
            creator’s public game may be kept private for personal organisation,
            but should not be republished as your own work.
          </p>
          <p>
            Reports create an auditable moderation record. School administrators
            can restrict visibility while a report is reviewed.
          </p>
        </div>
      </section>
    </>
  );
}
