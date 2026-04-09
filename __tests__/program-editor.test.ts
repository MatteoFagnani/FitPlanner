import { describe, expect, test } from "vitest";
import {
  addSessionToWeek,
  addWeekToProgram,
  cloneSessionInWeek,
  createInitialWeeks,
  deleteSessionFromWeek,
  normalizeWeeks,
} from "../lib/program-editor";

describe("program-editor", () => {
  test("createInitialWeeks returns a valid starter week", () => {
    const weeks = createInitialWeeks();

    expect(weeks).toHaveLength(1);
    expect(weeks[0]?.order).toBe(1);
    expect(weeks[0]?.sessions).toHaveLength(1);
    expect(weeks[0]?.sessions[0]?.completed).toBe(false);
  });

  test("addWeekToProgram clones the last week with fresh ids and resets completion", () => {
    const baseWeeks = createInitialWeeks();
    baseWeeks[0]!.completed = true;
    baseWeeks[0]!.sessions[0]!.completed = true;

    const nextWeeks = addWeekToProgram(baseWeeks);

    expect(nextWeeks).toHaveLength(2);
    expect(nextWeeks[1]?.id).not.toBe(baseWeeks[0]?.id);
    expect(nextWeeks[1]?.order).toBe(2);
    expect(nextWeeks[1]?.completed).toBe(false);
    expect(nextWeeks[1]?.sessions[0]?.completed).toBe(false);
  });

  test("addSessionToWeek appends a new incomplete session", () => {
    const week = createInitialWeeks()[0]!;
    const updatedWeek = addSessionToWeek(week);

    expect(updatedWeek.sessions).toHaveLength(2);
    expect(updatedWeek.sessions[1]?.order).toBe(2);
    expect(updatedWeek.sessions[1]?.completed).toBe(false);
  });

  test("cloneSessionInWeek duplicates the session and resets completion", () => {
    const week = createInitialWeeks()[0]!;
    week.sessions[0]!.completed = true;

    const updatedWeek = cloneSessionInWeek(week, week.sessions[0]!.id);

    expect(updatedWeek.sessions).toHaveLength(2);
    expect(updatedWeek.sessions[1]?.id).not.toBe(week.sessions[0]?.id);
    expect(updatedWeek.sessions[1]?.completed).toBe(false);
  });

  test("deleteSessionFromWeek keeps orders normalized", () => {
    const weekWithTwoSessions = addSessionToWeek(createInitialWeeks()[0]!);

    const updatedWeek = deleteSessionFromWeek(
      weekWithTwoSessions,
      weekWithTwoSessions.sessions[0]!.id
    );

    expect(updatedWeek.sessions).toHaveLength(1);
    expect(updatedWeek.sessions[0]?.order).toBe(1);
  });

  test("normalizeWeeks recalculates week and completion ordering", () => {
    const weeks = addWeekToProgram(createInitialWeeks());
    weeks[0]!.order = 5;
    weeks[0]!.sessions[0]!.order = 9;
    weeks[0]!.sessions[0]!.completed = true;

    const normalized = normalizeWeeks(weeks);

    expect(normalized[0]?.order).toBe(1);
    expect(normalized[0]?.sessions[0]?.order).toBe(1);
    expect(normalized[0]?.completed).toBe(true);
    expect(normalized[1]?.order).toBe(2);
  });
});
