import { describe, expect, test } from "vitest";
import type { NextRequest } from "next/server";
import { assertSameOrigin } from "../lib/server/request-security";

function createMockRequest(headers: Record<string, string | undefined>) {
  return {
    headers: {
      get(name: string) {
        return headers[name.toLowerCase()] ?? null;
      },
    },
  } as unknown as NextRequest;
}

describe("request-security", () => {
  test("allows same-origin requests", () => {
    const request = createMockRequest({
      origin: "https://fitplanner.app",
      host: "fitplanner.app",
      "x-forwarded-proto": "https",
    });

    const result = assertSameOrigin(request);
    expect(result.ok).toBe(true);
  });

  test("rejects cross-origin requests", () => {
    const request = createMockRequest({
      origin: "https://evil.example",
      host: "fitplanner.app",
      "x-forwarded-proto": "https",
    });

    const result = assertSameOrigin(request);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });

  test("allows requests without origin header", () => {
    const request = createMockRequest({
      host: "fitplanner.app",
      "x-forwarded-proto": "https",
    });

    const result = assertSameOrigin(request);
    expect(result.ok).toBe(true);
  });
});
