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
