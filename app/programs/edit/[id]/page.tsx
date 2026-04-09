"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store/useStore";
import MaterialIcon from "@/components/icons/MaterialIcon";
import ProgramAudiencePicker from "@/components/ui/ProgramAudiencePicker";
import ProgramSessionEditor from "@/components/ui/ProgramSessionEditor";
import ProgramWeekCarousel from "@/components/ui/ProgramWeekCarousel";
import { useRouter, useParams } from "next/navigation";
import { Exercise, Program, Week } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";

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

function EditProgramForm({
  currentUserId,
  existingProgram,
  users,
  onUpdateProgram,
}: {
  currentUserId: string;
  existingProgram: Program;
  users: ReturnType<typeof useStore.getState>["users"];
  onUpdateProgram: (program: Program) => Promise<boolean>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(existingProgram.title);
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>(
    existingProgram.athleteIds || (existingProgram.athleteId ? [existingProgram.athleteId] : [])
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [weeks, setWeeks] = useState<Week[]>(JSON.parse(JSON.stringify(existingProgram.weeks)));
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);

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
    if (activeWeekIdx >= newWeeks.length) {
      setActiveWeekIdx(newWeeks.length - 1);
    }
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

  const deleteSession = (sessionId: string) => {
    if (currentWeek.sessions.length <= 1) return;

    const newWeeks = [...weeks];
    newWeeks[activeWeekIdx].sessions = newWeeks[activeWeekIdx].sessions.filter(
      (session) => session.id !== sessionId
    );
    setWeeks(newWeeks);
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (selectedAthleteIds.length === 0) {
      alert("Seleziona almeno un utente.");
      return;
    }

    const updatedProgram: Program = {
      ...existingProgram,
      coachId: currentUserId,
      title,
      athleteIds: selectedAthleteIds,
      athleteId: undefined,
      weeks: weeks.map((week, idx) => ({ ...week, order: idx + 1 })),
    };

    setIsSyncing(true);
    const success = await onUpdateProgram(updatedProgram);

    if (success) {
      router.push("/programs");
      return;
    }

    setIsSyncing(false);
    alert("Non sono riuscito ad aggiornare il programma sul database.");
  };

  return (
    <div className="relative mx-auto max-w-5xl space-y-6 p-4 pb-32 md:p-6">
      <div className="scanline-overlay" />

      {isSyncing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center space-y-5 bg-background/90 backdrop-blur-xl">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary border-t-transparent glow-sm" />
          <div className="space-y-2 text-center">
            <p className="text-xl font-black uppercase italic tracking-tight glow-blue">
              Sincronizzazione Modifiche
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-outline">
              Aggiornamento in corso
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
            Revisione Protocollo
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-outline">
            Editor condiviso
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <section className="space-y-4 rounded-[2rem] border border-outline-variant/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-outline">
              <MaterialIcon name="description" className="text-sm" />
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

        <section className="space-y-4 rounded-[2rem] border border-outline-variant/80 bg-white p-4 shadow-sm sm:p-5">
          <ProgramWeekCarousel
            weeks={weeks}
            activeWeekIdx={activeWeekIdx}
            onSelectWeek={setActiveWeekIdx}
            onAddWeek={addWeek}
            onRemoveWeek={removeLastWeek}
            accentButtonClass="bg-blue-600"
          />

          <div className="flex justify-end border-t border-outline-variant/70 pt-4">
            <button
              type="button"
              onClick={addSessionToActiveWeek}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-white shadow-sm"
            >
              <MaterialIcon name="post_add" className="text-base" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em]">Nuova Sessione</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentWeek.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {currentWeek.sessions.map((session, sessionIdx) => (
                <motion.div key={session.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <ProgramSessionEditor
                    accentColorClass="text-blue-600"
                    accentSurfaceClass="bg-blue-600"
                    session={session}
                    sessionIndex={sessionIdx}
                    canDeleteSession={currentWeek.sessions.length > 1}
                    onCloneSession={cloneSession}
                    onAddExercise={addExerciseToSession}
                    onDeleteSession={deleteSession}
                    onRemoveExercise={removeExercise}
                    onUpdateExercise={updateExercise}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </section>

        <div className="fixed bottom-4 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 px-4">
          <motion.button
            type="submit"
            disabled={isSyncing}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-3 rounded-[1.75rem] border border-blue-600 bg-blue-600 py-4 text-white shadow-2xl glow-blue"
          >
            <MaterialIcon name="sync_saved_locally" className="text-lg" />
            <span className="text-sm font-black uppercase tracking-[0.28em]">Sincronizza Protocollo</span>
          </motion.button>
        </div>
      </form>
    </div>
  );
}

export default function EditProgramPage() {
  const { id } = useParams();
  const {
    currentUser,
    users,
    programs,
    isProgramsHydrated,
    hydrateUsersFromDatabase,
    hydrateProgramsFromDatabase,
    updateProgram,
  } = useStore();

  useEffect(() => {
    hydrateUsersFromDatabase();
    hydrateProgramsFromDatabase();
  }, [hydrateProgramsFromDatabase, hydrateUsersFromDatabase]);

  const existingProgram = useMemo(
    () => programs.find((program) => program.id === id),
    [id, programs]
  );

  if (!currentUser || currentUser.role !== "coach") return null;
  if (!isProgramsHydrated || !existingProgram) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-outline">
          Sincronizzazione in corso
        </p>
      </div>
    );
  }

  return (
    <EditProgramForm
      currentUserId={currentUser.id}
      existingProgram={existingProgram}
      users={users}
      onUpdateProgram={updateProgram}
    />
  );
}
