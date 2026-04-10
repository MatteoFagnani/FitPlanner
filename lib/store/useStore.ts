import { create } from "zustand";
import { Program, User } from "../types";
import { ApiError } from "@/lib/client/http";
import { fetchSession, loginRequest, logoutRequest } from "@/lib/client/auth";
import { deleteOneRM, fetchProfile, saveOneRM } from "@/lib/client/profile";
import {
  createProgramRequest,
  deleteProgramRequest,
  fetchPrograms,
  fetchUsers,
  patchProgramStatusRequest,
  toggleProgramSessionCompletionRequest,
  updateExerciseLoadRequest,
  updateProgramRequest,
} from "@/lib/client/programs";

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
  toggleSessionCompletion: (programId: number, weekId: string, sessionId: string) => Promise<boolean>;
  updateExerciseLoad: (
    programId: number,
    weekId: string,
    sessionId: string,
    exerciseId: string,
    performedLoad: number | null
  ) => Promise<boolean>;
  addProgram: (program: Program) => Promise<boolean>;
  updateProgram: (program: Program) => Promise<boolean>;
  deleteProgram: (id: number) => Promise<boolean>;
  archiveProgram: (id: number) => Promise<boolean>;
  restoreProgram: (id: number) => Promise<boolean>;
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
      const data = await fetchSession();
      set({
        currentUser: data.user,
        isAuthResolved: true,
      });

      await get().hydrateProgramsFromDatabase();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionState(set);
        return;
      }

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
      const data = await loginRequest(identity, password);
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
      await logoutRequest();
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
      const data = await saveOneRM(exercise, value);
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
      const data = await deleteOneRM(exercise);
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
      const data = await fetchProfile();
      set({
        currentUser: data.user,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({ currentUser: null });
        return;
      }
      console.error("Failed to hydrate current user", error);
    }
  },

  hydrateUsersFromDatabase: async () => {
    try {
      const data = await fetchUsers();
      set({
        users: data.users,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({ currentUser: null, users: [] });
        return;
      }
      console.error("Failed to hydrate users", error);
    }
  },

  hydrateProgramsFromDatabase: async () => {
    if (!get().currentUser) {
      set({ programs: [], isProgramsHydrated: true });
      return;
    }

    try {
      const data = await fetchPrograms();
      set({ programs: data.programs, isProgramsHydrated: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({ currentUser: null, programs: [], isProgramsHydrated: true });
        return;
      }
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
      const data = await toggleProgramSessionCompletionRequest(
        programId,
        weekId,
        sessionId,
        existingProgram.updatedAt
      );
      set((currentState) => ({
        programs: currentState.programs.map((program) =>
          program.id === data.program.id ? data.program : program
        ),
      }));

      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionState(set);
        return false;
      }
      console.error("Failed to toggle session completion", error);
      set({ programs: previousPrograms });
      await get().hydrateProgramsFromDatabase();
      return false;
    }
  },

  updateExerciseLoad: async (programId, weekId, sessionId, exerciseId, performedLoad) => {
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

      return {
        ...week,
        sessions: week.sessions.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }

          return {
            ...session,
            exercises: session.exercises.map((exercise) =>
              exercise.id === exerciseId ? { ...exercise, performedLoad: performedLoad ?? undefined } : exercise
            ),
          };
        }),
      };
    });

    set({
      programs: state.programs.map((program) =>
        program.id === programId ? { ...program, weeks: updatedWeeks } : program
      ),
    });

    try {
      const data = await updateExerciseLoadRequest(
        programId,
        weekId,
        sessionId,
        exerciseId,
        performedLoad,
        existingProgram.updatedAt
      );

      set((currentState) => ({
        programs: currentState.programs.map((program) =>
          program.id === data.program.id ? data.program : program
        ),
      }));

      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionState(set);
        return false;
      }
      console.error("Failed to update exercise load", error);
      set({ programs: previousPrograms });
      await get().hydrateProgramsFromDatabase();
      return false;
    }
  },

  addProgram: async (program) => {
    try {
      const data = await createProgramRequest(program);
      set((state) => ({
        isProgramsHydrated: true,
        programs: upsertProgram(state.programs, data.program),
      }));
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionState(set);
        return false;
      }
      console.error("Failed to create program", error);
      return false;
    }
  },

  updateProgram: async (program) => {
    try {
      const data = await updateProgramRequest(program);
      set((state) => ({
        isProgramsHydrated: true,
        programs: replaceProgram(state.programs, data.program),
      }));
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionState(set);
        return false;
      }
      if (error instanceof ApiError && error.status === 409) {
        await get().hydrateProgramsFromDatabase();
        return false;
      }
      console.error("Failed to update program", error);
      return false;
    }
  },

  deleteProgram: async (id) => {
    try {
      await deleteProgramRequest(id);

      set((state) => ({
        isProgramsHydrated: true,
        programs: state.programs.filter((program) => program.id !== id),
      }));
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionState(set);
        return false;
      }
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
      const data = await patchProgramStatusRequest(id, "archived", existingProgram.updatedAt);
      set((state) => ({
        isProgramsHydrated: true,
        programs: replaceProgram(state.programs, data.program),
      }));
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionState(set);
        return false;
      }
      if (error instanceof ApiError && error.status === 409) {
        await get().hydrateProgramsFromDatabase();
        return false;
      }
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
      const data = await patchProgramStatusRequest(id, "active", existingProgram.updatedAt);
      set((state) => ({
        isProgramsHydrated: true,
        programs: replaceProgram(state.programs, data.program),
      }));
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSessionState(set);
        return false;
      }
      if (error instanceof ApiError && error.status === 409) {
        await get().hydrateProgramsFromDatabase();
        return false;
      }
      console.error("Failed to restore program", error);
      return false;
    }
  },
}));
