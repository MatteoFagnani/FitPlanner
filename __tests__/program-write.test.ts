import { describe, expect, test } from "vitest";
import { toProgramCreateInput, toProgramUpdateInput } from "../lib/server/program-write";
import type { Program } from "../lib/types";

function createProgram(overrides: Partial<Program> = {}): Program {
  return {
    id: "prog-1",
    title: "Programma",
    status: "active",
    coachId: "coach-1",
    athleteIds: ["athlete-1"],
    weeks: [],
    createdAt: "2026-04-09T12:00:00.000Z",
    updatedAt: "2026-04-09T12:30:00.000Z",
    ...overrides,
  };
}

describe("program-write", () => {
  test("create input prefers athleteIds array", () => {
    const input = toProgramCreateInput(createProgram(), "coach-99");

    expect(input.coachId).toBe("coach-99");
    expect(input.athleteIds).toEqual(["athlete-1"]);
  });

  test("update input falls back to athleteId when athleteIds is missing", () => {
    const input = toProgramUpdateInput(
      createProgram({
        athleteIds: undefined,
        athleteId: "athlete-legacy",
      }),
      "coach-99"
    );

    expect(input.coachId).toBe("coach-99");
    expect(input.athleteIds).toEqual(["athlete-legacy"]);
  });
});
