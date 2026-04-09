"use client";

import MaterialIcon from "@/components/icons/MaterialIcon";
import WeekSection from "@/components/ui/WeekSection";
import WorkoutSession from "@/components/ui/WorkoutSession";
import { Program, User } from "@/lib/types";
import { useStore } from "@/lib/store/useStore";
import { calculateLoad } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

function ProgramWeekViewport({
  activeProgram,
  currentUser,
}: {
  activeProgram: Program;
  currentUser: User;
}) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const currentWeek = activeProgram.weeks[currentWeekIndex] ?? activeProgram.weeks[0];

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-[1.75rem] border border-outline-variant/80 bg-white p-3 shadow-sm">
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
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-outline">
            {currentWeekIndex + 1} / {activeProgram.weeks.length}
          </p>
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

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWeek.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <WeekSection weekNumber={currentWeek.order} defaultExpanded>
              {currentWeek.sessions.map((session) => (
                <WorkoutSession
                  key={session.id}
                  sessionNumber={session.order}
                  title={session.title}
                  status={currentWeekIndex === 0 && session.order === 1 ? "completed" : "upcoming"}
                  defaultExpanded={session.order === 1}
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
            </WeekSection>
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
          ((program.athleteIds && program.athleteIds.includes(currentUser.id)) ||
            program.athleteId === currentUser.id)
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
  const completedSessions = 4;
  const progressPercent = (completedSessions / totalSessions) * 100;
  const totalWeeks = activeProgram.weeks.length;

  return (
    <div className="relative mx-auto max-w-4xl space-y-8 p-4 md:p-6">
      <div className="scanline-overlay" />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MaterialIcon name="analytics" className="text-sm text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-outline">
              Stato Sincronizzazione
            </span>
          </div>
          <span className="text-[10px] font-black italic text-primary">88% COMPLETATO</span>
        </div>
        <div className="h-2 overflow-hidden border border-outline-variant bg-surface-container p-[1px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="glow-sm h-full bg-primary"
          />
        </div>
        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-outline">
          <span>INIZIO</span>
          <span>OBIETTIVO</span>
        </div>
      </section>

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
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              ID Protocollo: {activeProgram.id.substring(0, 12).toUpperCase()}
            </p>
            <div className="border border-green-500/20 bg-green-500/10 px-2 py-[2px] text-[8px] font-black uppercase tracking-tighter text-green-500">
              In Corso
            </div>
          </div>
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
            <p className="mt-2 text-2xl font-black tracking-tight text-on-surface">{totalWeeks}</p>
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
