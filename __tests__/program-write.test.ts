import { describe, expect, test } from "vitest";
import { toProgramCreateInput, toProgramUpdateInput } from "../lib/server/program-write";
import type { Program } from "../lib/types";

function createProgram(overrides: Partial<Program> = {}): Program {
  return {
    id: 1,
    title: "Programma",
    status: "active",
    coachId: 1,
    athleteIds: [2],
    weeks: [],
    createdAt: "2026-04-09T12:00:00.000Z",
    updatedAt: "2026-04-09T12:30:00.000Z",
    ...overrides,
  };
}

describe("program-write", () => {
  test("create input prefers athleteIds array", () => {
    const input = toProgramCreateInput(createProgram(), 99);

    expect(input.coachId).toBe(99);
    expect(input.athleteIds).toEqual([2]);
  });

  test("sanitizes user-specific progress before persisting weeks", () => {
    const input = toProgramCreateInput(
      createProgram({
        weeks: [
          {
            id: "w-1",
            order: 1,
            completed: true,
            sessions: [
              {
                id: "s-1",
                title: "A",
                order: 1,
                completed: true,
                exercises: [
                  {
                    id: "ex-1",
                    name: "Squat",
                    sets: 4,
                    reps: 5,
                    performedLoad: 150,
                  },
                ],
              },
            ],
          },
        ],
      }),
      99
    );

    expect(input.weeks).toEqual([
      {
        id: "w-1",
        order: 1,
        sessions: [
          {
            id: "s-1",
            title: "A",
            order: 1,
            exercises: [
              {
                id: "ex-1",
                name: "Squat",
                sets: 4,
                reps: 5,
                method: undefined,
                notes: undefined,
                percentage: undefined,
                percentageReference: undefined,
                load: undefined,
              },
            ],
          },
        ],
      },
    ]);
  });

  test("update input falls back to athleteId when athleteIds is missing", () => {
    const input = toProgramUpdateInput(
      createProgram({
        athleteIds: undefined,
        athleteId: 77,
      }),
      99
    );

    expect(input.coachId).toBe(99);
    expect(input.athleteIds).toEqual([77]);
  });
});
