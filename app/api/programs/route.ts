import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProgram } from "@/lib/server/programs";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { createProgramRequestSchema, parseJsonBody } from "@/lib/server/validation";
import { assertSameOrigin } from "@/lib/server/request-security";
import { isAssignedToProgram } from "@/lib/server/program-access";
import { toProgramCreateInput } from "@/lib/server/program-write";

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
        isAssignedToProgram(program, user.id)
      );
    });

  return NextResponse.json({ programs: serializedPrograms });
}

export async function POST(request: NextRequest) {
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

  const parsedBody = await parseJsonBody(request, createProgramRequestSchema);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
  }
  const { program } = parsedBody.data;

  const createdProgram = await prisma.program.create({
    data: toProgramCreateInput(program, user.id),
  });

  return NextResponse.json({ program: serializeProgram(createdProgram) }, { status: 201 });
}
