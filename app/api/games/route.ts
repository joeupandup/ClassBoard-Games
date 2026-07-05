import { getCloudflareEnv, jsonError } from "@/lib/cloudflare";

export async function GET(request: Request) {
  const env = getCloudflareEnv();
  if (!env?.DB) return jsonError("Database binding unavailable.", 503);
  const url = new URL(request.url);
  const visibility = url.searchParams.get("visibility");
  const query = visibility
    ? env.DB.prepare(
        "SELECT * FROM games WHERE status = 'published' AND visibility = ? ORDER BY published_at DESC LIMIT 100",
      ).bind(visibility)
    : env.DB.prepare(
        "SELECT * FROM games WHERE status = 'published' AND visibility = 'public' ORDER BY published_at DESC LIMIT 100",
      );
  const { results } = await query.all();
  return Response.json({ games: results });
}
