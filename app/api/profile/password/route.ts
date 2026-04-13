import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, hashPassword, verifyPassword } from "@/lib/server/auth";
import { changePasswordSchema, parseJsonBody } from "@/lib/server/validation";
import { assertSameOrigin } from "@/lib/server/request-security";

export async function POST(request: NextRequest) {
  const originCheck = assertSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.error }, { status: originCheck.status });
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = await parseJsonBody(request, changePasswordSchema);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
  }

  const { currentPassword, newPassword } = parsedBody.data;

  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, password: true },
  });

  if (!userRecord) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isValidPassword = await verifyPassword(userRecord.id, userRecord.password, currentPassword);
  if (!isValidPassword) {
    return NextResponse.json({ error: "Password attuale non valida" }, { status: 400 });
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "La nuova password deve essere diversa da quella attuale" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(newPassword),
    },
  });

  return NextResponse.json({ success: true });
}
