import { getCloudflareEnv, jsonError } from "@/lib/cloudflare";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const env = getCloudflareEnv();
  if (!env?.DB || !env.SCAN_QUEUE)
    return jsonError("Cloudflare bindings unavailable.", 503);
  const game = await env.DB.prepare(
    "SELECT source_url FROM games WHERE id = ?",
  )
    .bind(id)
    .first<{ source_url: string }>();
  if (!game) return jsonError("Game not found.", 404);
  const jobId = crypto.randomUUID();
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO scan_jobs (id, game_id, status, progress, current_step)
       VALUES (?, ?, 'queued', 0, 'Queued for re-scan')`,
    ).bind(jobId, id),
    env.DB.prepare(
      "UPDATE games SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).bind(id),
  ]);
  await env.SCAN_QUEUE.send({
    jobId,
    gameId: id,
    url: game.source_url,
    requestedBy: "teacher-joseph",
  });
  return Response.json({ jobId }, { status: 202 });
}
