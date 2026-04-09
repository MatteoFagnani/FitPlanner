import { describe, expect, test } from "vitest";
import { canCoachManageProgram, canUserToggleProgramSession, isAssignedToProgram } from "../lib/server/program-access";
import type { Program, User } from "../lib/types";

function createProgram(overrides: Partial<Program> = {}): Program {
  return {
    id: "prog-1",
    title: "Programma",
    status: "active",
    coachId: "coach-1",
    athleteIds: ["athlete-1"],
    weeks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    name: "User",
    email: "user@example.com",
    role: "athlete",
    oneRMs: [],
    ...overrides,
  };
}

describe("program-access", () => {
  test("isAssignedToProgram returns true for athleteIds membership", () => {
    expect(isAssignedToProgram(createProgram(), "athlete-1")).toBe(true);
    expect(isAssignedToProgram(createProgram(), "athlete-2")).toBe(false);
  });

  test("canCoachManageProgram only allows owning coach", () => {
    expect(
      canCoachManageProgram(createProgram(), createUser({ id: "coach-1", role: "coach" }))
    ).toBe(true);
    expect(
      canCoachManageProgram(createProgram(), createUser({ id: "coach-2", role: "coach" }))
    ).toBe(false);
    expect(
      canCoachManageProgram(createProgram(), createUser({ id: "athlete-1", role: "athlete" }))
    ).toBe(false);
  });

  test("canUserToggleProgramSession allows owner coach or assigned athlete", () => {
    expect(
      canUserToggleProgramSession(createProgram(), createUser({ id: "coach-1", role: "coach" }))
    ).toBe(true);
    expect(
      canUserToggleProgramSession(createProgram(), createUser({ id: "athlete-1", role: "athlete" }))
    ).toBe(true);
    expect(
      canUserToggleProgramSession(createProgram(), createUser({ id: "athlete-2", role: "athlete" }))
    ).toBe(false);
  });
});
