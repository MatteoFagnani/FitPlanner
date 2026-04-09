import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserSession, serializeUser, verifyPassword } from "@/lib/server/auth";

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

  const isValidPassword = await verifyPassword(user.id, user.password, password);

  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createUserSession(user.id);

  return NextResponse.json({
    user: serializeUser(user),
  });
}
