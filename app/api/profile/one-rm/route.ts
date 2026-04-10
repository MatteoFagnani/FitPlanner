import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { oneRMDeleteSchema, oneRMSchema, parseJsonBody } from "@/lib/server/validation";
import { assertSameOrigin } from "@/lib/server/request-security";
import { normalizeExerciseName, sortOneRMs } from "@/lib/one-rm";

async function listUserOneRMs(userId: number) {
  const oneRMs = await prisma.oneRM.findMany({
    where: { userId },
    orderBy: { exercise: "asc" },
  });

  return sortOneRMs(
    oneRMs.map((oneRM) => ({
      exercise: oneRM.exercise,
      value: oneRM.value,
    }))
  );
}

export async function POST(request: NextRequest) {
  const originCheck = assertSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.error }, { status: originCheck.status });
  }

  const parsedBody = await parseJsonBody(request, oneRMSchema);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
  }
  const { exercise, value } = parsedBody.data;
  const normalizedExercise = normalizeExerciseName(exercise);

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingOneRM = await prisma.oneRM.findFirst({
      where: {
        userId: user.id,
        exercise: {
          equals: normalizedExercise,
          mode: "insensitive",
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existingOneRM) {
      await prisma.oneRM.update({
        where: { id: existingOneRM.id },
        data: {
          exercise: normalizedExercise,
          value,
        },
      });
    } else {
      try {
        await prisma.oneRM.create({
          data: {
            exercise: normalizedExercise,
            value,
            userId: user.id,
          },
        });
      } catch {
        await prisma.oneRM.update({
          where: {
            userId_exercise: {
              userId: user.id,
              exercise: normalizedExercise,
            },
          },
          data: { value },
        });
      }
    }

    return NextResponse.json({
      oneRMs: await listUserOneRMs(user.id),
    });
  } catch (error) {
    console.error("Failed to save oneRM", error);
    return NextResponse.json({ error: "Unable to save oneRM" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const originCheck = assertSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json({ error: originCheck.error }, { status: originCheck.status });
  }

  const parsedBody = await parseJsonBody(request, oneRMDeleteSchema);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
  }
  const { exercise } = parsedBody.data;
  const normalizedExercise = normalizeExerciseName(exercise);

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.oneRM.deleteMany({
      where: {
        userId: user.id,
        exercise: {
          equals: normalizedExercise,
          mode: "insensitive",
        },
      },
    });

    return NextResponse.json({
      oneRMs: await listUserOneRMs(user.id),
    });
  } catch (error) {
    console.error("Failed to delete oneRM", error);
    return NextResponse.json({ error: "Unable to delete oneRM" }, { status: 500 });
  }
}
