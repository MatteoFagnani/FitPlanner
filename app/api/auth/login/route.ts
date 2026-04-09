import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserSession, serializeUser, verifyPassword } from "@/lib/server/auth";
import { loginSchema, parseJsonBody } from "@/lib/server/validation";
import { assertSameOrigin } from "@/lib/server/request-security";
import { clearRateLimit, consumeRateLimit } from "@/lib/server/rate-limit";

export async function POST(request: NextRequest) {
  const originCheck = assertSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.error }, { status: originCheck.status });
  }

  const parsedBody = await parseJsonBody(request, loginSchema);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
  }
  const identity = parsedBody.data.identity.trim();
  const password = parsedBody.data.password;
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitKey = `${clientIp}:${identity.toLowerCase()}`;
  const rateLimit = consumeRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });
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
  clearRateLimit(rateLimitKey);

  return NextResponse.json({
    user: serializeUser(user),
  });
}
