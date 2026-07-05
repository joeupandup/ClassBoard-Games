import { z } from "zod";
import { createSessionToken, sessionCookie } from "@/lib/auth";
import { getCloudflareEnv, jsonError } from "@/lib/cloudflare";
import { slugify } from "@/lib/utils";

const schema = z.object({
  email: z.string().email().max(200),
  name: z.string().trim().min(2).max(80),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Enter a valid name and email.");
  const env = getCloudflareEnv();
  const id = `user-${slugify(parsed.data.email)}`;

  if (env?.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO users (id, email, display_name, role)
         VALUES (?, ?, ?, 'teacher')
         ON CONFLICT(email) DO UPDATE SET display_name = excluded.display_name, updated_at = CURRENT_TIMESTAMP`,
      )
        .bind(id, parsed.data.email.toLowerCase(), parsed.data.name)
        .run();
    } catch {
      // Preview sign-in remains usable before the local D1 migration is applied.
    }
  }

  const token = await createSessionToken(
    {
      id,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      role: "teacher",
    },
    env?.SESSION_SECRET,
  );
  return Response.json(
    { ok: true },
    {
      headers: {
        "set-cookie": sessionCookie(
          token,
          new URL(request.url).protocol === "https:",
        ),
      },
    },
  );
}
