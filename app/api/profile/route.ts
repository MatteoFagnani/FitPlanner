import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = body?.user;

  if (!user?.email || !user?.id || !user?.name || !user?.role) {
    return NextResponse.json({ error: "Missing user payload" }, { status: 400 });
  }

  const persistedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      oneRMs: {
        orderBy: { exercise: "asc" },
      },
    },
  });

  if (!persistedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: persistedUser.id,
      name: persistedUser.name,
      email: persistedUser.email,
      role: persistedUser.role,
      oneRMs: persistedUser.oneRMs.map((oneRM) => ({
        exercise: oneRM.exercise,
        value: oneRM.value,
      })),
    },
  });
}
