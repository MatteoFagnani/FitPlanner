import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server/auth";

export async function GET() {
  const currentUser = await getAuthenticatedUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role !== "coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      oneRMs: {
        orderBy: { exercise: "asc" },
      },
    },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      oneRMs: user.oneRMs.map((oneRM) => ({
        exercise: oneRM.exercise,
        value: oneRM.value,
      })),
    })),
  });
}
