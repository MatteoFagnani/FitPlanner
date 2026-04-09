import { Prisma } from "@prisma/client";
import { Program, Week } from "@/lib/types";

function isStringArray(value: Prisma.JsonValue | null | undefined): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isWeeksArray(value: Prisma.JsonValue | null | undefined): value is Week[] {
  return Array.isArray(value);
}

export function serializeProgram(program: {
  id: string;
  title: string;
  status: string;
  coachId: string;
  athleteIds: Prisma.JsonValue;
  weeks: Prisma.JsonValue;
  createdAt: Date;
}): Program {
  return {
    id: program.id,
    title: program.title,
    status: program.status as Program["status"],
    coachId: program.coachId,
    athleteIds: isStringArray(program.athleteIds) ? program.athleteIds : [],
    weeks: isWeeksArray(program.weeks) ? program.weeks : [],
    createdAt: program.createdAt.toISOString(),
  };
}
