import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProgram } from "@/lib/server/programs";
import { getAuthenticatedUser } from "@/lib/server/auth";
import {
  parseJsonBody,
  programStatusPatchSchema,
  toggleSessionCompletionSchema,
  updateExerciseLoadSchema,
  updateProgramRequestSchema,
} from "@/lib/server/validation";
import { assertSameOrigin } from "@/lib/server/request-security";
import { canCoachManageProgram, canUserToggleProgramSession } from "@/lib/server/program-access";
import { toProgramUpdateInput } from "@/lib/server/program-write";

function parseProgramId(value: string) {
  const programId = Number(value);
  return Number.isInteger(programId) && programId > 0 ? programId : null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const originCheck = assertSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.error }, { status: originCheck.status });
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = parseProgramId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid program id" }, { status: 400 });
  }
  const parsedBody = await parseJsonBody(request, updateProgramRequestSchema);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
  }
  const { program } = parsedBody.data;

  const existingProgram = await prisma.program.findFirst({
    where: { id, coachId: user.id },
  });

  if (!existingProgram) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  if (existingProgram.updatedAt.toISOString() !== program.updatedAt) {
    return NextResponse.json({ error: "Program has changed. Refresh and retry." }, { status: 409 });
  }

  const updateResult = await prisma.program.updateMany({
    where: {
      id,
      updatedAt: existingProgram.updatedAt,
    },
    data: toProgramUpdateInput(program, user.id),
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: "Program has changed. Refresh and retry." }, { status: 409 });
  }

  const updatedProgram = await prisma.program.findUnique({ where: { id } });
  if (!updatedProgram) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json({ program: serializeProgram(updatedProgram) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const originCheck = assertSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.error }, { status: originCheck.status });
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = parseProgramId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid program id" }, { status: 400 });
  }
  const rawBody = await parseJsonBody(
    request,
    toggleSessionCompletionSchema.or(updateExerciseLoadSchema).or(programStatusPatchSchema)
  );
  if (!rawBody.success) {
    return NextResponse.json({ error: rawBody.error }, { status: rawBody.status });
  }
  const body = rawBody.data;

  const existingProgram = await prisma.program.findFirst({
    where: { id },
  });

  if (!existingProgram) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const serializedProgram = serializeProgram(existingProgram);
  const isCoachOwner = canCoachManageProgram(serializedProgram, user);

  if ("action" in body && body.action === "toggle-session-completion") {
    if (!canUserToggleProgramSession(serializedProgram, user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!body.weekId || !body.sessionId) {
      return NextResponse.json({ error: "Week and session are required" }, { status: 400 });
    }

    if (existingProgram.updatedAt.toISOString() !== body.expectedUpdatedAt) {
      return NextResponse.json({ error: "Program has changed. Refresh and retry." }, { status: 409 });
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

    const updateResult = await prisma.program.updateMany({
      where: {
        id,
        updatedAt: existingProgram.updatedAt,
      },
      data: {
        weeks: updatedWeeks as unknown as import("@prisma/client").Prisma.InputJsonValue,
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Program has changed. Refresh and retry." }, { status: 409 });
    }

    const updatedProgram = await prisma.program.findUnique({ where: { id } });
    if (!updatedProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ program: serializeProgram(updatedProgram) });
  }

  if ("action" in body && body.action === "update-exercise-load") {
    if (!canUserToggleProgramSession(serializedProgram, user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existingProgram.updatedAt.toISOString() !== body.expectedUpdatedAt) {
      return NextResponse.json({ error: "Program has changed. Refresh and retry." }, { status: 409 });
    }

    const updatedWeeks = serializedProgram.weeks.map((week) => {
      if (week.id !== body.weekId) {
        return week;
      }

      return {
        ...week,
        sessions: week.sessions.map((session) => {
          if (session.id !== body.sessionId) {
            return session;
          }

          return {
            ...session,
            exercises: session.exercises.map((exercise) =>
              exercise.id === body.exerciseId
                ? {
                    ...exercise,
                    performedLoad: body.performedLoad ?? undefined,
                  }
                : exercise
            ),
          };
        }),
      };
    });

    const updateResult = await prisma.program.updateMany({
      where: {
        id,
        updatedAt: existingProgram.updatedAt,
      },
      data: {
        weeks: updatedWeeks as unknown as import("@prisma/client").Prisma.InputJsonValue,
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Program has changed. Refresh and retry." }, { status: 409 });
    }

    const updatedProgram = await prisma.program.findUnique({ where: { id } });
    if (!updatedProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ program: serializeProgram(updatedProgram) });
  }

  if (!isCoachOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!("status" in body) || !body.status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  if (existingProgram.updatedAt.toISOString() !== body.expectedUpdatedAt) {
    return NextResponse.json({ error: "Program has changed. Refresh and retry." }, { status: 409 });
  }

  const updateResult = await prisma.program.updateMany({
    where: {
      id,
      updatedAt: existingProgram.updatedAt,
    },
    data: {
      status: body.status,
    },
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: "Program has changed. Refresh and retry." }, { status: 409 });
  }

  const updatedProgram = await prisma.program.findUnique({ where: { id } });
  if (!updatedProgram) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json({ program: serializeProgram(updatedProgram) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const originCheck = assertSameOrigin(_request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.error }, { status: originCheck.status });
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = parseProgramId(rawId);
  if (id === null) {
    return NextResponse.json({ error: "Invalid program id" }, { status: 400 });
  }

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
