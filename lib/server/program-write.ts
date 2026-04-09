import { Prisma } from "@prisma/client";
import { Program } from "@/lib/types";
import { createProgramAthleteIds } from "@/lib/program-editor";

export function toProgramCreateInput(program: Program, coachId: string): Prisma.ProgramCreateInput {
  return {
    id: program.id,
    title: program.title,
    status: program.status ?? "active",
    coachId,
    athleteIds: createProgramAthleteIds(program) as unknown as Prisma.InputJsonValue,
    weeks: program.weeks as unknown as Prisma.InputJsonValue,
    createdAt: new Date(program.createdAt),
  };
}

export function toProgramUpdateInput(program: Program, coachId: string): Prisma.ProgramUpdateManyMutationInput {
  return {
    title: program.title,
    status: program.status ?? "active",
    coachId,
    athleteIds: createProgramAthleteIds(program) as unknown as Prisma.InputJsonValue,
    weeks: program.weeks as unknown as Prisma.InputJsonValue,
    createdAt: new Date(program.createdAt),
  };
}
