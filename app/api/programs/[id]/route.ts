import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Program } from "@/lib/types";
import { serializeProgram } from "@/lib/server/programs";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/server/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as { program?: Program };
  const program = body.program;

  if (!program) {
    return NextResponse.json({ error: "Program is required" }, { status: 400 });
  }

  const existingProgram = await prisma.program.findFirst({
    where: { id, coachId: user.id },
  });

  if (!existingProgram) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const updatedProgram = await prisma.program.update({
    where: { id },
    data: {
      title: program.title,
      status: program.status ?? "active",
      coachId: user.id,
      athleteIds: (program.athleteIds ?? (program.athleteId ? [program.athleteId] : [])) as unknown as Prisma.InputJsonValue,
      weeks: program.weeks as unknown as Prisma.InputJsonValue,
      createdAt: new Date(program.createdAt),
    },
  });

  return NextResponse.json({ program: serializeProgram(updatedProgram) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: Program["status"] };

  if (!body.status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const existingProgram = await prisma.program.findFirst({
    where: { id, coachId: user.id },
  });

  if (!existingProgram) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
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
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const existingProgram = await prisma.program.findFirst({
    where: { id, coachId: user.id },
  });

  if (!existingProgram) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  await prisma.program.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
