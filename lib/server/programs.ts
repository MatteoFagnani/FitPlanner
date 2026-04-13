import { Prisma } from "@prisma/client";
import { Program, Week } from "@/lib/types";
import {
  applyUserProgramProgress,
  getEmptyUserProgramProgress,
  parseUserProgramProgress,
} from "@/lib/server/program-progress";

function isNumberArray(value: Prisma.JsonValue | null | undefined): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function parseWeeks(value: Prisma.JsonValue | null | undefined): Week[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as unknown as Week[];
}

export function serializeProgram(program: {
  id: number;
  title: string;
  status: string;
  coachId: number;
  athleteIds: Prisma.JsonValue;
  weeks: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}, progress?: {
  completedSessionIds: Prisma.JsonValue | null;
  performedLoads: Prisma.JsonValue | null;
} | null): Program {
  const baseWeeks = parseWeeks(program.weeks);
  const userProgress = progress ? parseUserProgramProgress(progress) : getEmptyUserProgramProgress();

  return {
    id: program.id,
    title: program.title,
    status: program.status as Program["status"],
    coachId: program.coachId,
    athleteIds: isNumberArray(program.athleteIds) ? program.athleteIds : [],
    weeks: applyUserProgramProgress(baseWeeks, userProgress),
    createdAt: program.createdAt.toISOString(),
    updatedAt: program.updatedAt.toISOString(),
  };
}
