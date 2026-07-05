import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className={`brand-logo ${compact ? "brand-logo--compact" : ""}`}
      href="/"
      aria-label="ClassBoard Games home"
    >
      <Image
        src="/classboard-games-logo.png"
        alt="ClassBoard Games"
        width={1536}
        height={512}
        priority
      />
    </Link>
  );
}
