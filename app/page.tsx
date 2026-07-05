import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  FileSearch,
  FolderSearch,
  GraduationCap,
  LibraryBig,
  Link2,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GameCard } from "@/components/game-card";
import { SectionHeading } from "@/components/section-heading";
import { seedGames } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero__wash" aria-hidden="true" />
        <div className="shell home-hero__grid">
          <div className="home-hero__copy">
            <p className="eyebrow">The classroom game library</p>
            <h1>
              Your best games,
              <br />
              ready for the <span>board.</span>
            </h1>
            <p>
              Publish, organise and rediscover the learning games teachers make.
              Paste a link—or host your own HTML game—and ClassBoard Games turns
              it into a classroom-ready resource.
            </p>
            <div className="home-hero__actions">
              <Link className="button button--sun" href="/submit">
                Add your first game
                <ArrowRight size={17} />
              </Link>
              <Link className="button button--secondary" href="/explore">
                Explore the library
              </Link>
            </div>
            <div className="hero-proof">
              <span>
                <Check size={15} /> No manual descriptions
              </span>
              <span>
                <Check size={15} /> Teacher-approved publishing
              </span>
            </div>
          </div>
          <div className="scan-console" aria-label="Game analysis preview">
            <div className="scan-console__top">
              <span>New game scan</span>
              <span className="scan-console__live">Live preview</span>
            </div>
            <div className="scan-address">
              <Link2 size={17} />
              <span>wellesley-games.pages.dev/castle</span>
              <button type="button" aria-label="Scan example game">
                Scan
              </button>
            </div>
            <div className="scan-console__stage">
              <div className="scan-preview">
                <span className="scan-preview__grid" />
                <span className="scan-preview__castle">🏰</span>
                <strong>Castle Builder</strong>
                <small>Grammar race</small>
              </div>
              <div className="scan-result">
                <p className="overline">Analysis complete</p>
                <h3>Castle Builder Grammar Race</h3>
                <div className="scan-result__line">
                  <span>Subject</span>
                  <strong>English</strong>
                </div>
                <div className="scan-result__line">
                  <span>Grade</span>
                  <strong>3–5</strong>
                </div>
                <div className="scan-result__tags">
                  <span>Past tense</span>
                  <span>Team race</span>
                  <span>Projector</span>
                </div>
              </div>
            </div>
            <div className="scan-console__footer">
              <span>
                <Check size={14} /> 3 screenshots captured
              </span>
              <strong>Ready for your review</strong>
            </div>
          </div>
        </div>
        <div className="shell trust-bar">
          <div>
            <GraduationCap />
            <span>
              <strong>Built for teaching</strong>
              Projectors, tablets and touchscreens
            </span>
          </div>
          <div>
            <ShieldCheck />
            <span>
              <strong>Teacher controlled</strong>
              Nothing publishes without approval
            </span>
          </div>
          <div>
            <LibraryBig />
            <span>
              <strong>Properly organised</strong>
              Skills, grades, subjects and formats
            </span>
          </div>
        </div>
      </section>

      <section className="page-section page-section--white">
        <div className="shell">
          <SectionHeading
            eyebrow="Featured this week"
            title="Games worth putting on the big screen"
            description="Original Wellesley Games and teacher-made favourites, catalogued by the skills they actually practise."
            action={
              <Link className="text-arrow" href="/explore">
                Browse all games <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="game-grid">
            {seedGames.slice(0, 4).map((game) => (
              <GameCard game={game} key={game.id} showPublisher />
            ))}
          </div>
        </div>
      </section>

      <section className="page-section problem-section">
        <div className="shell problem-grid">
          <div>
            <p className="eyebrow">The link problem</p>
            <h2>Great classroom games deserve better than a forgotten tab.</h2>
          </div>
          <div className="problem-copy">
            <p>
              Teachers are building brilliant mini-games faster than ever. Then
              the links scatter across chats, documents, inboxes and browser
              history.
            </p>
            <p>
              ClassBoard Games gives each one a permanent identity: a preview, a
              clear teaching purpose and a place in your library.
            </p>
          </div>
          <div className="problem-ledger">
            {[
              ["01", "Lost in chat history"],
              ["02", "No useful preview"],
              ["03", "Hard to share safely"],
              ["04", "Impossible to find later"],
            ].map(([number, label]) => (
              <div key={number}>
                <span>{number}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section--dark">
        <div className="shell">
          <SectionHeading
            eyebrow="A simpler publishing flow"
            title="One link becomes a teaching resource"
            description="The scanner does the repetitive work. You make the judgement calls."
          />
          <div className="process-grid">
            <article>
              <span className="process-number">01</span>
              <Link2 />
              <h3>Paste the game link</h3>
              <p>
                Add a public game from ChatGPT, Gemini, Cloudflare or your own
                site.
              </p>
            </article>
            <article>
              <span className="process-number">02</span>
              <ScanLine />
              <h3>Let the scanner read it</h3>
              <p>
                Capture screenshots, inspect visible text and draft the
                classroom metadata.
              </p>
            </article>
            <article>
              <span className="process-number">03</span>
              <FileSearch />
              <h3>Review with a teacher’s eye</h3>
              <p>
                Edit the goal, skills, grade band and notes before anything goes
                live.
              </p>
            </article>
            <article>
              <span className="process-number">04</span>
              <ExternalLink />
              <h3>Play from your board</h3>
              <p>
                Open external games safely or play hosted Wellesley games from
                our dedicated game domain.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="page-section page-section--white">
        <div className="shell feature-split">
          <div>
            <p className="eyebrow">Designed around real lessons</p>
            <h2>Search by what students need—not where you saved the link.</h2>
            <p className="feature-lead">
              Find “past tense team race for Grade 4” without remembering its
              title. Build collections for units, classes, relief lessons and
              Friday afternoons.
            </p>
            <Link className="button button--dark" href="/explore">
              Search the library <FolderSearch size={17} />
            </Link>
          </div>
          <div className="feature-board">
            <div className="feature-search">
              <span>past tense team race</span>
              <kbd>⌘ K</kbd>
            </div>
            {seedGames.slice(1, 4).map((game, index) => (
              <div className="feature-result" key={game.id}>
                <span className={`feature-result__art art-${game.accent}`}>
                  {game.motif}
                </span>
                <span>
                  <strong>{game.title}</strong>
                  <small>
                    {game.subject} · {game.skills[0]}
                  </small>
                </span>
                <em>{index === 0 ? "96%" : index === 1 ? "84%" : "76%"}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section publisher-banner">
        <div className="shell publisher-banner__grid">
          <div className="publisher-mark">WG</div>
          <div>
            <p className="eyebrow">Original publisher</p>
            <h2>Meet the Wellesley Games collection</h2>
            <p>
              Self-contained classroom games with a clear teaching job, now
              gathered under one verified publisher page.
            </p>
          </div>
          <Link className="button button--secondary" href="/publishers/wellesley-games">
            View Wellesley Games <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="page-section final-call">
        <div className="shell final-call__inner">
          <span className="final-call__spark">
            <Sparkles />
          </span>
          <div>
            <p className="eyebrow">Your future lesson plan says thanks</p>
            <h2>Build your game shelf before the next bell.</h2>
            <p>
              Start with one link. We’ll help turn it into something you can
              find, trust and play again.
            </p>
          </div>
          <Link className="button button--sun" href="/submit">
            Add a game <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
