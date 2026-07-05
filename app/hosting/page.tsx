import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Code2, Link2, PackageOpen, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Hosting roadmap" };

export default function HostingPage() {
  return (
    <>
      <section className="page-intro shell">
        <p className="eyebrow">A deliberate hosting roadmap</p>
        <h1>Start with a link. Move to permanent hosting when the game is ready.</h1>
        <p>
          Three clear modes, each with rules teachers and developers can
          understand.
        </p>
      </section>
      <section className="shell roadmap-grid">
        <RoadmapCard
          number="01"
          status="Available in the MVP"
          icon={Link2}
          title="Paste a public URL"
          copy="The safest and fastest way to catalogue a game that already works online."
          bullets={[
            "Automatic screenshots and metadata",
            "New-tab play by default",
            "Teacher review before publishing",
          ]}
          active
        />
        <RoadmapCard
          number="02"
          status="Wellesley importer ready"
          icon={PackageOpen}
          title="Host a static game"
          copy="Self-contained HTML today; bundled static ZIP projects next."
          bullets={[
            "Stored in Cloudflare R2",
            "Served from a separate game domain",
            "Sandbox and security headers",
          ]}
        />
        <RoadmapCard
          number="03"
          status="Later"
          icon={Code2}
          title="Build approved source"
          copy="Strict Vite templates only, built in isolated containers with predictable output."
          bullets={[
            "package.json and lockfile required",
            "Static dist output only",
            "No promise to build arbitrary projects",
          ]}
        />
      </section>
      <section className="shell hosting-principle">
        <ShieldCheck size={34} />
        <div>
          <p className="eyebrow">The governing principle</p>
          <h2>Predictable beats magical when a class is waiting.</h2>
          <p>
            ClassBoard Games never converts arbitrary React snippets into
            mystery HTML. Every hosting mode has a clear contract and a clear
            failure message.
          </p>
        </div>
        <Link className="button button--sun" href="/publish">
          Import an HTML game <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}

function RoadmapCard({
  number,
  status,
  icon: Icon,
  title,
  copy,
  bullets,
  active = false,
}: {
  number: string;
  status: string;
  icon: typeof Link2;
  title: string;
  copy: string;
  bullets: string[];
  active?: boolean;
}) {
  return (
    <article className={`roadmap-card panel ${active ? "active" : ""}`}>
      <div className="roadmap-card__top">
        <span>{number}</span>
        <strong>{status}</strong>
      </div>
      <Icon size={30} />
      <h2>{title}</h2>
      <p>{copy}</p>
      <ul>
        {bullets.map((bullet) => (
          <li key={bullet}>
            <Check size={15} /> {bullet}
          </li>
        ))}
      </ul>
    </article>
  );
}
