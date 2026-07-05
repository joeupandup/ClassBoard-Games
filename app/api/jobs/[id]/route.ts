import { getCloudflareEnv, jsonError } from "@/lib/cloudflare";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const env = getCloudflareEnv();
  if (!env?.DB) return jsonError("Database binding unavailable.", 503);
  const job = await env.DB.prepare("SELECT * FROM scan_jobs WHERE id = ?")
    .bind(id)
    .first();
  if (!job) return jsonError("Job not found.", 404);
  return Response.json({ job });
}
