import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";

const SESSION_COOKIE_NAME = "fitplanner_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  oneRMs: Array<{ exercise: string; value: number }>;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
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

export async function verifyPassword(userId: string, storedPassword: string, candidatePassword: string) {
  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(candidatePassword, storedPassword);
  }

  if (storedPassword !== candidatePassword) {
    return false;
  }

  const hashedPassword = await bcrypt.hash(candidatePassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return true;
}

export async function createUserSession(userId: string) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      tokenHash,
      expiresAt,
      userId,
    },
  });

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

  return session.user;
}
