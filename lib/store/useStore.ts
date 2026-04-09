import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Program, User } from "../types";

interface FitPlannerState {
  currentUser: User | null;
  programs: Program[];
  users: User[];
  
  // Actions
  login: (identity: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUserOneRM: (exercise: string, value: number) => Promise<boolean>;
  hydrateCurrentUserFromDatabase: () => Promise<void>;
  hydrateUsersFromDatabase: () => Promise<void>;
  addProgram: (program: Program) => void;
  updateProgram: (program: Program) => void;
  deleteProgram: (id: string) => void;
  archiveProgram: (id: string) => void;
  restoreProgram: (id: string) => void;
}

export const useStore = create<FitPlannerState>()(
  persist(
    (set) => ({
      currentUser: null,
      programs: [],
      users: [],

      login: async (identity, password) => {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ identity, password }),
          });

          if (!response.ok) {
            return false;
          }

          const data = await response.json();
          set({ currentUser: data.user });
          return true;
        } catch (error) {
          console.error("Login failed", error);
          return false;
        }
      },

      logout: () => set({ currentUser: null }),

      setUserOneRM: async (exercise, value) => {
        const state = useStore.getState();
        if (!state.currentUser) return false;

        const existingIndex = state.currentUser.oneRMs.findIndex((rm) => rm.exercise === exercise);
        const newOneRMs = [...state.currentUser.oneRMs];

        if (existingIndex >= 0) {
          newOneRMs[existingIndex] = { exercise, value };
        } else {
          newOneRMs.push({ exercise, value });
        }

        set({
          currentUser: {
            ...state.currentUser,
            oneRMs: newOneRMs,
          },
        });

        try {
          const response = await fetch("/api/profile/one-rm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: state.currentUser,
              exercise,
              value,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to persist oneRM");
          }

          const data = await response.json();
          set((currentState) => ({
            currentUser: currentState.currentUser
              ? {
                  ...currentState.currentUser,
                  oneRMs: data.oneRMs,
                }
              : null,
          }));

          return true;
        } catch (error) {
          console.error("Failed to save oneRM", error);
          return false;
        }
      },

      hydrateCurrentUserFromDatabase: async () => {
        const state = useStore.getState();
        if (!state.currentUser) return;

        try {
          const response = await fetch("/api/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: state.currentUser,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to hydrate user");
          }

          const data = await response.json();
          set({
            currentUser: {
              ...state.currentUser,
              ...data.user,
              password: state.currentUser.password,
            },
          });
        } catch (error) {
          console.error("Failed to hydrate current user", error);
        }
      },

      hydrateUsersFromDatabase: async () => {
        try {
          const response = await fetch("/api/users", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to hydrate users");
          }

          const data = await response.json();
          set({
            users: data.users,
          });
        } catch (error) {
          console.error("Failed to hydrate users", error);
        }
      },

      addProgram: (program) => set((state) => ({
        programs: [...state.programs, { ...program, status: 'active' }]
      })),

      updateProgram: (program) => set((state) => ({
        programs: state.programs.map(p => p.id === program.id ? program : p)
      })),

      deleteProgram: (id) => set((state) => ({
        programs: state.programs.filter(p => p.id !== id)
      })),
      
      archiveProgram: (id: string) => set((state) => ({
        programs: state.programs.map(p => p.id === id ? { ...p, status: 'archived' } : p)
      })),

      restoreProgram: (id: string) => set((state) => ({
        programs: state.programs.map(p => p.id === id ? { ...p, status: 'active' } : p)
      })),
    }),
    {
      name: "fitplanner-storage",
    }
  )
);
