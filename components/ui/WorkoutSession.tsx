"use client";

import { useState } from "react";
import ExerciseRow from "@/components/ui/ExerciseRow";
import MaterialIcon from "@/components/icons/MaterialIcon";
import { Exercise } from "@/lib/types";

interface WorkoutSessionProps {
  sessionNumber: number;
  title: string;
  status?: "completed" | "upcoming" | "locked";
  defaultExpanded?: boolean;
  exercises: Exercise[];
}

export default function WorkoutSession({
  title,
  defaultExpanded = true,
  exercises,
}: WorkoutSessionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="rounded-[1.75rem] border border-outline-variant/80 bg-surface-container-lowest p-4 shadow-sm sm:p-5">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <h4 className="truncate text-base font-black tracking-tight text-on-surface">
            {title}
          </h4>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-outline">
            {exercises.length} esercizi
          </p>
        </div>
        <div className="mt-1 flex shrink-0 items-center gap-2">
          <div className="hidden rounded-full border border-outline-variant/80 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-outline sm:block">
            {isExpanded ? "Aperta" : "Chiusa"}
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <MaterialIcon
              name={isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
              className="text-lg"
            />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          <div className="space-y-2">
            {exercises.map((exercise) => (
              <ExerciseRow key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
