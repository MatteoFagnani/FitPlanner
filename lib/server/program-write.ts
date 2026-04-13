import { Prisma } from "@prisma/client";
import { Program } from "@/lib/types";
import { createProgramAthleteIds } from "@/lib/program-editor";
import { sanitizeWeeksForStorage } from "@/lib/server/program-progress";

export function toProgramCreateInput(program: Program, coachId: number): Prisma.ProgramUncheckedCreateInput {
  return {
    title: program.title,
    status: program.status ?? "active",
    coachId,
    athleteIds: createProgramAthleteIds(program) as unknown as Prisma.InputJsonValue,
    weeks: sanitizeWeeksForStorage(program.weeks) as unknown as Prisma.InputJsonValue,
    createdAt: new Date(program.createdAt),
  };
}

export function toProgramUpdateInput(program: Program, coachId: number): Prisma.ProgramUncheckedUpdateInput {
  return {
    title: program.title,
    status: program.status ?? "active",
    coachId,
    athleteIds: createProgramAthleteIds(program) as unknown as Prisma.InputJsonValue,
    weeks: sanitizeWeeksForStorage(program.weeks) as unknown as Prisma.InputJsonValue,
    createdAt: new Date(program.createdAt),
  };
}
