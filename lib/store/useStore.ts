import { create } from "zustand";
import { Program, User } from "../types";

interface FitPlannerState {
  isAuthResolved: boolean;
  currentUser: User | null;
  programs: Program[];
  isProgramsHydrated: boolean;
  users: User[];
  initializeSession: () => Promise<void>;
  login: (identity: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUserOneRM: (exercise: string, value: number) => Promise<boolean>;
  hydrateCurrentUserFromDatabase: () => Promise<void>;
  hydrateUsersFromDatabase: () => Promise<void>;
  hydrateProgramsFromDatabase: () => Promise<void>;
  addProgram: (program: Program) => Promise<boolean>;
  updateProgram: (program: Program) => Promise<boolean>;
  deleteProgram: (id: string) => Promise<boolean>;
  archiveProgram: (id: string) => Promise<boolean>;
  restoreProgram: (id: string) => Promise<boolean>;
}

export const useStore = create<FitPlannerState>()((set, get) => ({
  isAuthResolved: false,
  currentUser: null,
  programs: [],
  isProgramsHydrated: false,
  users: [],

  initializeSession: async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("fitplanner-storage");
    }

    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        set({
          currentUser: null,
          programs: [],
          isProgramsHydrated: true,
          isAuthResolved: true,
          users: [],
        });
        return;
      }

      const data = await response.json();
      set({
        currentUser: data.user,
        isAuthResolved: true,
      });

      await get().hydrateProgramsFromDatabase();
    } catch (error) {
      console.error("Failed to initialize session", error);
      set({
        currentUser: null,
        programs: [],
        isProgramsHydrated: true,
        isAuthResolved: true,
      });
    }
  },

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
      set({
        currentUser: data.user,
        isAuthResolved: true,
      });

      await get().hydrateProgramsFromDatabase();
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("fitplanner-storage");
      }

      set({
        currentUser: null,
        programs: [],
        isProgramsHydrated: false,
        users: [],
        isAuthResolved: true,
      });
    }
  },

  setUserOneRM: async (exercise, value) => {
    const state = get();
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
        body: JSON.stringify({ exercise, value }),
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
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to hydrate user");
      }

      const data = await response.json();
      set({
        currentUser: data.user,
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

  hydrateProgramsFromDatabase: async () => {
    if (!get().currentUser) {
      set({ programs: [], isProgramsHydrated: true });
      return;
    }

    try {
      const response = await fetch("/api/programs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to hydrate programs");
      }

      const data = await response.json();
      set({ programs: data.programs, isProgramsHydrated: true });
    } catch (error) {
      console.error("Failed to hydrate programs", error);
      set({ isProgramsHydrated: true });
    }
  },

  addProgram: async (program) => {
    try {
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          program: { ...program, status: program.status ?? "active" },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create program");
      }

      const data = await response.json();
      set((state) => ({
        isProgramsHydrated: true,
        programs: [data.program, ...state.programs.filter((item) => item.id !== data.program.id)],
      }));
      return true;
    } catch (error) {
      console.error("Failed to create program", error);
      return false;
    }
  },

  updateProgram: async (program) => {
    try {
      const response = await fetch(`/api/programs/${program.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ program }),
      });

      if (!response.ok) {
        throw new Error("Failed to update program");
      }

      const data = await response.json();
      set((state) => ({
        isProgramsHydrated: true,
        programs: state.programs.map((item) => (item.id === data.program.id ? data.program : item)),
      }));
      return true;
    } catch (error) {
      console.error("Failed to update program", error);
      return false;
    }
  },

  deleteProgram: async (id) => {
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete program");
      }

      set((state) => ({
        isProgramsHydrated: true,
        programs: state.programs.filter((program) => program.id !== id),
      }));
      return true;
    } catch (error) {
      console.error("Failed to delete program", error);
      return false;
    }
  },

  archiveProgram: async (id) => {
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "archived" }),
      });

      if (!response.ok) {
        throw new Error("Failed to archive program");
      }

      const data = await response.json();
      set((state) => ({
        isProgramsHydrated: true,
        programs: state.programs.map((program) => (program.id === data.program.id ? data.program : program)),
      }));
      return true;
    } catch (error) {
      console.error("Failed to archive program", error);
      return false;
    }
  },

  restoreProgram: async (id) => {
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "active" }),
      });

      if (!response.ok) {
        throw new Error("Failed to restore program");
      }

      const data = await response.json();
      set((state) => ({
        isProgramsHydrated: true,
        programs: state.programs.map((program) => (program.id === data.program.id ? data.program : program)),
      }));
      return true;
    } catch (error) {
      console.error("Failed to restore program", error);
      return false;
    }
  },
}));
