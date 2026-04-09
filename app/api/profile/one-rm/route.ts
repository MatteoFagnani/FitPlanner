import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = body?.user;
  const exercise = body?.exercise;
  const value = body?.value;

  if (!user?.email || !user?.id || !user?.name || !user?.role || !exercise || typeof value !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const persistedUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!persistedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.oneRM.upsert({
    where: {
      userId_exercise: {
        userId: persistedUser.id,
        exercise,
      },
    },
    update: {
      value,
    },
    create: {
      exercise,
      value,
      userId: persistedUser.id,
    },
  });

  const oneRMs = await prisma.oneRM.findMany({
    where: { userId: persistedUser.id },
    orderBy: { exercise: "asc" },
  });

  return NextResponse.json({
    oneRMs: oneRMs.map((oneRM) => ({
      exercise: oneRM.exercise,
      value: oneRM.value,
    })),
  });
}
