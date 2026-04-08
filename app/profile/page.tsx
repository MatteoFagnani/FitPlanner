"use client";

import { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import MaterialIcon from "@/components/icons/MaterialIcon";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { currentUser, setUserOneRM, logout } = useStore();
  const router = useRouter();
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSaveMax = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExercise && editValue) {
      setUserOneRM(editingExercise, parseFloat(editValue));
      setEditingExercise(null);
      setEditValue("");
    }
  };

  const startEditing = (exercise: string, currentVal: number) => {
    setEditingExercise(exercise);
    setEditValue(currentVal.toString());
  };

  const personalMaxes = [
    { name: "Squat", icon: "fitness_center" },
    { name: "Panca Piana", icon: "horizontal_rule" },
    { name: "Stacco da Terra", icon: "vertical_align_bottom" },
    { name: "Overhead Press", icon: "vertical_align_top" },
  ];

  return (
    <div className="relative mx-auto max-w-3xl space-y-8 p-4 md:p-6">
      <div className="scanline-overlay" />

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <MaterialIcon name="account_circle" className="text-sm" />
          <h2 className="glow-blue text-[10px] font-black uppercase tracking-[0.4em]">
            Profilo Atleta
          </h2>
        </div>

        <div className="rounded-[2rem] border border-outline-variant/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container shadow-inner">
              <MaterialIcon name="person" className="text-3xl text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black italic leading-none tracking-tighter">
                {currentUser.name.toUpperCase()}
              </h3>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
                {currentUser.role === "coach" ? "Coach autorizzato" : "Atleta"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              Gestione 1RM
            </p>
            <p className="mt-1 text-sm font-medium text-outline">
              Aggiorna solo i tuoi massimali per mantenere corretti i carichi automatici.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-outline">
            Massimali Personali
          </h3>
          <MaterialIcon name="edit_note" className="text-xl text-primary" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {personalMaxes.map((max) => {
            const userVal = currentUser.oneRMs.find((rm) => rm.exercise === max.name)?.value || 0;
            const isEditing = editingExercise === max.name;

            return (
              <div
                key={max.name}
                className="group relative rounded-[1.75rem] border border-outline-variant/80 bg-white p-5 shadow-sm transition-colors hover:border-primary/40"
              >
                <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-outline">
                  {max.name.replace("Panca Piana", "PANCA").replace("Stacco da Terra", "STACCO")}
                </p>

                {isEditing ? (
                  <form onSubmit={handleSaveMax} className="flex gap-2">
                    <input
                      autoFocus
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full rounded-xl border border-primary bg-surface-container px-3 py-2 text-2xl font-black tabular-nums focus:outline-none glow-sm"
                    />
                    <button type="submit" className="rounded-xl bg-primary px-3 text-white shadow-lg">
                      <MaterialIcon name="done" className="text-sm" />
                    </button>
                  </form>
                ) : (
                  <div
                    onClick={() => startEditing(max.name, userVal)}
                    className="cursor-pointer transition-colors group-hover:bg-surface-container-low"
                  >
                    <p className="text-3xl font-black italic tracking-tighter tabular-nums">
                      {userVal.toFixed(1)}
                      <span className="ml-1 text-xs font-bold opacity-30">KG</span>
                    </p>
                  </div>
                )}

                <div className="absolute top-2 right-2 opacity-10 transition-opacity group-hover:opacity-100">
                  <MaterialIcon name={max.icon} className="text-xl" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pt-2">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center justify-center gap-3 rounded-[1.75rem] border border-error/30 bg-error/5 py-5 text-error shadow-sm transition-all hover:bg-error hover:text-white"
        >
          <MaterialIcon name="logout" className="transition-transform group-hover:translate-x-1" />
          <span className="text-sm font-black uppercase tracking-[0.3em]">Logout</span>
        </button>
      </section>
    </div>
  );
}
