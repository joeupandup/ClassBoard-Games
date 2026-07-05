import { z } from "zod";
import { getCloudflareEnv, jsonError } from "@/lib/cloudflare";

const updateSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  descriptionShort: z.string().max(500).optional(),
  studentGoal: z.string().max(1000).optional(),
  subject: z.string().max(80).optional(),
  visibility: z.enum(["private", "school", "public"]).optional(),
  howToPlay: z.array(z.string().max(500)).max(10).optional(),
  teacherNotes: z.array(z.string().max(500)).max(20).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const env = getCloudflareEnv();
  if (!env?.DB) return jsonError("Database binding unavailable.", 503);
  const game = await env.DB.prepare("SELECT * FROM games WHERE id = ?")
    .bind(id)
    .first();
  if (!game) return jsonError("Game not found.", 404);
  return Response.json({ game });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid game update.");
  const env = getCloudflareEnv();
  if (!env?.DB) return jsonError("Database binding unavailable.", 503);
  const data = parsed.data;
  await env.DB.prepare(
    `UPDATE games SET
      title = COALESCE(?, title),
      description_short = COALESCE(?, description_short),
      student_goal = COALESCE(?, student_goal),
      subject = COALESCE(?, subject),
      visibility = COALESCE(?, visibility),
      how_to_play = COALESCE(?, how_to_play),
      teacher_notes = COALESCE(?, teacher_notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
  )
    .bind(
      data.title ?? null,
      data.descriptionShort ?? null,
      data.studentGoal ?? null,
      data.subject ?? null,
      data.visibility ?? null,
      data.howToPlay ? JSON.stringify(data.howToPlay) : null,
      data.teacherNotes ? JSON.stringify(data.teacherNotes) : null,
      id,
    )
    .run();
  return Response.json({ ok: true });
}
