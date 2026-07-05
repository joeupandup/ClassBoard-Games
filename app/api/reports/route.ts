import { z } from "zod";
import { getCloudflareEnv, jsonError } from "@/lib/cloudflare";

const schema = z.object({
  gameId: z.string().min(1).max(100),
  reason: z.enum(["broken", "unsafe", "copyright", "incorrect", "other"]),
  details: z.string().max(2000).default(""),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid report.");
  const env = getCloudflareEnv();
  if (!env?.DB) return jsonError("Database binding unavailable.", 503);
  const id = crypto.randomUUID();
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO moderation_reports
        (id, game_id, reporter_id, reason, details)
       VALUES (?, ?, 'teacher-joseph', ?, ?)`,
    ).bind(id, parsed.data.gameId, parsed.data.reason, parsed.data.details),
    env.DB.prepare(
      `UPDATE games SET moderation_state = 'flagged' WHERE id = ?`,
    ).bind(parsed.data.gameId),
  ]);
  return Response.json({ id, status: "open" }, { status: 201 });
}
