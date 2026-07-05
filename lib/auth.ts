import type { UserSession } from "@/lib/types";

const encoder = new TextEncoder();
const cookieName = "cb_session";
const previewSecret = "classboard-local-preview-secret-change-before-launch";

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(
  session: UserSession,
  secret = previewSecret,
) {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        ...session,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
      }),
    ),
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(secret),
    encoder.encode(payload),
  );
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(
  token: string,
  secret = previewSecret,
): Promise<UserSession | null> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const valid = await crypto.subtle.verify(
    "HMAC",
    await signingKey(secret),
    fromBase64Url(signature),
    encoder.encode(payload),
  );
  if (!valid) return null;
  const parsed = JSON.parse(
    new TextDecoder().decode(fromBase64Url(payload)),
  ) as UserSession & { expiresAt: number };
  if (parsed.expiresAt < Date.now()) return null;
  return {
    id: parsed.id,
    name: parsed.name,
    email: parsed.email,
    role: parsed.role,
  };
}

export function sessionCookie(token: string, secure = true) {
  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure ? "; Secure" : ""}`;
}

export function expiredSessionCookie() {
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;
}

export function readSessionCookie(request: Request) {
  const cookies = request.headers.get("cookie") ?? "";
  return (
    cookies
      .split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1) ?? ""
  );
}
