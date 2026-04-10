import { describe, expect, test } from "vitest";
import { getCalculatedExerciseLoad } from "../lib/training-loads";
import type { Exercise, Program, User } from "../lib/types";

function createUser(): User {
  return {
    id: 1,
    name: "Athlete",
    role: "athlete",
    oneRMs: [{ exercise: "Squat", value: 200 }],
  };
}

function createExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: "ex-1",
    name: "Bulgarian Split Squat",
    sets: 3,
    reps: 10,
    method: "RPE 8",
    ...overrides,
  };
}

function createProgram(exercises: Exercise[]): Program {
  return {
    id: 1,
    title: "Programma",
    status: "active",
    coachId: 99,
    athleteIds: [1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    weeks: [
      {
        id: "w-1",
        order: 1,
        sessions: [
          {
            id: "s-1",
            title: "Sessione A",
            order: 1,
            exercises,
          },
        ],
      },
      {
        id: "w-2",
        order: 2,
        sessions: [
          {
            id: "s-2",
            title: "Sessione A",
            order: 1,
            exercises: [],
          },
        ],
      },
    ],
  };
}

describe("training-loads", () => {
  test("uses %1RM when available", () => {
    const user = createUser();
    const program = createProgram([]);

    const load = getCalculatedExerciseLoad(
      createExercise({
        name: "Squat",
        reps: 5,
        percentage: 75,
      }),
      user,
      program,
      2,
      1
    );

    expect(load).toBe(150);
  });

  test("estimates next load from historical reps and RPE", () => {
    const user = createUser();
    const program = createProgram([
      createExercise({
        performedLoad: 20,
        reps: 10,
        method: "RPE 8",
      }),
    ]);

    const load = getCalculatedExerciseLoad(
      createExercise({
        reps: 8,
        method: "RPE 9",
      }),
      user,
      program,
      2,
      1
    );

    expect(load).toBe(22.5);
  });

  test("falls back to rounded historical load when no RPE is available", () => {
    const user = createUser();
    const program = createProgram([
      createExercise({
        performedLoad: 27,
        method: "Tempo",
      }),
    ]);

    const load = getCalculatedExerciseLoad(
      createExercise({
        method: "Tempo",
      }),
      user,
      program,
      2,
      1
    );

    expect(load).toBe(27.5);
  });

  test("shows top set load when using top set percentage reference", () => {
    const user = createUser();
    const program = createProgram([
      createExercise({
        method: "5@8 + 3x5",
        percentage: 70,
        percentageReference: "topSet",
        performedLoad: 70,
        reps: 5,
      }),
    ]);

    const load = getCalculatedExerciseLoad(
      createExercise({
        method: "5@8 + 3x5",
        percentage: 72,
        percentageReference: "topSet",
        reps: 5,
      }),
      user,
      program,
      2,
      1
    );

    expect(load).toBe(100);
  });
});
