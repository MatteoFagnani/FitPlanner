import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Program } from "@/lib/types";
import { serializeProgram } from "@/lib/server/programs";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const role = searchParams.get("role");

  if (!userId || !role) {
    return NextResponse.json({ error: "Missing user context" }, { status: 400 });
  }

  const programs = await prisma.program.findMany({
    where: role === "coach" ? { coachId: userId } : undefined,
    orderBy: { createdAt: "desc" },
  });

  const serializedPrograms = programs
    .map(serializeProgram)
    .filter((program) => {
      if (role === "coach") return true;

      return (
        (!program.status || program.status === "active") &&
        ((program.athleteIds && program.athleteIds.includes(userId)) || program.athleteId === userId)
      );
    });

  return NextResponse.json({ programs: serializedPrograms });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { program?: Program };
  const program = body.program;

  if (!program) {
    return NextResponse.json({ error: "Program is required" }, { status: 400 });
  }

  const createdProgram = await prisma.program.create({
    data: {
      id: program.id,
      title: program.title,
      status: program.status ?? "active",
      coachId: program.coachId,
      athleteIds: (program.athleteIds ?? (program.athleteId ? [program.athleteId] : [])) as unknown as Prisma.InputJsonValue,
      weeks: program.weeks as unknown as Prisma.InputJsonValue,
      createdAt: new Date(program.createdAt),
    },
  });

  return NextResponse.json({ program: serializeProgram(createdProgram) }, { status: 201 });
}
