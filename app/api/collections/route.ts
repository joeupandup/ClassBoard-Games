import { z } from "zod";
import { getCloudflareEnv, jsonError } from "@/lib/cloudflare";

const schema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().max(500).default(""),
  visibility: z.enum(["private", "school", "public"]).default("private"),
});

export async function GET() {
  const env = getCloudflareEnv();
  if (!env?.DB) return jsonError("Database binding unavailable.", 503);
  const { results } = await env.DB.prepare(
    "SELECT * FROM collections WHERE owner_id = 'teacher-joseph' ORDER BY updated_at DESC",
  ).all();
  return Response.json({ collections: results });
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid collection.");
  const env = getCloudflareEnv();
  if (!env?.DB) return jsonError("Database binding unavailable.", 503);
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO collections (id, owner_id, title, description, visibility)
     VALUES (?, 'teacher-joseph', ?, ?, ?)`,
  )
    .bind(
      id,
      parsed.data.title,
      parsed.data.description,
      parsed.data.visibility,
    )
    .run();
  return Response.json({ id }, { status: 201 });
}
