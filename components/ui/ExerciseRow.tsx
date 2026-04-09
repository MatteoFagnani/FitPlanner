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

  return (
    <div
      className="rounded-2xl border border-outline-variant/70 bg-white px-3 py-2 text-[10px] text-on-surface shadow-sm"
      title={exercise.notes || exercise.name}
    >
      <div className="min-w-0">
        <p className="line-clamp-2 text-[11px] font-bold leading-tight tracking-tight text-on-surface">
          {exercise.name}
        </p>
      </div>
      <div className="mt-2 grid grid-cols-4 items-center gap-2">
        <span className="truncate rounded-xl bg-surface-container-lowest px-2 py-1 text-center font-semibold tabular-nums text-outline">
          {exercise.sets}x{exercise.reps}
        </span>
        <span className="truncate rounded-xl bg-surface-container-lowest px-2 py-1 text-center text-outline">
          {exercise.method || "Base"}
        </span>
        <span className="truncate rounded-xl bg-surface-container-lowest px-2 py-1 text-center font-semibold tabular-nums text-outline">
          {exercise.percentage ? `${exercise.percentage}%` : "-"}
        </span>
        <span className="truncate rounded-xl bg-primary/8 px-2 py-1 text-right font-bold tabular-nums text-primary">
          {loadLabel}
        </span>
      </div>
    </div>
  );
}
