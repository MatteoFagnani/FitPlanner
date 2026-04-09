import { describe, expect, test } from "vitest";
import { canCoachManageProgram, canUserToggleProgramSession, isAssignedToProgram } from "../lib/server/program-access";
import type { Program, User } from "../lib/types";

function createProgram(overrides: Partial<Program> = {}): Program {
  return {
    id: 1,
    title: "Programma",
    status: "active",
    coachId: 1,
    athleteIds: [2],
    weeks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 99,
    name: "User",
    role: "athlete",
    oneRMs: [],
    ...overrides,
  };
}

describe("program-access", () => {
  test("isAssignedToProgram returns true for athleteIds membership", () => {
    expect(isAssignedToProgram(createProgram(), 2)).toBe(true);
    expect(isAssignedToProgram(createProgram(), 3)).toBe(false);
  });

  test("canCoachManageProgram only allows owning coach", () => {
    expect(
      canCoachManageProgram(createProgram(), createUser({ id: 1, role: "coach" }))
    ).toBe(true);
    expect(
      canCoachManageProgram(createProgram(), createUser({ id: 10, role: "coach" }))
    ).toBe(false);
    expect(
      canCoachManageProgram(createProgram(), createUser({ id: 2, role: "athlete" }))
    ).toBe(false);
  });

  test("canUserToggleProgramSession allows owner coach or assigned athlete", () => {
    expect(
      canUserToggleProgramSession(createProgram(), createUser({ id: 1, role: "coach" }))
    ).toBe(true);
    expect(
      canUserToggleProgramSession(createProgram(), createUser({ id: 2, role: "athlete" }))
    ).toBe(true);
    expect(
      canUserToggleProgramSession(createProgram(), createUser({ id: 3, role: "athlete" }))
    ).toBe(false);
  });
});
