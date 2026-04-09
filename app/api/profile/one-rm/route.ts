import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { oneRMDeleteSchema, oneRMSchema, parseJsonBody } from "@/lib/server/validation";
import { assertSameOrigin } from "@/lib/server/request-security";

export async function POST(request: NextRequest) {
  const originCheck = assertSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.error }, { status: originCheck.status });
  }

  const parsedBody = await parseJsonBody(request, oneRMSchema);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
  }
  const { exercise, value } = parsedBody.data;

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.oneRM.upsert({
    where: {
      userId_exercise: {
        userId: user.id,
        exercise,
      },
    },
    update: {
      value,
    },
    create: {
      exercise,
      value,
      userId: user.id,
    },
  });

  const oneRMs = await prisma.oneRM.findMany({
    where: { userId: user.id },
    orderBy: { exercise: "asc" },
  });

  return NextResponse.json({
    oneRMs: oneRMs.map((oneRM) => ({
      exercise: oneRM.exercise,
      value: oneRM.value,
    })),
  });
}

export async function DELETE(request: NextRequest) {
  const originCheck = assertSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.error }, { status: originCheck.status });
  }

  const parsedBody = await parseJsonBody(request, oneRMDeleteSchema);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
  }
  const { exercise } = parsedBody.data;

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.oneRM.deleteMany({
    where: {
      userId: user.id,
      exercise,
    },
  });

  const oneRMs = await prisma.oneRM.findMany({
    where: { userId: user.id },
    orderBy: { exercise: "asc" },
  });

  return NextResponse.json({
    oneRMs: oneRMs.map((oneRM) => ({
      exercise: oneRM.exercise,
      value: oneRM.value,
    })),
  });
}
