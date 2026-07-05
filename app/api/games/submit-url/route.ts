import { getCloudflareEnv, jsonError } from "@/lib/cloudflare";
import { submissionSchema } from "@/lib/validation";
import { detectPlatform } from "@/lib/utils";

export async function POST(request: Request) {
  const result = submissionSchema.safeParse(await request.json());
  if (!result.success)
    return jsonError(result.error.issues[0]?.message ?? "Invalid submission.");
  const env = getCloudflareEnv();
  if (!env?.DB || !env.SCAN_QUEUE)
    return jsonError("Cloudflare bindings are not active in this preview.", 503);

  const id = crypto.randomUUID();
  const jobId = crypto.randomUUID();
  const slug = `pending-${id.slice(0, 8)}`;
  const { url, visibility, subject } = result.data;

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO games (
        id, owner_id, publisher_id, title, slug, source_url, canonical_url,
        source_platform, status, visibility, subject
      ) VALUES (?, 'teacher-joseph', 'publisher-community', 'Scanning game…', ?, ?, ?, ?, 'processing', ?, ?)`,
    ).bind(
      id,
      slug,
      url,
      url,
      detectPlatform(url),
      visibility,
      subject ?? "",
    ),
    env.DB.prepare(
      `INSERT INTO scan_jobs (id, game_id, status, progress, current_step)
       VALUES (?, ?, 'queued', 0, 'Queued for analysis')`,
    ).bind(jobId, id),
  ]);
  await env.SCAN_QUEUE.send({
    jobId,
    gameId: id,
    url,
    requestedBy: "teacher-joseph",
  });
  return Response.json({ gameId: id, jobId, status: "queued" }, { status: 202 });
}
