import { Prisma } from "@prisma/client";
import { Program, Week } from "@/lib/types";

function isNumberArray(value: Prisma.JsonValue | null | undefined): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function parseWeeks(value: Prisma.JsonValue | null | undefined): Week[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return (value as unknown as Week[]).map((week) => {
    const sessions = (week.sessions ?? []).map((session) => ({
      ...session,
      completed: Boolean(session.completed),
    }));

    return {
      ...week,
      sessions,
      completed: sessions.length > 0 && sessions.every((session) => session.completed),
    };
  });
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
}): Program {
  return {
    id: program.id,
    title: program.title,
    status: program.status as Program["status"],
    coachId: program.coachId,
    athleteIds: isNumberArray(program.athleteIds) ? program.athleteIds : [],
    weeks: parseWeeks(program.weeks),
    createdAt: program.createdAt.toISOString(),
    updatedAt: program.updatedAt.toISOString(),
  };
}
