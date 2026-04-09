import { describe, expect, test } from "vitest";
import { serializeProgram } from "../lib/server/programs";

describe("serializeProgram", () => {
  test("normalizes week completion from session completion", () => {
    const now = new Date("2026-04-09T12:00:00.000Z");
    const serialized = serializeProgram({
      id: 1,
      title: "Programma",
      status: "active",
      coachId: 1,
      athleteIds: [2],
      weeks: [
        {
          id: "w-1",
          order: 1,
          sessions: [
            { id: "s-1", title: "A", order: 1, completed: true, exercises: [] },
            { id: "s-2", title: "B", order: 2, completed: true, exercises: [] },
          ],
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    expect(serialized.weeks[0]?.completed).toBe(true);
    expect(serialized.updatedAt).toBe(now.toISOString());
  });

  test("falls back to empty athleteIds when json is invalid", () => {
    const now = new Date("2026-04-09T12:00:00.000Z");
    const serialized = serializeProgram({
      id: 2,
      title: "Programma",
      status: "active",
      coachId: 1,
      athleteIds: { bad: true },
      weeks: [],
      createdAt: now,
      updatedAt: now,
    });

    expect(serialized.athleteIds).toEqual([]);
  });
});
