import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const identity = body?.identity?.trim();
  const password = body?.password;

  if (!identity || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identity }, { name: identity }],
      password,
    },
    include: {
      oneRMs: {
        orderBy: { exercise: "asc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      oneRMs: user.oneRMs.map((oneRM) => ({
        exercise: oneRM.exercise,
        value: oneRM.value,
      })),
    },
  });
}
