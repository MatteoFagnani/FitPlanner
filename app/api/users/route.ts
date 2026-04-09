import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
