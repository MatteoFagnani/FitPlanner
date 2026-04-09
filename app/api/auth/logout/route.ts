import { NextRequest, NextResponse } from "next/server";
import { clearUserSession } from "@/lib/server/auth";
import { assertSameOrigin } from "@/lib/server/request-security";

export async function POST(request: NextRequest) {
  const originCheck = assertSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.error }, { status: originCheck.status });
  }

  await clearUserSession();

  return NextResponse.json({ success: true });
}
