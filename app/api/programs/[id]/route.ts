import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Program } from "@/lib/types";
import { serializeProgram } from "@/lib/server/programs";
import { Prisma } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { program?: Program };
  const program = body.program;

  if (!program) {
    return NextResponse.json({ error: "Program is required" }, { status: 400 });
  }

  const updatedProgram = await prisma.program.update({
    where: { id },
    data: {
      title: program.title,
      status: program.status ?? "active",
      coachId: program.coachId,
      athleteIds: (program.athleteIds ?? (program.athleteId ? [program.athleteId] : [])) as Prisma.InputJsonValue,
      weeks: program.weeks as Prisma.InputJsonValue,
      createdAt: new Date(program.createdAt),
    },
  });

  return NextResponse.json({ program: serializeProgram(updatedProgram) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { status?: Program["status"] };

  if (!body.status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const updatedProgram = await prisma.program.update({
    where: { id },
    data: {
      status: body.status,
    },
  });

  return NextResponse.json({ program: serializeProgram(updatedProgram) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.program.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
