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
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div
        className="grid min-w-[30rem] grid-cols-[minmax(9rem,1.8fr)_4.5rem_5.5rem_3.5rem_4.5rem] items-center gap-2 rounded-2xl border border-outline-variant/70 bg-white px-3 py-2 text-[11px] text-on-surface shadow-sm"
        title={exercise.notes || exercise.name}
      >
        <span className="truncate font-bold tracking-tight">{exercise.name}</span>
        <span className="text-center font-semibold tabular-nums text-outline">
          {exercise.sets}x{exercise.reps}
        </span>
        <span className="truncate text-center text-outline">
          {exercise.method || "Standard"}
        </span>
        <span className="text-center font-semibold tabular-nums text-outline">
          {exercise.percentage ? `${exercise.percentage}%` : "-"}
        </span>
        <span className="text-right font-bold tabular-nums text-primary">
          {formatLoad(exercise.load)}
        </span>
      </div>
    </div>
  );
}