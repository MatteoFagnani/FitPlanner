import { describe, expect, test } from "vitest";
import {
  loginSchema,
  oneRMSchema,
  programStatusPatchSchema,
  toggleSessionCompletionSchema,
} from "../lib/server/validation";

describe("validation schemas", () => {
  test("loginSchema accepts valid credentials", () => {
    const parsed = loginSchema.safeParse({
      identity: "coach@example.com",
      password: "secure-password",
    });

    expect(parsed.success).toBe(true);
  });

  test("oneRMSchema rejects invalid negative values", () => {
    const parsed = oneRMSchema.safeParse({
      exercise: "Squat",
      value: -10,
    });

    expect(parsed.success).toBe(false);
  });

  test("toggleSessionCompletionSchema requires concurrency token", () => {
    const parsed = toggleSessionCompletionSchema.safeParse({
      action: "toggle-session-completion",
      weekId: "w-1",
      sessionId: "s-1",
    });

    expect(parsed.success).toBe(false);
  });

  test("programStatusPatchSchema only accepts active or archived", () => {
    expect(
      programStatusPatchSchema.safeParse({
        status: "active",
        expectedUpdatedAt: new Date().toISOString(),
      }).success
    ).toBe(true);

    expect(
      programStatusPatchSchema.safeParse({
        status: "draft",
        expectedUpdatedAt: new Date().toISOString(),
      }).success
    ).toBe(false);
  });
});
