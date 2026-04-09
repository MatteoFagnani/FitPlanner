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
  const body = (await request.json()) as {
    status?: Program["status"];
    action?: "toggle-session-completion";
    weekId?: string;
    sessionId?: string;
  };

  const existingProgram = await prisma.program.findFirst({
    where: { id },
  });

  if (!existingProgram) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const serializedProgram = serializeProgram(existingProgram);
  const isCoachOwner = existingProgram.coachId === user.id;
  const isAssignedAthlete =
    user.role === "athlete" &&
    ((serializedProgram.athleteIds && serializedProgram.athleteIds.includes(user.id)) ||
      serializedProgram.athleteId === user.id);

  if (body.action === "toggle-session-completion") {
    if (!isCoachOwner && !isAssignedAthlete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!body.weekId || !body.sessionId) {
      return NextResponse.json({ error: "Week and session are required" }, { status: 400 });
    }

    const updatedWeeks = serializedProgram.weeks.map((week) => {
      if (week.id !== body.weekId) {
        return week;
      }

      const sessions = week.sessions.map((session) =>
        session.id === body.sessionId ? { ...session, completed: !session.completed } : session
      );

      return {
        ...week,
        sessions,
        completed: sessions.length > 0 && sessions.every((session) => session.completed),
      };
    });

    const updatedProgram = await prisma.program.update({
      where: { id },
      data: {
        weeks: updatedWeeks as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ program: serializeProgram(updatedProgram) });
  }

  if (!isCoachOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
