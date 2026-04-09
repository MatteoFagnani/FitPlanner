import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const exercise = body?.exercise;
  const value = body?.value;

  if (!exercise || typeof value !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

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
