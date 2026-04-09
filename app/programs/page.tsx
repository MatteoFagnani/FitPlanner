"use client";

import { useStore } from "@/lib/store/useStore";
import MaterialIcon from "@/components/icons/MaterialIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import SystemModal from "@/components/ui/SystemModal";

export default function ProgramsPage() {
  const { currentUser, programs, deleteProgram, archiveProgram, restoreProgram } = useStore();
  const router = useRouter();
  const [showArchived, setShowArchived] = useState(false);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "danger" | "info";
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    confirmLabel: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (currentUser && currentUser.role !== "coach") {
      router.push("/");
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== "coach") return null;

  const activePrograms = programs.filter(p => !p.status || p.status === 'active');
  const archivedPrograms = programs.filter(p => p.status === 'archived');

  const confirmDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      type: "danger",
      title: "Conferma Eliminazione",
      message: "Attenzione: Tutti i dati del protocollo verranno eliminati permanentemente. Questa azione è irreversibile.",
      confirmLabel: "Elimina Protocollo",
      onConfirm: () => deleteProgram(id),
    });
  };

  const confirmArchive = (id: string) => {
    setModalConfig({
      isOpen: true,
      type: "info",
      title: "Conferma Archiviazione",
      message: "Spostare questo protocollo nell'archivio? Verrà nascosto dalla dashboard attiva dell'atleta.",
      confirmLabel: "Archivia",
      onConfirm: () => archiveProgram(id),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 pb-32 relative">
      <div className="scanline-overlay" />
      
      {/* Modals */}
      <SystemModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmLabel={modalConfig.confirmLabel}
      />

      <div className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-primary"
        >
          <MaterialIcon name="admin_panel_settings" filled />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Dashboard Coach
          </span>
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-extrabold tracking-tighter uppercase italic leading-none sm:text-4xl"
        >
          Gestione
        </motion.h2>
        <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
          <div className="rounded-2xl border border-outline-variant/80 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
              Attivi
            </p>
            <p className="mt-2 text-2xl font-black tracking-tight text-on-surface">
              {activePrograms.length}
            </p>
          </div>
          <div className="rounded-2xl border border-outline-variant/80 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
              Archivio
            </p>
            <p className="mt-2 text-2xl font-black tracking-tight text-on-surface">
              {archivedPrograms.length}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { 
            label: "Nuovo Programma", 
            desc: "Crea e assegna un nuovo protocollo", 
            icon: "add_box", 
            color: "text-blue-600", 
            href: "/programs/new",
            type: "link"
          },
          { 
            label: "Atleti Attivi", 
            desc: `${activePrograms.length} protocolli sincronizzati`, 
            icon: "groups", 
            color: "text-secondary",
            type: "stat"
          }
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
          >
            {item.type === "link" ? (
              <Link href={item.href!} className="group block h-full rounded-[1.75rem] border border-outline-variant/80 bg-surface-container-lowest p-6 shadow-sm transition-all hover:border-primary/30 hover:bg-surface-container-low hover:shadow-md">
                <MaterialIcon name={item.icon} className={cn("text-3xl mb-3 transition-transform group-hover:scale-110", item.color)} />
                <h3 className="text-xl font-black uppercase italic tracking-tighter">{item.label}</h3>
                <p className="text-[10px] text-outline mt-1 font-bold uppercase tracking-widest">{item.desc}</p>
              </Link>
            ) : (
              <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-outline-variant/80 bg-surface-container-lowest p-6 shadow-sm">
                <MaterialIcon name={item.icon} className={cn("text-3xl mb-3", item.color)} />
                <h3 className="text-xl font-black uppercase italic tracking-tighter">{item.label}</h3>
                <p className="text-[10px] text-outline mt-1 font-bold uppercase tracking-widest">{item.desc}</p>
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <MaterialIcon name={item.icon} className="text-6xl" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Active Protocols List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-outline">
            Protocolli Attivi
          </h3>
          <span className="text-[9px] font-black text-primary bg-primary/10 px-3 py-1 italic">
            {activePrograms.length} REGISTRI ATTIVI
          </span>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {activePrograms.map((prog, idx) => (
              <motion.div 
                key={prog.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.1 * idx }}
                className="group relative"
              >
                <div className="flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-outline-variant/80 bg-white shadow-sm transition-colors hover:border-blue-600 md:flex-row md:items-center">
                  <Link 
                    href={`/programs/edit/${prog.id}`}
                    className="flex-1 p-5 flex flex-col gap-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                       <p className="text-base font-black uppercase text-blue-600 italic tracking-tighter glow-blue leading-none sm:text-lg">
                        {prog.title}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-4">
                       <p className="text-[9px] text-outline font-bold uppercase tracking-widest">
                        ID: {prog.id.substring(0, 8)} | VERSIONE 01
                      </p>
                      <p className="text-[9px] text-outline/60 font-bold uppercase tracking-widest">
                        CREATO: {new Date(prog.createdAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-outline">
                      Condiviso con {prog.athleteIds?.length || (prog.athleteId ? 1 : 0)} utenti
                    </p>
                  </Link>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-1 border-t border-outline-variant/30 bg-surface-container-lowest p-2 md:border-l md:border-t-0 md:p-5">
                    <button 
                      onClick={() => confirmArchive(prog.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-outline transition-all hover:bg-blue-50 hover:text-blue-600"
                      title="Archivia"
                    >
                      <MaterialIcon name="inventory_2" className="text-xl" />
                    </button>
                    <button 
                      onClick={() => confirmDelete(prog.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-outline transition-all hover:bg-error/10 hover:text-error"
                      title="Elimina"
                    >
                      <MaterialIcon name="delete" className="text-xl" />
                    </button>
                    <Link 
                      href={`/programs/edit/${prog.id}`}
                      className="ml-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary transition-all hover:bg-primary hover:text-white"
                      title="Modifica"
                    >
                      <MaterialIcon name="edit" className="text-xl" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {activePrograms.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-outline-variant bg-surface-container-lowest opacity-50">
               <MaterialIcon name="database" className="text-4xl text-outline-variant mb-3" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">Archivio Vuoto</p>
            </div>
          )}
        </div>
      </div>

      {/* Archive Section */}
      <div className="space-y-4 pt-8">
        <button 
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-outline/40 hover:text-outline transition-all group"
        >
          <MaterialIcon name={showArchived ? "keyboard_arrow_up" : "keyboard_arrow_down"} className={cn("text-lg transition-transform", showArchived && "text-primary")} />
          <span>{showArchived ? "Nascondi Archivio" : `Visualizza Archivio (${archivedPrograms.length})`}</span>
        </button>

        <AnimatePresence>
          {showArchived && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {archivedPrograms.length === 0 && (
                <p className="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-outline/30 border border-dashed border-outline-variant">Nessun protocollo archiviato</p>
              )}
              {archivedPrograms.map(prog => (
                <div key={prog.id} className="flex items-center justify-between rounded-[1.5rem] border border-outline-variant/80 bg-surface-container-lowest p-4 opacity-50 transition-opacity group hover:opacity-100">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase text-outline line-through opacity-70">
                      {prog.title}
                    </p>
                    <p className="text-[9px] text-outline/50 font-black uppercase tracking-tighter">
                      Archiviato | {new Date(prog.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => restoreProgram(prog.id)}
                      className="w-9 h-9 flex items-center justify-center text-outline hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                      title="Ripristina"
                    >
                      <MaterialIcon name="unarchive" className="text-lg" />
                    </button>
                    <button 
                      onClick={() => confirmDelete(prog.id)}
                      className="w-9 h-9 flex items-center justify-center text-outline hover:text-error hover:bg-error/10 transition-all border border-transparent hover:border-error/20"
                      title="Elimina"
                    >
                      <MaterialIcon name="delete" className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
