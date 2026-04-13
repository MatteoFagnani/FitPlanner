import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";

const SESSION_COOKIE_NAME = "fitplanner_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;
const SESSION_REFRESH_WINDOW_MS = 1000 * 60 * 60 * 24 * 7;
const MAX_SESSIONS_PER_USER = 5;

export function serializeUser(user: {
  id: number;
  name: string;
  role: string;
  oneRMs: Array<{ exercise: string; value: number }>;
}) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    oneRMs: user.oneRMs.map((oneRM) => ({
      exercise: oneRM.exercise,
      value: oneRM.value,
    })),
  };
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createSessionToken() {
  return randomBytes(32).toString("hex");
}

function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(userId: number, storedPassword: string, candidatePassword: string) {
  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(candidatePassword, storedPassword);
  }

  if (storedPassword !== candidatePassword) {
    return false;
  }

  const hashedPassword = await hashPassword(candidatePassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return true;
}

export async function createUserSession(userId: number) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.deleteMany({
    where: {
      userId,
      expiresAt: { lte: new Date() },
    },
  });

  await prisma.session.create({
    data: {
      tokenHash,
      expiresAt,
      userId,
    },
  });

  const activeSessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (activeSessions.length > MAX_SESSIONS_PER_USER) {
    await prisma.session.deleteMany({
      where: {
        id: {
          in: activeSessions.slice(MAX_SESSIONS_PER_USER).map((session) => session.id),
        },
      },
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
    include: {
      user: {
        include: {
          oneRMs: {
            orderBy: { exercise: "asc" },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    await clearUserSession();
    return null;
  }

  const shouldRefresh = session.expiresAt.getTime() - Date.now() <= SESSION_REFRESH_WINDOW_MS;

  if (shouldRefresh) {
    const refreshedExpiry = new Date(Date.now() + SESSION_DURATION_MS);

    await prisma.session.update({
      where: { id: session.id },
      data: {
        expiresAt: refreshedExpiry,
      },
    });

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: refreshedExpiry,
      path: "/",
    });
  }

  return session.user;
}
