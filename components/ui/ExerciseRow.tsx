"use client";

import { useRef } from "react";
import { Exercise } from "@/lib/types";
import MaterialIcon from "@/components/icons/MaterialIcon";

interface ExerciseRowProps {
  exercise: Exercise;
  isSavingLoad?: boolean;
  onSaveLoad?: (value: number | null) => Promise<void> | void;
}

function formatLoad(load?: number) {
  if (!load) return "-";
  return `${load.toFixed(load % 1 === 0 ? 0 : 1)}kg`;
}

function formatInputValue(value?: number) {
  if (value === undefined) return "";
  return value % 1 === 0 ? String(value) : String(value);
}

export default function ExerciseRow({ exercise, isSavingLoad = false, onSaveLoad }: ExerciseRowProps) {
  const loadLabel = formatLoad(exercise.load);
  const performedLoadLabel = formatLoad(exercise.performedLoad);
  const percentageLabel = exercise.percentage
    ? `${exercise.percentage}%${exercise.percentageReference === "topSet" ? "@" : "1RM"}`
    : "-";
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!onSaveLoad) return;

    const normalizedValue = inputRef.current?.value.trim() ?? "";
    if (!normalizedValue) {
      onSaveLoad(null);
      return;
    }

    const parsed = Number(normalizedValue.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 0) {
      return;
    }

    onSaveLoad(parsed);
  };

  return (
    <div
      className="rounded-2xl border border-outline-variant/70 bg-white px-3 py-2 text-[10px] text-on-surface shadow-sm"
      title={exercise.notes || exercise.name}
    >
      <p className="line-clamp-2 rounded-xl bg-surface-container-lowest px-2 py-1 text-[12px] font-bold leading-tight tracking-tight text-on-surface">
        {exercise.name}
      </p>

      <div className="mt-2 grid grid-cols-3 items-start gap-2">
        <span className="truncate rounded-xl bg-surface-container-lowest px-2 py-1 text-center font-semibold tabular-nums text-outline">
          {exercise.sets}x{exercise.reps}
        </span>
        <span className="truncate rounded-xl bg-surface-container-lowest px-2 py-1 text-center text-outline">
          {exercise.method || "Base"}
        </span>
        <span className="truncate rounded-xl bg-surface-container-lowest px-2 py-1 text-center font-semibold tabular-nums text-outline">
          {percentageLabel}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
        <div className="flex items-center justify-center rounded-xl bg-primary/8 px-3 py-2">
          <p className="text-[11px] font-black tabular-nums text-primary">{loadLabel}</p>
        </div>

        <div className="rounded-xl border border-outline-variant/80 bg-surface-container-lowest px-1 py-1">
          <div className="flex items-center gap-2">
            <input
              key={`${exercise.id}-${exercise.performedLoad ?? "empty"}`}
              ref={inputRef}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              defaultValue={formatInputValue(exercise.performedLoad)}
              placeholder={exercise.performedLoad ? performedLoadLabel : exercise.load ? String(exercise.load) : "kg"}
              className="h-8 min-w-0 flex-1 rounded-lg border border-outline-variant/80 bg-white px-2 text-[11px] font-semibold tabular-nums text-on-surface outline-none placeholder:text-outline/45 focus:border-primary"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isSavingLoad}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm disabled:opacity-60"
              aria-label="Salva carico effettivo"
            >
              <MaterialIcon
                name={isSavingLoad ? "progress_activity" : "done"}
                className={`text-sm ${isSavingLoad ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
