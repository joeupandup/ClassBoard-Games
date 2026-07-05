import { getCloudflareEnv, jsonError } from "@/lib/cloudflare";
import { slugify } from "@/lib/utils";

const maxBytes = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const env = getCloudflareEnv();
  if (!env?.DB || !env.GAME_ASSETS)
    return jsonError("D1 and R2 bindings are required for hosted games.", 503);
  const form = await request.formData();
  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  const requestedSlug = String(form.get("slug") ?? "");
  const subject = String(form.get("subject") ?? "English");
  const visibility = String(form.get("visibility") ?? "private");
  if (!(file instanceof File)) return jsonError("Choose an HTML file.");
  if (!file.name.toLowerCase().endsWith(".html") || file.type !== "text/html")
    return jsonError("Only HTML documents are accepted.");
  if (file.size > maxBytes) return jsonError("HTML file exceeds 10 MB.");
  if (title.length < 2 || title.length > 160) return jsonError("Enter a valid title.");

  const html = await file.text();
  if (!/<html[\s>]/i.test(html) && !/<!doctype html>/i.test(html))
    return jsonError("The upload is not a complete HTML document.");
  const id = crypto.randomUUID();
  const slug = slugify(requestedSlug || title);
  const objectKey = `games/wellesley/${slug}/${id}/index.html`;
  await env.GAME_ASSETS.put(objectKey, html, {
    httpMetadata: {
      contentType: "text/html; charset=utf-8",
      cacheControl: "public, max-age=300",
    },
    customMetadata: {
      publisher: "wellesley-games",
      gameId: id,
      uploadedBy: "teacher-joseph",
    },
  });

  const sourceUrl = `${env.GAME_ORIGIN}/wellesley/${slug}/`;
  await env.DB.prepare(
    `INSERT INTO games (
      id, owner_id, publisher_id, title, slug, source_url, canonical_url,
      source_platform, status, visibility, description_short, student_goal,
      subject, categories, skills, tags, activity_types, play_mode,
      embed_allowed, hosted_object_key
    ) VALUES (
      ?, 'teacher-joseph', 'publisher-wellesley', ?, ?, ?, ?, 'hosted',
      'ready_for_review', ?, 'A Wellesley HTML game awaiting review.',
      'Review the target student goal.', ?, ?, '["Needs review"]',
      '["Wellesley Games","self-contained HTML"]', '["Interactive Game"]',
      'hosted', 1, ?
    )`,
  )
    .bind(
      id,
      title,
      slug,
      sourceUrl,
      sourceUrl,
      visibility,
      subject,
      JSON.stringify([subject]),
      objectKey,
    )
    .run();
  await env.DB.prepare(
    `INSERT INTO game_assets (id, game_id, type, object_key, public_url)
     VALUES (?, ?, 'html', ?, ?)`,
  )
    .bind(crypto.randomUUID(), id, objectKey, sourceUrl)
    .run();

  return Response.json(
    {
      game: {
        id,
        title,
        slug,
        sourceUrl,
        sourcePlatform: "hosted",
        status: "ready_for_review",
        visibility,
        subject,
        playMode: "hosted",
      },
    },
    { status: 201 },
  );
}
