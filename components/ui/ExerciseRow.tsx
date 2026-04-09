"use client";

import { Exercise } from "@/lib/types";

interface ExerciseRowProps {
  exercise: Exercise;
}

function formatLoad(load?: number) {
  if (!load) return "-";
  return `${load.toFixed(load % 1 === 0 ? 0 : 1)}kg`;
}

export default function ExerciseRow({ exercise }: ExerciseRowProps) {
  const loadLabel = formatLoad(exercise.load);
  const shouldSplitLayout =
    exercise.name.length > 24 ||
    (exercise.method?.length ?? 0) > 10 ||
    loadLabel.length > 7;

  return (
    <div
      className="rounded-2xl border border-outline-variant/70 bg-white px-3 py-2 text-[10px] text-on-surface shadow-sm"
      title={exercise.notes || exercise.name}
    >
      {shouldSplitLayout ? (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_3.25rem_4rem] items-start gap-1.5">
            <span className="line-clamp-2 font-bold leading-tight tracking-tight">{exercise.name}</span>
            <span className="pt-0.5 text-center font-semibold tabular-nums text-outline">
              {exercise.sets}x{exercise.reps}
            </span>
            <span className="truncate pt-0.5 text-center text-outline">
              {exercise.method || "Base"}
            </span>
          </div>
          <div className="mt-1 grid grid-cols-[2.75rem_3.75rem] justify-end gap-1.5">
            <span className="text-center font-semibold tabular-nums text-outline">
              {exercise.percentage ? `${exercise.percentage}%` : "-"}
            </span>
            <span className="truncate text-right font-bold tabular-nums text-primary">
              {loadLabel}
            </span>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-[minmax(0,1.7fr)_3.25rem_4rem_2.75rem_3.75rem] items-center gap-1.5">
          <span className="truncate font-bold tracking-tight">{exercise.name}</span>
          <span className="text-center font-semibold tabular-nums text-outline">
            {exercise.sets}x{exercise.reps}
          </span>
          <span className="truncate text-center text-outline">
            {exercise.method || "Base"}
          </span>
          <span className="text-center font-semibold tabular-nums text-outline">
            {exercise.percentage ? `${exercise.percentage}%` : "-"}
          </span>
          <span className="truncate text-right font-bold tabular-nums text-primary">
            {loadLabel}
          </span>
        </div>
      )}
    </div>
  );
}
