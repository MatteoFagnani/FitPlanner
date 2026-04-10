import type { UserOneRM } from "@/lib/types";

export function normalizeExerciseName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function getExerciseNameKey(value: string) {
  return normalizeExerciseName(value).toLocaleLowerCase();
}

export function sortOneRMs(oneRMs: UserOneRM[]) {
  return [...oneRMs].sort((left, right) => left.exercise.localeCompare(right.exercise));
}

export function upsertOneRM(oneRMs: UserOneRM[], nextOneRM: UserOneRM) {
  const nextExercise = normalizeExerciseName(nextOneRM.exercise);
  const nextKey = getExerciseNameKey(nextExercise);
  const normalizedNext = {
    exercise: nextExercise,
    value: nextOneRM.value,
  };

  let replaced = false;
  const merged = oneRMs.map((oneRM) => {
    if (getExerciseNameKey(oneRM.exercise) !== nextKey) {
      return oneRM;
    }

    replaced = true;
    return normalizedNext;
  });

  return sortOneRMs(replaced ? merged : [...merged, normalizedNext]);
}

export function removeOneRM(oneRMs: UserOneRM[], exercise: string) {
  const exerciseKey = getExerciseNameKey(exercise);
  return sortOneRMs(oneRMs.filter((oneRM) => getExerciseNameKey(oneRM.exercise) !== exerciseKey));
}
