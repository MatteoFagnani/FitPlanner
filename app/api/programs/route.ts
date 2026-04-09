import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Program } from "@/lib/types";
import { serializeProgram } from "@/lib/server/programs";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/server/auth";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const programs = await prisma.program.findMany({
    where: user.role === "coach" ? { coachId: user.id } : undefined,
    orderBy: { createdAt: "desc" },
  });

  const serializedPrograms = programs
    .map(serializeProgram)
    .filter((program) => {
      if (user.role === "coach") return true;

      return (
        (!program.status || program.status === "active") &&
        ((program.athleteIds && program.athleteIds.includes(user.id)) || program.athleteId === user.id)
      );
    });

  return NextResponse.json({ programs: serializedPrograms });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
      coachId: user.id,
      athleteIds: (program.athleteIds ?? (program.athleteId ? [program.athleteId] : [])) as unknown as Prisma.InputJsonValue,
      weeks: program.weeks as unknown as Prisma.InputJsonValue,
      createdAt: new Date(program.createdAt),
    },
  });

  return NextResponse.json({ program: serializeProgram(createdProgram) }, { status: 201 });
}
