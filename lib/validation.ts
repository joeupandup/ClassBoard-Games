import { z } from "zod";

const blockedHostnames = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata",
]);

export const submissionSchema = z.object({
  url: z
    .string()
    .url()
    .refine((value) => {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    }, "Only public HTTP or HTTPS URLs are supported.")
    .refine((value) => !blockedHostnames.has(new URL(value).hostname), {
      message: "Local and metadata addresses are not allowed.",
    }),
  visibility: z.enum(["private", "school", "public"]),
  subject: z.string().max(80).optional(),
  gradeBand: z.string().max(40).optional(),
  language: z.string().max(80).optional(),
  notes: z.string().max(2000).optional(),
  rightsConfirmed: z.literal(true),
});

export function isSafePublicUrl(value: string) {
  const parsed = submissionSchema.shape.url.safeParse(value);
  if (!parsed.success) return false;
  const hostname = new URL(value).hostname.toLowerCase();

  if (
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.endsWith(".local") ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  ) {
    return false;
  }

  return true;
}
