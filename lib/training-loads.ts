import { Exercise, Program, User } from "@/lib/types";
import { calculateLoad } from "@/lib/utils";

function normalizeText(value?: string) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function parseRpe(method?: string) {
  const match = method?.match(/rpe\s*(\d+(?:[.,]\d+)?)/i);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTopSet(method?: string) {
  const match = method?.match(/(\d+)\s*@\s*(\d+(?:[.,]\d+)?)/i);
  if (!match) {
    return null;
  }

  const reps = Number(match[1]);
  const rpe = Number(match[2].replace(",", "."));

  if (!Number.isFinite(reps) || reps <= 0 || !Number.isFinite(rpe)) {
    return null;
  }

  return { reps, rpe };
}

function roundTrainingLoad(value: number) {
  return Math.round(value / 2.5) * 2.5;
}

function getRepsInReserve(method?: string) {
  const rpe = parseRpe(method);
  if (rpe === null) {
    return null;
  }

  const rir = 10 - rpe;
  return Math.min(6, Math.max(0, rir));
}

function estimateEquivalentMax(load: number, reps: number, method?: string) {
  const repsInReserve = getRepsInReserve(method);
  if (!load || load <= 0 || reps <= 0 || repsInReserve === null) {
    return null;
  }

  const effectiveReps = reps + repsInReserve;
  return load * (1 + effectiveReps / 30);
}

function estimateLoadFromEquivalentMax(equivalentMax: number, reps: number, method?: string) {
  const repsInReserve = getRepsInReserve(method);
  if (!equivalentMax || equivalentMax <= 0 || reps <= 0 || repsInReserve === null) {
    return null;
  }

  const effectiveReps = reps + repsInReserve;
  return roundTrainingLoad(equivalentMax / (1 + effectiveReps / 30));
}

type HistoricalLoadEntry = {
  method?: string;
  load: number;
  reps: number;
  weekOrder: number;
  sessionOrder: number;
};

function getBaseHistoricalLoad(exercise: Exercise) {
  const storedLoad = exercise.performedLoad ?? exercise.load;
  if (!storedLoad || storedLoad <= 0) {
    return null;
  }

  if (exercise.percentageReference === "topSet" && exercise.percentage) {
    return storedLoad / (exercise.percentage / 100);
  }

  return storedLoad;
}

function getHistoricalEntries(
  program: Program,
  exerciseName: string,
  currentWeekOrder: number,
  currentSessionOrder: number
) {
  const normalizedExerciseName = normalizeText(exerciseName);
  const entries: HistoricalLoadEntry[] = [];

  for (const week of program.weeks) {
    const isFutureWeek = week.order > currentWeekOrder;
    if (isFutureWeek) {
      continue;
    }

    for (const session of week.sessions) {
      const isSameOrFutureSession =
        week.order === currentWeekOrder && session.order >= currentSessionOrder;

      if (isSameOrFutureSession) {
        continue;
      }

      for (const exercise of session.exercises) {
        if (normalizeText(exercise.name) !== normalizedExerciseName) {
          continue;
        }

        const topSet = parseTopSet(exercise.method);
        const load = getBaseHistoricalLoad(exercise);
        if (!load || load <= 0) {
          continue;
        }

        entries.push({
          method: exercise.method,
          load,
          reps: topSet?.reps ?? exercise.reps,
          weekOrder: week.order,
          sessionOrder: session.order,
        });
      }
    }
  }

  return entries.sort((left, right) => {
    if (left.weekOrder !== right.weekOrder) {
      return left.weekOrder - right.weekOrder;
    }

    return left.sessionOrder - right.sessionOrder;
  });
}

export function getCalculatedExerciseLoad(
  exercise: Exercise,
  user: User,
  program: Program,
  currentWeekOrder: number,
  currentSessionOrder: number
) {
  const percentageReference = exercise.percentageReference ?? "oneRM";
  const topSet = parseTopSet(exercise.method);

  if (exercise.percentage && percentageReference === "oneRM") {
    const userRM = user.oneRMs.find((rm) => normalizeText(rm.exercise) === normalizeText(exercise.name))?.value;
    if (userRM) {
      return calculateLoad(exercise.percentage, userRM);
    }
  }

  const history = getHistoricalEntries(program, exercise.name, currentWeekOrder, currentSessionOrder);
  const normalizedMethod = normalizeText(exercise.method);
  const exactMethodMatch =
    normalizedMethod.length > 0
      ? [...history].reverse().find((entry) => normalizeText(entry.method) === normalizedMethod)
      : undefined;
  const fallbackEntry = history[history.length - 1];
  const chosenEntry = exactMethodMatch ?? fallbackEntry;

  if (chosenEntry) {
    const equivalentMax = estimateEquivalentMax(
      chosenEntry.load,
      chosenEntry.reps,
      chosenEntry.method
    );

    if (equivalentMax !== null) {
      const targetReps = topSet?.reps ?? exercise.reps;
      const targetMethod = topSet ? `RPE ${topSet.rpe}` : exercise.method;
      const estimatedLoad = estimateLoadFromEquivalentMax(
        equivalentMax,
        targetReps,
        targetMethod
      );

      if (estimatedLoad !== null) {
        if (percentageReference === "topSet") {
          return estimatedLoad;
        }

        return estimatedLoad;
      }
    }

    if (percentageReference === "topSet") {
      return roundTrainingLoad(chosenEntry.load);
    }

    return roundTrainingLoad(chosenEntry.load);
  }

  if (percentageReference === "topSet" && exercise.percentage && topSet) {
    const userRM = user.oneRMs.find((rm) => normalizeText(rm.exercise) === normalizeText(exercise.name))?.value;
    if (userRM) {
      const topSetLoad = estimateLoadFromEquivalentMax(
        userRM,
        topSet.reps,
        `RPE ${topSet.rpe}`
      );
      if (topSetLoad !== null) {
        return topSetLoad;
      }
    }
  }

  return exercise.load ?? 0;
}
