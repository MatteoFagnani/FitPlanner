import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
import {
  hasExercise,
  hasSession,
  parseUserProgramProgress,
  toggleCompletedSession,
  updatePerformedLoad,
} from "@/lib/server/program-progress";

function parseProgramId(value: string) {
  const programId = Number(value);
  return Number.isInteger(programId) && programId > 0 ? programId : null;
}

type ProgramProgressRow = {
  programId: number;
  userId: number;
  completedSessionIds: Prisma.JsonValue | null;
  performedLoads: Prisma.JsonValue | null;
};

async function getUserProgramProgress(programId: number, userId: number) {
  const rows = await prisma.$queryRaw<ProgramProgressRow[]>`
    SELECT "programId", "userId", "completedSessionIds", "performedLoads"
    FROM "ProgramProgress"
    WHERE "programId" = ${programId} AND "userId" = ${userId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

async function upsertUserProgramProgress(
  programId: number,
  userId: number,
  completedSessionIds: string[],
  performedLoads: Record<string, number>
) {
  const completedSessionIdsJson = JSON.stringify(completedSessionIds);
  const performedLoadsJson = JSON.stringify(performedLoads);

  const rows = await prisma.$queryRaw<ProgramProgressRow[]>`
    INSERT INTO "ProgramProgress" ("programId", "userId", "completedSessionIds", "performedLoads", "createdAt", "updatedAt")
    VALUES (
      ${programId},
      ${userId},
      CAST(${completedSessionIdsJson} AS jsonb),
      CAST(${performedLoadsJson} AS jsonb),
      NOW(),
      NOW()
    )
    ON CONFLICT ("programId", "userId")
    DO UPDATE SET
      "completedSessionIds" = CAST(${completedSessionIdsJson} AS jsonb),
      "performedLoads" = CAST(${performedLoadsJson} AS jsonb),
      "updatedAt" = NOW()
    RETURNING "programId", "userId", "completedSessionIds", "performedLoads"
  `;

  return rows[0] ?? null;
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

    if (!hasSession(serializedProgram, body.weekId, body.sessionId)) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const existingProgress = await getUserProgramProgress(id, user.id);
    const nextProgress = toggleCompletedSession(parseUserProgramProgress(existingProgress), body.sessionId);

    const savedProgress = await upsertUserProgramProgress(
      id,
      user.id,
      nextProgress.completedSessionIds,
      nextProgress.performedLoads
    );

    const updatedProgram = await prisma.program.findUnique({ where: { id } });
    if (!updatedProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ program: serializeProgram(updatedProgram, savedProgress) });
  }

  if ("action" in body && body.action === "update-exercise-load") {
    if (!canUserToggleProgramSession(serializedProgram, user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!hasExercise(serializedProgram, body.weekId, body.sessionId, body.exerciseId)) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const existingProgress = await getUserProgramProgress(id, user.id);
    const nextProgress = updatePerformedLoad(
      parseUserProgramProgress(existingProgress),
      body.exerciseId,
      body.performedLoad
    );

    const savedProgress = await upsertUserProgramProgress(
      id,
      user.id,
      nextProgress.completedSessionIds,
      nextProgress.performedLoads
    );

    const updatedProgram = await prisma.program.findUnique({ where: { id } });
    if (!updatedProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ program: serializeProgram(updatedProgram, savedProgress) });
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
