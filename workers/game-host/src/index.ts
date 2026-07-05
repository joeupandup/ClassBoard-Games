interface GameHostEnv {
  DB: D1Database;
  GAME_ASSETS: R2Bucket;
  APP_ORIGIN: string;
}

const securityHeaders = {
  "content-security-policy": [
    "sandbox allow-scripts allow-pointer-lock allow-forms",
    "default-src 'self' data: blob: https:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "connect-src 'self' https:",
    "frame-ancestors https://classboardgames.com",
  ].join("; "),
  "cross-origin-resource-policy": "cross-origin",
  "permissions-policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
};

export default {
  async fetch(request: Request, env: GameHostEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "classboard-game-host" });
    }
    const match = url.pathname.match(/^\/wellesley\/([a-z0-9-]+)\/?$/);
    if (!match) return new Response("Game not found", { status: 404 });
    const slug = match[1];
    const game = await env.DB.prepare(
      `SELECT hosted_object_key, title
       FROM games
       WHERE slug = ? AND publisher_id = 'publisher-wellesley'
         AND status = 'published' AND hosted_object_key IS NOT NULL`,
    )
      .bind(slug)
      .first<{ hosted_object_key: string; title: string }>();
    if (!game) return new Response("Game not published", { status: 404 });
    const object = await env.GAME_ASSETS.get(game.hosted_object_key);
    if (!object) return new Response("Game file missing", { status: 404 });

    const headers = new Headers(securityHeaders);
    object.writeHttpMetadata(headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "public, max-age=300");
    return new Response(object.body, { headers });
  },
} satisfies ExportedHandler<GameHostEnv>;
