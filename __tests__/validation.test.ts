import { describe, expect, test } from "vitest";
import { changePasswordSchema, loginSchema, oneRMSchema } from "../lib/server/validation";

describe("validation schemas", () => {
  test("login schema accepts valid payload", () => {
    const parsed = loginSchema.safeParse({ identity: "coach", password: "secret" });
    expect(parsed.success).toBe(true);
  });

  test("oneRM schema rejects missing exercise", () => {
    const parsed = oneRMSchema.safeParse({ exercise: "", value: 100 });
    expect(parsed.success).toBe(false);
  });

  test("changePassword schema requires at least 8 chars for new password", () => {
    const parsed = changePasswordSchema.safeParse({
      currentPassword: "old-password",
      newPassword: "short",
    });

    expect(parsed.success).toBe(false);
  });
});
