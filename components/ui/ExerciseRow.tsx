"use client";

import { useEffect, useRef, useState } from "react";
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

function roundToTrainingLoad(value: number) {
  return Math.round(value / 2.5) * 2.5;
}

function getDisplayLoadLabel(exercise: Exercise, currentPerformedLoad?: number | null) {
  const topSetLoad = currentPerformedLoad ?? exercise.performedLoad ?? exercise.load;

  if (
    topSetLoad &&
    exercise.percentageReference === "topSet" &&
    exercise.percentage !== undefined
  ) {
    const backoffLoad = roundToTrainingLoad(topSetLoad * (exercise.percentage / 100));
    return `${formatLoad(topSetLoad)} / ${formatLoad(backoffLoad)}`;
  }

  return formatLoad(exercise.load);
}

function formatInputValue(value?: number) {
  if (value === undefined) return "";
  return value % 1 === 0 ? String(value) : String(value);
}

export default function ExerciseRow({ exercise, isSavingLoad = false, onSaveLoad }: ExerciseRowProps) {
  const percentageLabel = exercise.percentage
    ? `${exercise.percentage}%${exercise.percentageReference === "topSet" ? "@" : "1RM"}`
    : "-";
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedValueRef = useRef<number | null>(exercise.performedLoad ?? null);
  const [inputValue, setInputValue] = useState(() => formatInputValue(exercise.performedLoad));
  const parsedInputValue = (() => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      return null;
    }

    const parsed = Number(trimmedValue.replace(",", "."));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  })();
  const loadLabel = getDisplayLoadLabel(exercise, parsedInputValue);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const getNormalizedValue = () => {
    const normalizedValue = inputRef.current?.value.trim() ?? inputValue.trim();
    if (!normalizedValue) {
      return null;
    }

    const parsed = Number(normalizedValue.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 0) {
      return undefined;
    }

    return parsed;
  };

  const saveCurrentValue = () => {
    if (!onSaveLoad) return;

    const normalizedValue = getNormalizedValue();
    if (normalizedValue === undefined || normalizedValue === lastSavedValueRef.current) {
      return;
    }

    lastSavedValueRef.current = normalizedValue;
    onSaveLoad(normalizedValue);
  };

  const queueSave = () => {
    if (!onSaveLoad) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      saveCurrentValue();
    }, 550);
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

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="flex min-w-0 items-center justify-center rounded-xl bg-primary/8 px-2 py-2">
          <p className="truncate text-[11px] font-black tabular-nums text-primary">{loadLabel}</p>
        </div>

        <div className="min-w-0 rounded-xl border border-outline-variant/80 bg-surface-container-lowest px-2 py-1">
          <div className="flex min-w-0 items-center">
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                queueSave();
              }}
              onBlur={saveCurrentValue}
              placeholder={exercise.load ? String(exercise.load) : "kg"}
              className="h-8 min-w-0 w-full rounded-lg border border-outline-variant/80 bg-white px-2 pr-8 text-[11px] font-semibold tabular-nums text-on-surface outline-none placeholder:text-outline/45 focus:border-primary"
            />
            <div className="pointer-events-none -ml-7 flex h-8 w-7 shrink-0 items-center justify-center text-outline">
              <MaterialIcon
                name={isSavingLoad ? "progress_activity" : "edit"}
                className={`text-sm ${isSavingLoad ? "animate-spin text-primary" : ""}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
