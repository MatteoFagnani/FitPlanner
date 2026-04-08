"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store/useStore";
import MaterialIcon from "@/components/icons/MaterialIcon";
import { useRouter, useParams } from "next/navigation";
import { Program, Week, Session, Exercise } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function EditProgramPage() {
  const { id } = useParams();
  const { currentUser, users, programs, updateProgram } = useStore();
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [targetAthleteId, setTargetAthleteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);

  useEffect(() => {
    const program = programs.find(p => p.id === id);
    if (program) {
      setTitle(program.title);
      setTargetAthleteId(program.athleteId || "");
      setWeeks(JSON.parse(JSON.stringify(program.weeks))); // Deep clone for local editing
      setLoading(false);
    } else if (!loading) {
      router.push("/programs");
    }
  }, [id, programs, loading, router]);

  if (!currentUser || currentUser.role !== "coach") return null;
  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Sincronizzazione in corso...</p>
    </div>
  );

  const currentWeek = weeks[activeWeekIdx];

  const addWeek = () => {
    setWeeks(prevWeeks => {
      const lastWeek = prevWeeks[prevWeeks.length - 1];
      const newWeek: Week = {
        ...JSON.parse(JSON.stringify(lastWeek)),
        id: `w-${Math.random()}`,
        order: prevWeeks.length + 1,
        sessions: lastWeek.sessions.map(s => ({
          ...JSON.parse(JSON.stringify(s)),
          id: `s-${Math.random()}`,
          exercises: s.exercises.map(ex => ({ ...ex, id: `ex-${Math.random()}` }))
        }))
      };
      return [...prevWeeks, newWeek];
    });
    setActiveWeekIdx(weeks.length);
  };

  const removeLastWeek = () => {
    if (weeks.length > 1) {
      const newWeeks = weeks.slice(0, -1);
      setWeeks(newWeeks);
      if (activeWeekIdx >= newWeeks.length) {
        setActiveWeekIdx(newWeeks.length - 1);
      }
    }
  };

  const addSessionToActiveWeek = () => {
    const newWeeks = [...weeks];
    const newId = `s-${Math.random()}`;
    newWeeks[activeWeekIdx].sessions.push({
      id: newId,
      title: `Sessione ${String.fromCharCode(65 + newWeeks[activeWeekIdx].sessions.length)}`,
      order: newWeeks[activeWeekIdx].sessions.length + 1,
      exercises: [{ id: `ex-${Math.random()}`, name: "", sets: 3, reps: 10, method: "", notes: "" }]
    });
    setWeeks(newWeeks);
  };

  const cloneSession = (sessionId: string) => {
    const newWeeks = [...weeks];
    const sessionToClone = newWeeks[activeWeekIdx].sessions.find(s => s.id === sessionId);
    if (sessionToClone) {
      newWeeks[activeWeekIdx].sessions.push({
        ...JSON.parse(JSON.stringify(sessionToClone)),
        id: `s-${Math.random()}`,
        order: newWeeks[activeWeekIdx].sessions.length + 1,
        title: `${sessionToClone.title} (COPIA)`,
        exercises: sessionToClone.exercises.map(ex => ({ ...ex, id: `ex-${Math.random()}` }))
      });
      setWeeks(newWeeks);
    }
  };

  const addExerciseToSession = (sessionId: string) => {
    const newWeeks = [...weeks];
    const session = newWeeks[activeWeekIdx].sessions.find(s => s.id === sessionId);
    if (session) {
      session.exercises.push({ id: `ex-${Math.random()}`, name: "", sets: 3, reps: 10, method: "", notes: "" });
      setWeeks(newWeeks);
    }
  };

  const removeExercise = (sessionId: string, exerciseIdx: number) => {
    const newWeeks = [...weeks];
    const session = newWeeks[activeWeekIdx].sessions.find(s => s.id === sessionId);
    if (session) {
      session.exercises.splice(exerciseIdx, 1);
      setWeeks(newWeeks);
    }
  };

  const updateExercise = (sessionId: string, exerciseIdx: number, field: keyof Exercise, value: any) => {
    const newWeeks = [...weeks];
    const session = newWeeks[activeWeekIdx].sessions.find(s => s.id === sessionId);
    if (session) {
      session.exercises[exerciseIdx] = { ...session.exercises[exerciseIdx], [field]: value };
      setWeeks(newWeeks);
    }
  };

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    const newWeeks = [...weeks];
    const session = newWeeks[activeWeekIdx].sessions.find(s => s.id === sessionId);
    if (session) {
      session.title = newTitle;
      setWeeks(newWeeks);
    }
  };

  const deleteSession = (sessionId: string) => {
    if (currentWeek.sessions.length > 1) {
      const newWeeks = [...weeks];
      newWeeks[activeWeekIdx].sessions = newWeeks[activeWeekIdx].sessions.filter(s => s.id !== sessionId);
      setWeeks(newWeeks);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAthleteId) return;

    const existingProgram = programs.find(p => p.id === id);
    if (!existingProgram) return;

    const updatedProgram: Program = {
      ...existingProgram,
      title,
      athleteId: targetAthleteId,
      weeks: weeks.map((w, idx) => ({ ...w, order: idx + 1 })),
    };

    setIsSyncing(true);
    setTimeout(() => {
      updateProgram(updatedProgram);
      router.push("/programs");
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 pb-64 relative">
      <div className="scanline-overlay" />
      
      <AnimatePresence>
        {isSyncing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin glow-sm" />
            <div className="text-center space-y-2">
              <p className="text-2xl font-black uppercase italic tracking-tighter glow-blue">Sincronizzazione Modifiche</p>
              <p className="text-[10px] font-bold text-outline uppercase tracking-[0.4em] animate-pulse">Aggiornamento del registro centrale...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-surface-container hover:bg-primary hover:text-white transition-all">
          <MaterialIcon name="arrow_back" />
        </button>
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Revisione Protocollo</h2>
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Editor Pianificazione</p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-12">
        {/* CONFIG SECTION */}
        <section className="grid md:grid-cols-2 gap-8 bg-white p-8 border-l-4 border-blue-600 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-outline tracking-[0.2em] flex items-center gap-2">
               <MaterialIcon name="person" className="text-sm" /> Atleta
            </label>
            <select
              value={targetAthleteId}
              onChange={(e) => setTargetAthleteId(e.target.value)}
              className="w-full bg-surface-container/50 border-b-2 border-outline-variant px-4 py-3 font-black uppercase italic text-sm focus:border-blue-600 outline-none appearance-none transition-colors"
              required
            >
              <option value="">-- SELEZIONA --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-outline tracking-[0.2em] flex items-center gap-2">
               <MaterialIcon name="description" className="text-sm" /> Titolo Protocollo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container/50 border-b-2 border-outline-variant px-4 py-3 font-black uppercase italic text-sm focus:border-blue-600 outline-none transition-colors"
            />
          </div>
        </section>

        {/* TACTICAL STICKY BAR */}
        <div className="sticky top-16 z-30 space-y-4 bg-background/80 backdrop-blur-md pb-6 pt-2 -mx-4 px-4 border-b border-outline-variant">
           <div className="flex items-center justify-center gap-6">
              <button 
                type="button" 
                onClick={() => removeLastWeek()} 
                className="w-10 h-10 flex items-center justify-center bg-white hover:bg-error hover:text-white transition-all border border-outline-variant shadow-sm active:scale-90"
                title="Rimuovi Ultima Settimana"
              >
                <MaterialIcon name="remove" />
              </button>
              
              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black text-outline uppercase tracking-[0.4em]">Durata Ciclo</span>
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                   {weeks.length} SETTIMANE
                 </h3>
              </div>

              <button 
                type="button" 
                onClick={() => addWeek()} 
                className="w-10 h-10 flex items-center justify-center bg-white hover:bg-blue-600 hover:text-white transition-all border border-outline-variant shadow-sm active:scale-90"
                title="Aggiungi Settimana (Clona)"
              >
                <MaterialIcon name="add" />
              </button>
           </div>

           <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex justify-center gap-1 overflow-x-auto scrollbar-hide py-1">
                {weeks.map((w, idx) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setActiveWeekIdx(idx)}
                    className={cn(
                      "px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap min-w-[36px]",
                      activeWeekIdx === idx 
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg glow-blue" 
                        : "bg-white text-outline border-outline-variant hover:border-blue-600/50"
                    )}
                  >
                    S{idx + 1}
                  </button>
                ))}
              </div>
              
              <button 
                type="button" 
                onClick={() => addSessionToActiveWeek()} 
                className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-all shrink-0" 
                title="Aggiungi Sessione"
              >
                <MaterialIcon name="post_add" />
              </button>
           </div>
        </div>

        {/* SESSIONS AREA */}
        <div className="space-y-20">
          {currentWeek.sessions.map((session, sIdx) => (
            <motion.section 
              key={session.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between bg-surface-container/30 p-4 border border-outline-variant">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-white flex items-center justify-center font-black italic border border-outline-variant shadow-sm text-blue-600 text-2xl">
                    {String.fromCharCode(65 + sIdx)}
                  </div>
                  <div className="space-y-1 flex-1">
                    <input
                      type="text"
                      value={session.title}
                      onChange={(e) => updateSessionTitle(session.id, e.target.value)}
                      className="bg-transparent text-2xl font-black uppercase italic tracking-tighter w-full outline-none focus:text-blue-600 transition-colors"
                    />
                    <p className="text-[8px] font-black text-outline uppercase tracking-[0.4em]">ID Sessione: {session.id.substring(0,8).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cloneSession(session.id)}
                    className="w-10 h-10 flex items-center justify-center text-outline hover:text-blue-600 transition-colors border border-transparent hover:border-outline-variant"
                    title="Clona Sessione"
                  >
                    <MaterialIcon name="content_copy" className="text-xl" />
                  </button>
                  <button
                    type="button"
                    onClick={() => addExerciseToSession(session.id)}
                    className="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-600/5 hover:bg-blue-600 hover:text-white transition-all"
                    title="Aggiungi Esercizio"
                  >
                    <MaterialIcon name="add_circle_outline" className="text-xl" />
                  </button>
                  {currentWeek.sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteSession(session.id)}
                      className="w-10 h-10 flex items-center justify-center text-outline hover:text-error transition-colors"
                    >
                      <MaterialIcon name="close" />
                    </button>
                  )}
                </div>
              </div>

              <div className="data-grid-border overflow-x-auto bg-white shadow-xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-surface-container-low text-[9px] font-black uppercase tracking-[0.2em] text-outline border-b border-outline-variant">
                    <tr>
                      <th className="px-6 py-4 border-r border-outline-variant min-w-[240px]">Esercizio</th>
                      <th className="px-6 py-4 border-r border-outline-variant text-center w-24">Set</th>
                      <th className="px-6 py-4 border-r border-outline-variant text-center w-24">Rep</th>
                      <th className="px-6 py-4 border-r border-outline-variant min-w-[140px]">Metodologia</th>
                      <th className="px-6 py-4 border-r border-outline-variant text-center w-24">% 1RM</th>
                      <th className="px-6 py-4 min-w-[200px]">Note</th>
                      <th className="px-4 py-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    <AnimatePresence mode="popLayout">
                    {session.exercises.map((ex, exIdx) => (
                      <motion.tr 
                        key={ex.id || `${session.id}-${exIdx}`}
                        className="group hover:bg-surface-container-lowest transition-colors"
                      >
                        <td className="p-0 border-r border-outline-variant">
                          <input
                            type="text"
                            value={ex.name}
                            onChange={(e) => updateExercise(session.id, exIdx, 'name', e.target.value)}
                            className="w-full px-6 py-5 bg-transparent font-black uppercase italic text-sm outline-none focus:text-blue-600"
                          />
                        </td>
                        <td className="p-0 border-r border-outline-variant">
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => updateExercise(session.id, exIdx, 'sets', e.target.value)}
                            className="w-full px-6 py-5 bg-transparent text-center font-black text-sm outline-none"
                          />
                        </td>
                        <td className="p-0 border-r border-outline-variant">
                          <input
                            type="number"
                            value={ex.reps}
                            onChange={(e) => updateExercise(session.id, exIdx, 'reps', e.target.value)}
                            className="w-full px-6 py-5 bg-transparent text-center font-black text-sm outline-none"
                          />
                        </td>
                        <td className="p-0 border-r border-outline-variant">
                          <input
                            type="text"
                            value={ex.method}
                            onChange={(e) => updateExercise(session.id, exIdx, 'method', e.target.value)}
                            className="w-full px-6 py-5 bg-transparent font-bold uppercase tracking-widest outline-none text-[10px] text-outline"
                          />
                        </td>
                        <td className="p-0 border-r border-outline-variant">
                          <input
                            type="number"
                            value={ex.percentage}
                            onChange={(e) => updateExercise(session.id, exIdx, 'percentage', e.target.value)}
                            className="w-full px-6 py-5 bg-transparent text-center font-black italic outline-none text-blue-600"
                          />
                        </td>
                        <td className="p-0">
                          <input
                            type="text"
                            value={ex.notes}
                            onChange={(e) => updateExercise(session.id, exIdx, 'notes', e.target.value)}
                            className="w-full px-6 py-5 bg-transparent font-medium italic outline-none text-[10px] text-on-surface-variant/70"
                          />
                        </td>
                        <td className="p-0 text-center bg-surface-container-lowest">
                          <button 
                            type="button"
                            onClick={() => removeExercise(session.id, exIdx)}
                            className="w-full h-full flex items-center justify-center text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-all p-4"
                          >
                             <MaterialIcon name="delete_sweep" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.section>
          ))}
        </div>

        {/* FOOTER */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40">
          <motion.button
            type="submit"
            disabled={isSyncing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 text-white py-5 shadow-2xl border border-blue-600 glow-blue flex items-center justify-center gap-4 group"
          >
            <MaterialIcon name="sync_saved_locally" className="transition-transform group-hover:rotate-180 duration-500" />
            <span className="font-black uppercase tracking-[0.4em] text-sm">Sincronizza Protocollo</span>
          </motion.button>
        </div>
      </form>
    </div>
  );
}
