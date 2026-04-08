import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Program, User, UserOneRM } from "../types";
import { MOCK_PROGRAMS, MOCK_USERS } from "../mockData";

interface FitPlannerState {
  currentUser: User | null;
  programs: Program[];
  users: User[];
  
  // Actions
  login: (identity: string, password: string) => boolean;
  logout: () => void;
  setUserOneRM: (exercise: string, value: number) => void;
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
      programs: MOCK_PROGRAMS,
      users: MOCK_USERS,

      login: (identity, password) => {
        const user = MOCK_USERS.find(u => 
          (u.email === identity || u.name === identity) && 
          u.password === password
        );
        
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null }),

      setUserOneRM: (exercise, value) => set((state) => {
        if (!state.currentUser) return state;
        
        const existingIndex = state.currentUser.oneRMs.findIndex(rm => rm.exercise === exercise);
        const newOneRMs = [...state.currentUser.oneRMs];
        
        if (existingIndex >= 0) {
          newOneRMs[existingIndex] = { exercise, value };
        } else {
          newOneRMs.push({ exercise, value });
        }

        return {
          currentUser: {
            ...state.currentUser,
            oneRMs: newOneRMs
          }
        };
      }),

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
