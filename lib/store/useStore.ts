import { create } from "zustand";
import { Program, User } from "../types";

function replaceProgram(programs: Program[], nextProgram: Program) {
  return programs.map((program) => (program.id === nextProgram.id ? nextProgram : program));
}

function upsertProgram(programs: Program[], nextProgram: Program) {
  return [nextProgram, ...programs.filter((program) => program.id !== nextProgram.id)];
}

function clearSessionState(set: (partial: Partial<FitPlannerState>) => void) {
  set({
    currentUser: null,
    programs: [],
    users: [],
    isProgramsHydrated: true,
    isAuthResolved: true,
  });
}

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
  removeUserOneRM: (exercise: string) => Promise<boolean>;
  hydrateCurrentUserFromDatabase: () => Promise<void>;
  hydrateUsersFromDatabase: () => Promise<void>;
  hydrateProgramsFromDatabase: () => Promise<void>;
  toggleSessionCompletion: (programId: string, weekId: string, sessionId: string) => Promise<boolean>;
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
        if (response.status === 401) {
          set({
            currentUser: null,
            programs: [],
            isProgramsHydrated: true,
            isAuthResolved: true,
            users: [],
          });
        } else {
          set({
            isProgramsHydrated: true,
            isAuthResolved: true,
          });
        }
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

    const previousCurrentUser = state.currentUser;
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
      set({ currentUser: previousCurrentUser });
      return false;
    }
  },

  removeUserOneRM: async (exercise) => {
    const state = get();
    if (!state.currentUser) return false;

    const previousCurrentUser = state.currentUser;
    set({
      currentUser: {
        ...previousCurrentUser,
        oneRMs: previousCurrentUser.oneRMs.filter((rm) => rm.exercise !== exercise),
      },
    });

    try {
      const response = await fetch("/api/profile/one-rm", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exercise }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete oneRM");
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
      console.error("Failed to delete oneRM", error);
      set({ currentUser: previousCurrentUser });
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
        if (response.status === 401) {
          set({ currentUser: null });
          return;
        }
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
        if (response.status === 401) {
          set({ currentUser: null, users: [] });
          return;
        }
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
        if (response.status === 401) {
          set({ currentUser: null, programs: [], isProgramsHydrated: true });
          return;
        }
        throw new Error("Failed to hydrate programs");
      }

      const data = await response.json();
      set({ programs: data.programs, isProgramsHydrated: true });
    } catch (error) {
      console.error("Failed to hydrate programs", error);
      set({ isProgramsHydrated: true });
    }
  },

  toggleSessionCompletion: async (programId, weekId, sessionId) => {
    const state = get();
    const existingProgram = state.programs.find((program) => program.id === programId);

    if (!existingProgram || !existingProgram.updatedAt) {
      return false;
    }

    const previousPrograms = state.programs;
    const updatedWeeks = existingProgram.weeks.map((week) => {
      if (week.id !== weekId) {
        return week;
      }

      const sessions = week.sessions.map((session) =>
        session.id === sessionId ? { ...session, completed: !session.completed } : session
      );

      return {
        ...week,
        sessions,
        completed: sessions.length > 0 && sessions.every((session) => session.completed),
      };
    });

    set({
      programs: state.programs.map((program) =>
        program.id === programId ? { ...program, weeks: updatedWeeks } : program
      ),
    });

    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "toggle-session-completion",
          weekId,
          sessionId,
          expectedUpdatedAt: existingProgram.updatedAt,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearSessionState(set);
          return false;
        }
        throw new Error("Failed to toggle session completion");
      }

      const data = await response.json();
      set((currentState) => ({
        programs: currentState.programs.map((program) =>
          program.id === data.program.id ? data.program : program
        ),
      }));

      return true;
    } catch (error) {
      console.error("Failed to toggle session completion", error);
      set({ programs: previousPrograms });
      await get().hydrateProgramsFromDatabase();
      return false;
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
        if (response.status === 401) {
          clearSessionState(set);
          return false;
        }
        throw new Error("Failed to create program");
      }

      const data = await response.json();
      set((state) => ({
        isProgramsHydrated: true,
        programs: upsertProgram(state.programs, data.program),
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
        if (response.status === 401) {
          clearSessionState(set);
          return false;
        }
        if (response.status === 409) {
          await get().hydrateProgramsFromDatabase();
          return false;
        }
        throw new Error("Failed to update program");
      }

      const data = await response.json();
      set((state) => ({
        isProgramsHydrated: true,
        programs: replaceProgram(state.programs, data.program),
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
        if (response.status === 401) {
          clearSessionState(set);
          return false;
        }
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
    const existingProgram = get().programs.find((program) => program.id === id);
    if (!existingProgram?.updatedAt) {
      return false;
    }

    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "archived", expectedUpdatedAt: existingProgram.updatedAt }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearSessionState(set);
          return false;
        }
        if (response.status === 409) {
          await get().hydrateProgramsFromDatabase();
          return false;
        }
        throw new Error("Failed to archive program");
      }

      const data = await response.json();
      set((state) => ({
        isProgramsHydrated: true,
        programs: replaceProgram(state.programs, data.program),
      }));
      return true;
    } catch (error) {
      console.error("Failed to archive program", error);
      return false;
    }
  },

  restoreProgram: async (id) => {
    const existingProgram = get().programs.find((program) => program.id === id);
    if (!existingProgram?.updatedAt) {
      return false;
    }

    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "active", expectedUpdatedAt: existingProgram.updatedAt }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearSessionState(set);
          return false;
        }
        if (response.status === 409) {
          await get().hydrateProgramsFromDatabase();
          return false;
        }
        throw new Error("Failed to restore program");
      }

      const data = await response.json();
      set((state) => ({
        isProgramsHydrated: true,
        programs: replaceProgram(state.programs, data.program),
      }));
      return true;
    } catch (error) {
      console.error("Failed to restore program", error);
      return false;
    }
  },
}));
