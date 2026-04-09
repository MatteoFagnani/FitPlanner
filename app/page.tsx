"use client";

import MaterialIcon from "@/components/icons/MaterialIcon";
import WorkoutSession from "@/components/ui/WorkoutSession";
import { Program, User } from "@/lib/types";
import { useStore } from "@/lib/store/useStore";
import { calculateLoad } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { isAssignedToProgram } from "@/lib/server/program-access";

function ProgramWeekViewport({
  activeProgram,
  currentUser,
}: {
  activeProgram: Program;
  currentUser: User;
}) {
  const { toggleSessionCompletion } = useStore();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);
  const currentWeek = activeProgram.weeks[currentWeekIndex] ?? activeProgram.weeks[0];
  const isCurrentWeekCompleted =
    currentWeek.sessions.length > 0 && currentWeek.sessions.every((session) => session.completed);

  const goToPreviousWeek = () => {
    setCurrentWeekIndex((current) => Math.max(0, current - 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekIndex((current) => Math.min(activeProgram.weeks.length - 1, current + 1));
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const deltaX = event.changedTouches[0]?.clientX - touchStartX;
    setTouchStartX(null);

    if (deltaX <= -40) {
      goToNextWeek();
    }

    if (deltaX >= 40) {
      goToPreviousWeek();
    }
  };

  const handleToggleSessionCompletion = async (sessionId: string) => {
    setUpdatingSessionId(sessionId);
    await toggleSessionCompletion(activeProgram.id, currentWeek.id, sessionId);
    setUpdatingSessionId(null);
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-[2rem] border border-outline-variant/80 bg-white p-4 shadow-sm sm:p-5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/70 pb-4">
          <button
            type="button"
            onClick={goToPreviousWeek}
            disabled={currentWeekIndex === 0}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-lowest text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MaterialIcon name="arrow_back_ios_new" className="text-base" />
          </button>

          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-outline">
              Settimana Corrente
            </p>
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-on-surface">
              Week {currentWeek.order}
            </h3>
            <div className="mt-1 flex items-center justify-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-outline">
                {currentWeekIndex + 1} / {activeProgram.weeks.length}
              </p>
            </div>
             <div className="mt-1 flex items-center justify-center gap-2">
              {isCurrentWeekCompleted && (
                <span className="rounded-full bg-green-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-white">
                  Completata
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={goToNextWeek}
            disabled={currentWeekIndex === activeProgram.weeks.length - 1}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-lowest text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MaterialIcon name="arrow_forward_ios" className="text-base" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentWeek.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4"
          >
            {currentWeek.sessions.map((session) => (
              <WorkoutSession
                key={session.id}
                title={session.title}
                defaultExpanded={session.order === 1}
                completed={Boolean(session.completed)}
                isUpdatingCompletion={updatingSessionId === session.id}
                onToggleCompleted={() => handleToggleSessionCompletion(session.id)}
                exercises={session.exercises.map((exercise) => {
                  let calculatedLoad = exercise.load;

                  if (exercise.percentage) {
                    const userRM = currentUser.oneRMs.find((rm) => rm.exercise === exercise.name)?.value;
                    if (userRM) {
                      calculatedLoad = calculateLoad(exercise.percentage, userRM);
                    }
                  }

                  return {
                    ...exercise,
                    load: calculatedLoad || 0,
                  };
                })}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function TrainingPage() {
  const { currentUser, programs, isProgramsHydrated } = useStore();

  const activeProgram = currentUser
    ? programs.find(
        (program) =>
          (!program.status || program.status === "active") &&
          isAssignedToProgram(program, currentUser.id)
      )
    : undefined;

  if (!currentUser) return null;

  if (!isProgramsHydrated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-outline">
          Sincronizzazione in corso
        </p>
      </div>
    );
  }

  if (!activeProgram) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center space-y-6 p-4 text-center md:p-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-outline-variant bg-surface-container">
          <MaterialIcon name="fitness_center" className="text-4xl text-outline-variant" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Nessun Protocollo Attivo</h2>
          <p className="max-w-xs text-sm font-medium text-outline">
            Il tuo registro di allenamento personale e attualmente vuoto.
            {currentUser.role === "coach"
              ? " Assegnati un programma nella sezione Programmi per iniziare il monitoraggio."
              : " Contatta il tuo coach per sincronizzare il tuo protocollo di allenamento."}
          </p>
        </div>
      </div>
    );
  }

  const totalSessions = activeProgram.weeks.reduce((accumulator, week) => accumulator + week.sessions.length, 0);
  const completedSessions = activeProgram.weeks.reduce(
    (accumulator, week) =>
      accumulator + week.sessions.filter((session) => session.completed).length,
    0
  );
  const totalWeeks = activeProgram.weeks.length;
  const completedWeeks = activeProgram.weeks.filter(
    (week) => week.sessions.length > 0 && week.sessions.every((session) => session.completed)
  ).length;

  return (
    <div className="relative mx-auto max-w-4xl space-y-8 p-4 md:p-6">
      <div className="scanline-overlay" />

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <MaterialIcon name="fitness_center" filled className="text-sm" />
          <span className="glow-blue text-[10px] font-black uppercase tracking-[0.4em]">
            Protocollo Attivo
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter sm:text-4xl">
            {activeProgram.title}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
          <div className="rounded-2xl border border-outline-variant/80 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
              Sessioni
            </p>
            <p className="mt-2 text-2xl font-black tracking-tight text-on-surface">
              {completedSessions}/{totalSessions}
            </p>
          </div>
          <div className="rounded-2xl border border-outline-variant/80 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
              Settimane
            </p>
            <p className="mt-2 text-2xl font-black tracking-tight text-on-surface">
              {completedWeeks}/{totalWeeks}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-outline">
            Registro Allenamenti
          </h3>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
            Swipe per cambiare settimana
          </span>
        </div>

        <ProgramWeekViewport key={activeProgram.id} activeProgram={activeProgram} currentUser={currentUser} />
      </section>
    </div>
  );
}
