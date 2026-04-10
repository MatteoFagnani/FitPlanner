import { describe, expect, test } from "vitest";
import { normalizeExerciseName, removeOneRM, upsertOneRM } from "../lib/one-rm";

describe("one-rm helpers", () => {
  test("normalizes repeated spaces in exercise names", () => {
    expect(normalizeExerciseName("  Bulgarian   Split   Squat ")).toBe("Bulgarian Split Squat");
  });

  test("upserts case-insensitively and preserves a single entry", () => {
    const result = upsertOneRM(
      [{ exercise: "squat", value: 180 }],
      { exercise: "  Squat ", value: 190 }
    );

    expect(result).toEqual([{ exercise: "Squat", value: 190 }]);
  });

  test("removes case-insensitively", () => {
    const result = removeOneRM(
      [
        { exercise: "Bench Press", value: 120 },
        { exercise: "Squat", value: 190 },
      ],
      " bench   press "
    );

    expect(result).toEqual([{ exercise: "Squat", value: 190 }]);
  });
});
