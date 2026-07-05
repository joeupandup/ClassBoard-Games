"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/publish", label: "Publish a game" },
  { href: "/hosting", label: "For creators" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <BrandLogo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              className={pathname.startsWith(link.href) ? "active" : ""}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="text-link header-signin" href="/sign-in">
            Sign in
          </Link>
          <Link className="button button--sun button--small" href="/submit">
            <Plus size={16} aria-hidden="true" />
            Add a game
          </Link>
          <button
            className="mobile-menu-button"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav shell" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/dashboard" onClick={() => setOpen(false)}>
            Teacher dashboard
          </Link>
          <Link href="/sign-in" onClick={() => setOpen(false)}>
            Sign in
          </Link>
        </nav>
      )}
    </header>
  );
}
