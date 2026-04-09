"use client";

import { useState } from "react";
import ExerciseRow from "@/components/ui/ExerciseRow";
import MaterialIcon from "@/components/icons/MaterialIcon";
import { Exercise } from "@/lib/types";

interface WorkoutSessionProps {
  title: string;
  defaultExpanded?: boolean;
  exercises: Exercise[];
  completed?: boolean;
  isUpdatingCompletion?: boolean;
  onToggleCompleted?: () => void;
}

export default function WorkoutSession({
  title,
  defaultExpanded = true,
  exercises,
  completed = false,
  isUpdatingCompletion = false,
  onToggleCompleted,
}: WorkoutSessionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section
      className={`rounded-[1.75rem] border p-4 shadow-sm transition-colors sm:p-5 ${
        completed
          ? "border-green-500/25 bg-green-500/[0.04]"
          : "border-outline-variant/80 bg-surface-container-lowest"
      }`}
    >
      <div className="flex items-start gap-3">
        {onToggleCompleted ? (
          <button
            type="button"
            onClick={onToggleCompleted}
            disabled={isUpdatingCompletion}
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-60 ${
              completed
                ? "bg-green-600 text-white"
                : "border border-outline-variant/80 bg-white text-outline"
            }`}
            aria-label={completed ? "Segna sessione come non completata" : "Segna sessione come completata"}
          >
            <MaterialIcon
              name={completed ? "done" : "radio_button_unchecked"}
              className="text-base"
            />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
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
      </div>

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
