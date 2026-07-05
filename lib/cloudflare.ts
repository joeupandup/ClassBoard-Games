import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getCloudflareEnv(): CloudflareEnv | null {
  try {
    return getCloudflareContext().env as unknown as CloudflareEnv;
  } catch {
    return null;
  }
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
