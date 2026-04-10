export type UserRole = "coach" | "athlete";
export type PercentageReference = "oneRM" | "topSet";

export interface UserOneRM {
  exercise: string;
  value: number;
}

export interface User {
  id: number;
  name: string;
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
  percentageReference?: PercentageReference;
  load?: number;
  performedLoad?: number;
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
  id: number;
  title: string;
  status?: 'active' | 'archived';
  coachId: number;
  athleteId?: number;
  athleteIds?: number[];
  weeks: Week[];
  createdAt: string;
  updatedAt?: string;
}
