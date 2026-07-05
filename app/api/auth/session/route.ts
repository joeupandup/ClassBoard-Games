import { readSessionCookie, verifySessionToken } from "@/lib/auth";
import { getCloudflareEnv } from "@/lib/cloudflare";

export async function GET(request: Request) {
  const env = getCloudflareEnv();
  const session = await verifySessionToken(
    readSessionCookie(request),
    env?.SESSION_SECRET,
  );
  return Response.json({ session });
}
