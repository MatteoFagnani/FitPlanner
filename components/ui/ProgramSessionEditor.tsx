"use client";

import MaterialIcon from "@/components/icons/MaterialIcon";
import { Exercise, Session } from "@/lib/types";

interface ProgramSessionEditorProps {
  accentColorClass: string;
  accentSurfaceClass: string;
  session: Session;
  sessionIndex: number;
  canDeleteSession: boolean;
  onCloneSession: (sessionId: string) => void;
  onAddExercise: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateSessionTitle: (sessionId: string, newTitle: string) => void;
  onRemoveExercise: (sessionId: string, exerciseIndex: number) => void;
  onUpdateExercise: (
    sessionId: string,
    exerciseIndex: number,
    field: keyof Exercise,
    value: Exercise[keyof Exercise]
  ) => void;
}

export default function ProgramSessionEditor({
  accentColorClass,
  accentSurfaceClass,
  session,
  sessionIndex,
  canDeleteSession,
  onCloneSession,
  onAddExercise,
  onDeleteSession,
  onUpdateSessionTitle,
  onRemoveExercise,
  onUpdateExercise,
}: ProgramSessionEditorProps) {
  return (
    <section className="space-y-4 rounded-[1.75rem] border border-outline-variant/80 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-lowest text-base font-black italic ${accentColorClass}`}
          >
            {String.fromCharCode(65 + sessionIndex)}
          </div>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={session.title}
              onChange={(event) => onUpdateSessionTitle(session.id, event.target.value)}
              className={`w-full bg-transparent text-base font-black uppercase italic tracking-tight outline-none sm:text-lg ${accentColorClass}`}
            />
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-outline">
              Sessione {session.id.substring(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCloneSession(session.id)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant/80 bg-surface-container-lowest text-outline transition-colors hover:text-primary"
            title="Clona Sessione"
          >
            <MaterialIcon name="content_copy" className="text-lg" />
          </button>
          <button
            type="button"
            onClick={() => onAddExercise(session.id)}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm ${accentSurfaceClass}`}
            title="Aggiungi Esercizio"
          >
            <MaterialIcon name="add" className="text-lg" />
          </button>
          {canDeleteSession && (
            <button
              type="button"
              onClick={() => onDeleteSession(session.id)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant/80 bg-surface-container-lowest text-outline transition-colors hover:text-error"
              title="Elimina Sessione"
            >
              <MaterialIcon name="close" className="text-lg" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {session.exercises.map((exercise, exerciseIndex) => (
          <div
            key={exercise.id || `${session.id}-${exerciseIndex}`}
            className="rounded-[1.5rem] border border-outline-variant/70 bg-surface-container-lowest p-3"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1 sm:col-span-2">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-outline">
                  Esercizio
                </span>
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(event) => onUpdateExercise(session.id, exerciseIndex, "name", event.target.value)}
                  placeholder="Nome esercizio"
                  className="w-full rounded-xl border border-outline-variant/80 bg-white px-3 py-2 text-sm font-bold outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-outline">
                  Set
                </span>
                <input
                  type="number"
                  value={exercise.sets}
                  onChange={(event) => onUpdateExercise(session.id, exerciseIndex, "sets", Number(event.target.value))}
                  className="w-full rounded-xl border border-outline-variant/80 bg-white px-3 py-2 text-sm font-bold outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-outline">
                  Rep
                </span>
                <input
                  type="number"
                  value={exercise.reps}
                  onChange={(event) => onUpdateExercise(session.id, exerciseIndex, "reps", Number(event.target.value))}
                  className="w-full rounded-xl border border-outline-variant/80 bg-white px-3 py-2 text-sm font-bold outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-outline">
                  Metodo
                </span>
                <input
                  type="text"
                  value={exercise.method || ""}
                  onChange={(event) => onUpdateExercise(session.id, exerciseIndex, "method", event.target.value)}
                  placeholder="Metodo"
                  className="w-full rounded-xl border border-outline-variant/80 bg-white px-3 py-2 text-sm font-medium outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-outline">
                  % 1RM
                </span>
                <input
                  type="number"
                  value={exercise.percentage ?? ""}
                  onChange={(event) =>
                    onUpdateExercise(
                      session.id,
                      exerciseIndex,
                      "percentage",
                      event.target.value === "" ? undefined : Number(event.target.value)
                    )
                  }
                  placeholder="--"
                  className="w-full rounded-xl border border-outline-variant/80 bg-white px-3 py-2 text-sm font-bold outline-none"
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-outline">
                  Note
                </span>
                <input
                  type="text"
                  value={exercise.notes || ""}
                  onChange={(event) => onUpdateExercise(session.id, exerciseIndex, "notes", event.target.value)}
                  placeholder="Note utili"
                  className="w-full rounded-xl border border-outline-variant/80 bg-white px-3 py-2 text-sm font-medium outline-none"
                />
              </label>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => onRemoveExercise(session.id, exerciseIndex)}
                className="inline-flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-error"
              >
                <MaterialIcon name="delete_outline" className="text-sm" />
                Rimuovi
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
