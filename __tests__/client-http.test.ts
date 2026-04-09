import { describe, expect, test, vi } from "vitest";
import { ApiError, requestJson } from "../lib/client/http";

describe("client http", () => {
  test("requestJson returns parsed json on success", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(requestJson<{ ok: boolean }>("/api/test")).resolves.toEqual({ ok: true });

    fetchSpy.mockRestore();
  });

  test("requestJson throws ApiError with parsed server message", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Boom" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(requestJson("/api/test")).rejects.toEqual(new ApiError("Boom", 409));

    fetchSpy.mockRestore();
  });
});
