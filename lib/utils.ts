import type { Game } from "@/lib/types";

export function gradeBand(game: Pick<Game, "gradeMin" | "gradeMax">) {
  const label = (grade: number) => (grade === 0 ? "K" : String(grade));
  return game.gradeMin === game.gradeMax
    ? `Grade ${label(game.gradeMin)}`
    : `${label(game.gradeMin)}–${label(game.gradeMax)}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function sourceLabel(platform: string) {
  return (
    {
      cloudflare: "Cloudflare",
      chatgpt: "ChatGPT",
      gemini: "Gemini",
      hosted: "ClassBoard hosted",
      custom: "Independent site",
    }[platform] ?? "Web"
  );
}

export function detectPlatform(url: string) {
  const value = url.toLowerCase();
  if (value.includes("chatgpt.com") || value.includes("openai.com"))
    return "chatgpt";
  if (value.includes("gemini.google.com")) return "gemini";
  if (value.includes("pages.dev") || value.includes("workers.dev"))
    return "cloudflare";
  return "custom";
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}
