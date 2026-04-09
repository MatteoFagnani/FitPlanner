import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/server/auth";

export async function POST() {
  await clearUserSession();

  return NextResponse.json({ success: true });
}
