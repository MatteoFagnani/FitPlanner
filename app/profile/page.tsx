"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store/useStore";
import MaterialIcon from "@/components/icons/MaterialIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { changePassword } from "@/lib/client/profile";
import { ApiError } from "@/lib/client/http";

export default function ProfilePage() {
  const { currentUser, setUserOneRM, removeUserOneRM, hydrateCurrentUserFromDatabase, logout } =
    useStore();
  const router = useRouter();
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newExercise, setNewExercise] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRemovingExercise, setIsRemovingExercise] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (currentUser?.id) {
      void hydrateCurrentUserFromDatabase();
    }
  }, [currentUser?.id, hydrateCurrentUserFromDatabase]);

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleSaveMax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExercise && editValue) {
      setIsSaving(true);
      const success = await setUserOneRM(editingExercise, parseFloat(editValue));
      setIsSaving(false);

      if (success) {
        setEditingExercise(null);
        setEditValue("");
      }
    }
  };

  const handleCreateMax = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedExercise = newExercise.trim();
    const parsedValue = parseFloat(newValue);

    if (!normalizedExercise || Number.isNaN(parsedValue)) {
      return;
    }

    setIsSaving(true);
    const success = await setUserOneRM(normalizedExercise, parsedValue);
    setIsSaving(false);

    if (success) {
      setNewExercise("");
      setNewValue("");
    }
  };

  const handleRemoveMax = async (exercise: string) => {
    setIsRemovingExercise(exercise);
    await removeUserOneRM(exercise);
    setIsRemovingExercise(null);
  };

  const startEditing = (exercise: string, currentVal: number) => {
    setEditingExercise(exercise);
    setEditValue(currentVal.toString());
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !nextPassword || !confirmPassword) {
      setPasswordError("Compila tutti i campi password.");
      return;
    }

    if (nextPassword.length < 8) {
      setPasswordError("La nuova password deve avere almeno 8 caratteri.");
      return;
    }

    if (nextPassword !== confirmPassword) {
      setPasswordError("Le nuove password non coincidono.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(currentPassword, nextPassword);
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password aggiornata correttamente.");
    } catch (error) {
      setPasswordError(
        error instanceof ApiError ? error.message : "Non sono riuscito ad aggiornare la password."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const personalMaxes = [...currentUser.oneRMs].sort((left, right) =>
    left.exercise.localeCompare(right.exercise)
  );

  return (
    <div className="relative mx-auto max-w-3xl space-y-8 p-4 md:p-6">
      <div className="scanline-overlay" />

      <section className="space-y-4">
        <div className="flex items-center">
          <Link
            href="/"
            aria-label="Torna alla schermata allenamento"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-outline-variant/80 bg-white text-primary shadow-sm transition-colors hover:bg-primary hover:text-white"
          >
            <MaterialIcon name="arrow_back" className="text-lg" />
          </Link>
        </div>
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

        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-outline">
            Massimali Personali
          </h3>
          <MaterialIcon name="edit_note" className="text-xl text-primary" />
        </div>

        <form
          onSubmit={handleCreateMax}
          className="mb-4 grid grid-cols-1 gap-3 rounded-[1.75rem] border border-outline-variant/80 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_8rem]"
        >
          <input
            type="text"
            value={newExercise}
            onChange={(e) => setNewExercise(e.target.value)}
            placeholder="Nuovo esercizio"
            className="rounded-2xl border border-outline-variant/80 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface outline-none placeholder:text-outline/50 focus:border-primary"
          />
          <input
            type="number"
            min="0"
            step="0.5"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="1RM kg"
            className="rounded-2xl border border-outline-variant/80 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface outline-none placeholder:text-outline/50 focus:border-primary"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-sm disabled:opacity-60 sm:col-span-2"
          >
            <MaterialIcon name="add" className="text-base" />
            Aggiungi Massimale
          </button>
        </form>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {personalMaxes.map((max) => {
            const isEditing = editingExercise === max.exercise;

            return (
              <div
                key={max.exercise}
                className="group rounded-[1.75rem] border border-outline-variant/80 bg-white p-5 shadow-sm transition-colors hover:border-primary/40"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="min-w-0 text-[9px] font-black uppercase tracking-widest text-outline">
                    {max.exercise}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveMax(max.exercise)}
                    disabled={isRemovingExercise === max.exercise}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-error/20 bg-error/5 text-error transition-colors hover:bg-error hover:text-white disabled:opacity-50"
                  >
                    <MaterialIcon name="delete" className="text-base" />
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveMax} className="flex gap-2">
                    <input
                      autoFocus
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full rounded-xl border border-primary bg-surface-container px-3 py-2 text-2xl font-black tabular-nums focus:outline-none glow-sm"
                    />
                    <button type="submit" disabled={isSaving} className="rounded-xl bg-primary px-3 text-white shadow-lg disabled:opacity-60">
                      <MaterialIcon name="done" className="text-sm" />
                    </button>
                  </form>
                ) : (
                  <div
                    onClick={() => startEditing(max.exercise, max.value)}
                    className="cursor-pointer transition-colors group-hover:bg-surface-container-low"
                  >
                    <p className="text-3xl font-black italic tracking-tighter tabular-nums">
                      {max.value.toFixed(1)}
                      <span className="ml-1 text-xs font-bold opacity-30">KG</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {personalMaxes.length === 0 && (
          <div className="rounded-[1.75rem] border border-dashed border-outline-variant bg-surface-container-lowest px-4 py-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-outline">
              Nessun massimale inserito
            </p>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-outline">
            Password
          </h3>
          <MaterialIcon name="lock" className="text-xl text-primary" />
        </div>

        <form
          onSubmit={handleChangePassword}
          className="space-y-3 rounded-[1.75rem] border border-outline-variant/80 bg-white p-4 shadow-sm"
        >
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Password attuale"
            className="w-full rounded-2xl border border-outline-variant/80 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface outline-none placeholder:text-outline/50 focus:border-primary"
          />
          <input
            type="password"
            value={nextPassword}
            onChange={(event) => setNextPassword(event.target.value)}
            placeholder="Nuova password"
            className="w-full rounded-2xl border border-outline-variant/80 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface outline-none placeholder:text-outline/50 focus:border-primary"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Conferma nuova password"
            className="w-full rounded-2xl border border-outline-variant/80 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface outline-none placeholder:text-outline/50 focus:border-primary"
          />

          {passwordError ? (
            <p className="text-xs font-semibold text-error">{passwordError}</p>
          ) : null}

          {passwordSuccess ? (
            <p className="text-xs font-semibold text-primary">{passwordSuccess}</p>
          ) : null}

          <button
            type="submit"
            disabled={isChangingPassword}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-sm disabled:opacity-60"
          >
            <MaterialIcon
              name={isChangingPassword ? "progress_activity" : "key"}
              className={isChangingPassword ? "animate-spin text-base" : "text-base"}
            />
            Aggiorna Password
          </button>
        </form>
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
