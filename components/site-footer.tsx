import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <BrandLogo />
          <p>
            The proper home for classroom games—made by teachers, organised for
            teaching.
          </p>
        </div>
        <div>
          <h3>Discover</h3>
          <Link href="/explore">Explore games</Link>
          <Link href="/publishers/wellesley-games">Wellesley Games</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
        <div>
          <h3>Create</h3>
          <Link href="/submit">Submit a link</Link>
          <Link href="/publish">Host an HTML game</Link>
          <Link href="/hosting">Hosting roadmap</Link>
        </div>
        <div>
          <h3>Trust</h3>
          <Link href="/safety">Safety and moderation</Link>
          <Link href="/safety#copyright">Copyright</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </div>
      <div className="shell footer-base">
        <span>© 2026 ClassBoard Games</span>
        <span>Built for teachers who make things.</span>
      </div>
    </footer>
  );
}
