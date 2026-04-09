import { NextRequest } from "next/server";

function getRequestOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return null;
  }

  try {
    return new URL(origin);
  } catch {
    return null;
  }
}

function getExpectedOrigin(request: NextRequest) {
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (!host) {
    return null;
  }

  return `${protocol}://${host}`;
}

export function assertSameOrigin(request: NextRequest) {
  const requestOrigin = getRequestOrigin(request);

  if (!requestOrigin) {
    return { ok: true as const };
  }

  const expectedOrigin = getExpectedOrigin(request);

  if (!expectedOrigin || requestOrigin.origin !== expectedOrigin) {
    return {
      ok: false as const,
      status: 403,
      error: "Origin not allowed",
    };
  }

  return { ok: true as const };
}
