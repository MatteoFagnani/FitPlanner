"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store/useStore";
import MaterialIcon from "@/components/icons/MaterialIcon";
import ProgramAudiencePicker from "@/components/ui/ProgramAudiencePicker";
import ProgramSessionEditor from "@/components/ui/ProgramSessionEditor";
import { useRouter } from "next/navigation";
import { Exercise, Program, Week } from "@/lib/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyExercise(): Exercise {
  return {
    id: createId("ex"),
    name: "",
    sets: 3,
    reps: 10,
    method: "",
    notes: "",
  };
}

function createInitialWeeks(): Week[] {
  return [
    {
      id: createId("w"),
      order: 1,
      sessions: [
        {
          id: createId("s"),
          title: "Sessione A",
          order: 1,
          exercises: [
            {
              id: createId("ex"),
              name: "Squat",
              sets: 3,
              reps: 10,
              method: "RPE 8",
              percentage: 70,
              notes: "",
            },
          ],
        },
      ],
    },
  ];
}

export default function NewProgramPage() {
  const { currentUser, users, hydrateUsersFromDatabase, addProgram } = useStore();
  const router = useRouter();
  const [title, setTitle] = useState("Nuovo Ciclo di Allenamento");
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [weeks, setWeeks] = useState<Week[]>(() => createInitialWeeks());
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);

  useEffect(() => {
    hydrateUsersFromDatabase();
  }, [hydrateUsersFromDatabase]);

  if (!currentUser || currentUser.role !== "coach") return null;

  const currentWeek = weeks[activeWeekIdx];

  const addWeek = () => {
    setWeeks((previousWeeks) => {
      const lastWeek = previousWeeks[previousWeeks.length - 1];
      const newWeek: Week = {
        ...JSON.parse(JSON.stringify(lastWeek)),
        id: createId("w"),
        order: previousWeeks.length + 1,
        sessions: lastWeek.sessions.map((session) => ({
          ...JSON.parse(JSON.stringify(session)),
          id: createId("s"),
          exercises: session.exercises.map((exercise) => ({ ...exercise, id: createId("ex") })),
        })),
      };

      return [...previousWeeks, newWeek];
    });
    setActiveWeekIdx(weeks.length);
  };

  const removeLastWeek = () => {
    if (weeks.length <= 1) return;

    const newWeeks = weeks.slice(0, -1);
    setWeeks(newWeeks);
    if (activeWeekIdx >= newWeeks.length) setActiveWeekIdx(newWeeks.length - 1);
  };

  const addSessionToActiveWeek = () => {
    const newWeeks = [...weeks];
    newWeeks[activeWeekIdx].sessions.push({
      id: createId("s"),
      title: `Sessione ${String.fromCharCode(65 + newWeeks[activeWeekIdx].sessions.length)}`,
      order: newWeeks[activeWeekIdx].sessions.length + 1,
      exercises: [createEmptyExercise()],
    });
    setWeeks(newWeeks);
  };

  const cloneSession = (sessionId: string) => {
    const newWeeks = [...weeks];
    const sessionToClone = newWeeks[activeWeekIdx].sessions.find((session) => session.id === sessionId);
    if (!sessionToClone) return;

    newWeeks[activeWeekIdx].sessions.push({
      ...JSON.parse(JSON.stringify(sessionToClone)),
      id: createId("s"),
      order: newWeeks[activeWeekIdx].sessions.length + 1,
      title: `${sessionToClone.title} (COPIA)`,
      exercises: sessionToClone.exercises.map((exercise) => ({ ...exercise, id: createId("ex") })),
    });
    setWeeks(newWeeks);
  };

  const addExerciseToSession = (sessionId: string) => {
    const newWeeks = [...weeks];
    const session = newWeeks[activeWeekIdx].sessions.find((item) => item.id === sessionId);
    if (!session) return;

    session.exercises.push(createEmptyExercise());
    setWeeks(newWeeks);
  };

  const removeExercise = (sessionId: string, exerciseIdx: number) => {
    const newWeeks = [...weeks];
    const session = newWeeks[activeWeekIdx].sessions.find((item) => item.id === sessionId);
    if (!session) return;

    session.exercises.splice(exerciseIdx, 1);
    setWeeks(newWeeks);
  };

  const updateExercise = (
    sessionId: string,
    exerciseIdx: number,
    field: keyof Exercise,
    value: Exercise[keyof Exercise]
  ) => {
    const newWeeks = [...weeks];
    const session = newWeeks[activeWeekIdx].sessions.find((item) => item.id === sessionId);
    if (!session) return;

    session.exercises[exerciseIdx] = { ...session.exercises[exerciseIdx], [field]: value };
    setWeeks(newWeeks);
  };

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    const newWeeks = [...weeks];
    const session = newWeeks[activeWeekIdx].sessions.find((item) => item.id === sessionId);
    if (!session) return;

    session.title = newTitle;
    setWeeks(newWeeks);
  };

  const deleteSession = (sessionId: string) => {
    if (currentWeek.sessions.length <= 1) return;

    const newWeeks = [...weeks];
    newWeeks[activeWeekIdx].sessions = newWeeks[activeWeekIdx].sessions.filter(
      (session) => session.id !== sessionId
    );
    setWeeks(newWeeks);
  };

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedAthleteIds.length === 0) {
      alert("Seleziona almeno un atleta.");
      return;
    }

    const newProgram: Program = {
      id: createId("prog"),
      title,
      coachId: currentUser.id,
      athleteIds: selectedAthleteIds,
      weeks: weeks.map((week, idx) => ({ ...week, order: idx + 1 })),
      createdAt: new Date().toISOString(),
    };

    setIsSyncing(true);
    setTimeout(() => {
      addProgram(newProgram);
      router.push("/programs");
    }, 900);
  };

  return (
    <div className="relative mx-auto max-w-5xl space-y-6 p-4 pb-40 md:p-6">
      <div className="scanline-overlay" />

      {isSyncing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center space-y-5 bg-background/90 backdrop-blur-xl">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary border-t-transparent glow-sm" />
          <div className="space-y-2 text-center">
            <p className="text-xl font-black uppercase italic tracking-tight glow-blue">
              Distribuzione Protocollo
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-outline">
              Sincronizzazione in corso
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-lowest transition-all hover:bg-primary hover:text-white"
        >
          <MaterialIcon name="arrow_back" />
        </button>
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tight sm:text-3xl">
            Nuovo Protocollo
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-outline">
            Builder condiviso
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        <section className="space-y-4 rounded-[2rem] border border-outline-variant/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-outline">
              <MaterialIcon name="edit_note" className="text-sm" />
              Titolo Protocollo
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/80 bg-surface-container-lowest px-4 py-3 text-base font-black uppercase italic outline-none"
            />
          </div>

          <ProgramAudiencePicker
            users={users}
            selectedIds={selectedAthleteIds}
            onChange={setSelectedAthleteIds}
          />
        </section>

        <section className="sticky top-16 z-30 space-y-4 border-y border-outline-variant bg-background/92 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={removeLastWeek}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant bg-white transition-all hover:bg-error hover:text-white"
            >
              <MaterialIcon name="remove" />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.32em] text-outline">
                Durata Ciclo
              </span>
              <h3 className="text-xl font-black uppercase italic tracking-tight sm:text-3xl">
                {weeks.length} Settimane
              </h3>
            </div>

            <button
              type="button"
              onClick={addWeek}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant bg-white transition-all hover:bg-primary hover:text-white"
            >
              <MaterialIcon name="add" />
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-wrap gap-2">
              {weeks.map((week, idx) => (
                <button
                  key={week.id}
                  type="button"
                  onClick={() => setActiveWeekIdx(idx)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all sm:px-4 sm:text-[11px]",
                    activeWeekIdx === idx
                      ? "border-primary bg-primary text-white shadow-lg"
                      : "border-outline-variant bg-white text-outline"
                  )}
                >
                  Week {idx + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={addSessionToActiveWeek}
              className="flex h-11 w-full items-center justify-center rounded-2xl bg-primary text-white shadow-lg sm:w-11"
            >
              <MaterialIcon name="post_add" />
            </button>
          </div>
        </section>

        <section className="space-y-4">
          {currentWeek.sessions.map((session, sessionIdx) => (
            <motion.div key={session.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <ProgramSessionEditor
                accentColorClass="text-primary"
                accentSurfaceClass="bg-primary"
                session={session}
                sessionIndex={sessionIdx}
                canDeleteSession={currentWeek.sessions.length > 1}
                onCloneSession={cloneSession}
                onAddExercise={addExerciseToSession}
                onDeleteSession={deleteSession}
                onUpdateSessionTitle={updateSessionTitle}
                onRemoveExercise={removeExercise}
                onUpdateExercise={updateExercise}
              />
            </motion.div>
          ))}
        </section>

        <div className="fixed bottom-24 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 px-4">
          <motion.button
            type="submit"
            disabled={isSyncing}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-3 rounded-[1.75rem] border border-primary bg-primary py-4 text-white shadow-2xl glow-sm"
          >
            <MaterialIcon name="send_and_archive" className="text-lg" />
            <span className="text-sm font-black uppercase tracking-[0.28em]">Distribuisci Protocollo</span>
          </motion.button>
        </div>
      </form>
    </div>
  );
}
