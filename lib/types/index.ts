export type UserRole = "coach" | "athlete";

export interface UserOneRM {
  exercise: string;
  value: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  oneRMs: UserOneRM[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  method?: string;
  notes?: string;
  percentage?: number;
  load?: number;
}

export interface Session {
  id: string;
  title: string;
  order: number;
  completed?: boolean;
  exercises: Exercise[];
}

export interface Week {
  id: string;
  order: number;
  completed?: boolean;
  sessions: Session[];
}

export interface Program {
  id: string;
  title: string;
  status?: 'active' | 'archived';
  coachId: string;
  athleteId?: string;
  athleteIds?: string[];
  weeks: Week[];
  createdAt: string;
  updatedAt?: string;
}
