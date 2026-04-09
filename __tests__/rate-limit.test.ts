import { describe, expect, test } from "vitest";
import { clearRateLimit, consumeRateLimit } from "../lib/server/rate-limit";

describe("rate-limit", () => {
  test("allows requests within the configured window", () => {
    const key = "ip:user";
    clearRateLimit(key);

    const first = consumeRateLimit(key);
    const second = consumeRateLimit(key);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBeLessThan(first.remaining);
  });

  test("blocks requests after the max attempts threshold", () => {
    const key = "ip:blocked-user";
    clearRateLimit(key);

    for (let index = 0; index < 10; index += 1) {
      const result = consumeRateLimit(key);
      expect(result.allowed).toBe(true);
    }

    const blocked = consumeRateLimit(key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
