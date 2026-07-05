import { getCloudflareEnv, jsonError } from "@/lib/cloudflare";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const env = getCloudflareEnv();
  if (!env?.DB) return jsonError("Database binding unavailable.", 503);
  await env.DB.prepare(
    `UPDATE games
     SET status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND status IN ('draft', 'ready_for_review')`,
  )
    .bind(id)
    .run();
  return Response.json({ ok: true, status: "published" });
}
