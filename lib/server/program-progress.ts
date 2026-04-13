import { Prisma } from "@prisma/client";
import type { Exercise, Program, Week } from "@/lib/types";

export type UserProgramProgress = {
  completedSessionIds: string[];
  performedLoads: Record<string, number>;
};

function isStringArray(value: Prisma.JsonValue | null | undefined): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumberRecord(value: Prisma.JsonValue | null | undefined): value is Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === "number" && Number.isFinite(item));
}

export function getEmptyUserProgramProgress(): UserProgramProgress {
  return {
    completedSessionIds: [],
    performedLoads: {},
  };
}

export function parseUserProgramProgress(progress?: {
  completedSessionIds: Prisma.JsonValue | null;
  performedLoads: Prisma.JsonValue | null;
} | null): UserProgramProgress {
  if (!progress) {
    return getEmptyUserProgramProgress();
  }

  return {
    completedSessionIds: isStringArray(progress.completedSessionIds) ? progress.completedSessionIds : [],
    performedLoads: isNumberRecord(progress.performedLoads) ? progress.performedLoads : {},
  };
}

export function applyUserProgramProgress(weeks: Week[], progress: UserProgramProgress): Week[] {
  const completedSessionIds = new Set(progress.completedSessionIds);

  return weeks.map((week) => {
    const sessions = (week.sessions ?? []).map((session) => {
      const exercises = (session.exercises ?? []).map((exercise) => {
        const performedLoad = progress.performedLoads[exercise.id];

        return {
          ...exercise,
          performedLoad: Number.isFinite(performedLoad) ? performedLoad : undefined,
        };
      });

      return {
        ...session,
        exercises,
        completed: completedSessionIds.has(session.id),
      };
    });

    return {
      ...week,
      sessions,
      completed: sessions.length > 0 && sessions.every((session) => session.completed),
    };
  });
}

export function sanitizeWeeksForStorage(weeks: Week[]): Week[] {
  return weeks.map((week, weekIndex) => ({
    id: week.id,
    order: week.order ?? weekIndex + 1,
    sessions: (week.sessions ?? []).map((session, sessionIndex) => ({
      id: session.id,
      title: session.title,
      order: session.order ?? sessionIndex + 1,
      exercises: (session.exercises ?? []).map((exercise: Exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        method: exercise.method,
        notes: exercise.notes,
        percentage: exercise.percentage,
        percentageReference: exercise.percentageReference,
        load: exercise.load,
      })),
    })),
  }));
}

export function toggleCompletedSession(progress: UserProgramProgress, sessionId: string): UserProgramProgress {
  const completedSessionIds = new Set(progress.completedSessionIds);

  if (completedSessionIds.has(sessionId)) {
    completedSessionIds.delete(sessionId);
  } else {
    completedSessionIds.add(sessionId);
  }

  return {
    ...progress,
    completedSessionIds: [...completedSessionIds],
  };
}

export function updatePerformedLoad(
  progress: UserProgramProgress,
  exerciseId: string,
  performedLoad: number | null
): UserProgramProgress {
  const nextPerformedLoads = { ...progress.performedLoads };

  if (performedLoad === null) {
    delete nextPerformedLoads[exerciseId];
  } else {
    nextPerformedLoads[exerciseId] = performedLoad;
  }

  return {
    ...progress,
    performedLoads: nextPerformedLoads,
  };
}

export function hasSession(program: Program, weekId: string, sessionId: string) {
  return program.weeks.some(
    (week) => week.id === weekId && week.sessions.some((session) => session.id === sessionId)
  );
}

export function hasExercise(program: Program, weekId: string, sessionId: string, exerciseId: string) {
  return program.weeks.some(
    (week) =>
      week.id === weekId &&
      week.sessions.some(
        (session) =>
          session.id === sessionId && session.exercises.some((exercise) => exercise.id === exerciseId)
      )
  );
}
