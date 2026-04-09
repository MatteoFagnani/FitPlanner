"use client";

import { useState } from "react";
import ExerciseRow from "@/components/ui/ExerciseRow";
import MaterialIcon from "@/components/icons/MaterialIcon";
import { Exercise } from "@/lib/types";
import { cn } from "@/lib/utils";

interface WorkoutSessionProps {
  sessionNumber: number;
  title: string;
  status?: "completed" | "upcoming" | "locked";
  defaultExpanded?: boolean;
  exercises: Exercise[];
}

const statusStyles: Record<NonNullable<WorkoutSessionProps["status"]>, string> = {
  completed: "bg-green-500/10 text-green-700 border-green-500/20",
  upcoming: "bg-primary/10 text-primary border-primary/20",
  locked: "bg-surface-container text-outline border-outline-variant",
};

const statusLabels: Record<NonNullable<WorkoutSessionProps["status"]>, string> = {
  completed: "Completata",
  upcoming: "In Programma",
  locked: "Bloccata",
};

export default function WorkoutSession({
  sessionNumber,
  title,
  status = "upcoming",
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
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
              Sessione {sessionNumber}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                statusStyles[status]
              )}
            >
              {statusLabels[status]}
            </span>
          </div>
          <div>
            <h4 className="truncate text-base font-black tracking-tight text-on-surface">
              {title}
            </h4>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-outline">
              {exercises.length} esercizi
            </p>
          </div>
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
          <div className="grid grid-cols-[minmax(0,1.7fr)_3.25rem_4rem_2.75rem_3.75rem] gap-1.5 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-outline">
            <span>Nome</span>
            <span className="text-center">SxR</span>
            <span className="text-center">Metodo</span>
            <span className="text-center">%</span>
            <span className="text-right">Carico</span>
          </div>

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
