import { describe, expect, test } from "vitest";
import { serializeProgram } from "../lib/server/programs";

describe("serializeProgram", () => {
  test("defaults to incomplete without user-specific progress", () => {
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

    expect(serialized.weeks[0]?.sessions[0]?.completed).toBe(false);
    expect(serialized.weeks[0]?.completed).toBe(false);
    expect(serialized.updatedAt).toBe(now.toISOString());
  });

  test("applies per-user progress as an overlay", () => {
    const now = new Date("2026-04-09T12:00:00.000Z");
    const serialized = serializeProgram(
      {
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
              {
                id: "s-1",
                title: "A",
                order: 1,
                exercises: [{ id: "ex-1", name: "Squat", sets: 4, reps: 5 }],
              },
              {
                id: "s-2",
                title: "B",
                order: 2,
                exercises: [{ id: "ex-2", name: "Bench", sets: 3, reps: 6 }],
              },
            ],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        completedSessionIds: ["s-1"],
        performedLoads: { "ex-2": 87.5 },
      }
    );

    expect(serialized.weeks[0]?.sessions[0]?.completed).toBe(true);
    expect(serialized.weeks[0]?.sessions[1]?.completed).toBe(false);
    expect(serialized.weeks[0]?.completed).toBe(false);
    expect(serialized.weeks[0]?.sessions[1]?.exercises[0]?.performedLoad).toBe(87.5);
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
