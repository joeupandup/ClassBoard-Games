import { describe, expect, it } from "vitest";
import { isSafePublicUrl, submissionSchema } from "../lib/validation";

describe("submission URL safety", () => {
  it("accepts a public HTTPS game", () => {
    expect(isSafePublicUrl("https://games.example.com/play")).toBe(true);
  });

  it("rejects private and local targets", () => {
    expect(isSafePublicUrl("http://127.0.0.1/game")).toBe(false);
    expect(isSafePublicUrl("http://192.168.1.5/game")).toBe(false);
    expect(isSafePublicUrl("http://localhost/game")).toBe(false);
  });

  it("requires a rights confirmation", () => {
    const result = submissionSchema.safeParse({
      url: "https://games.example.com",
      visibility: "public",
      rightsConfirmed: false,
    });
    expect(result.success).toBe(false);
  });
});
