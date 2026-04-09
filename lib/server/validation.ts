import { NextRequest } from "next/server";
import { z } from "zod";

const safeNumber = z.number().finite();
const nonEmptyString = z.string().trim().min(1);

export const loginSchema = z.object({
  identity: nonEmptyString.max(120),
  password: z.string().min(1).max(200),
});

export const oneRMSchema = z.object({
  exercise: nonEmptyString.max(80),
  value: safeNumber.min(0).max(1000),
});

export const oneRMDeleteSchema = z.object({
  exercise: nonEmptyString.max(80),
});

const exerciseSchema = z.object({
  id: nonEmptyString.max(80),
  name: z.string().trim().max(120),
  sets: z.number().int().min(1).max(100),
  reps: z.number().int().min(1).max(100),
  method: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(500).optional(),
  percentage: safeNumber.min(0).max(100).optional(),
  load: safeNumber.min(0).max(5000).optional(),
});

const sessionSchema = z.object({
  id: nonEmptyString.max(80),
  title: z.string().trim().max(120),
  order: z.number().int().min(1).max(100),
  completed: z.boolean().optional(),
  exercises: z.array(exerciseSchema).min(1).max(100),
});

const weekSchema = z.object({
  id: nonEmptyString.max(80),
  order: z.number().int().min(1).max(104),
  completed: z.boolean().optional(),
  sessions: z.array(sessionSchema).min(1).max(50),
});

export const programSchema = z.object({
  id: nonEmptyString.max(120),
  title: nonEmptyString.max(160),
  status: z.enum(["active", "archived"]).optional(),
  coachId: nonEmptyString.max(120),
  athleteId: z.string().trim().min(1).max(120).optional(),
  athleteIds: z.array(z.string().trim().min(1).max(120)).max(200).optional(),
  weeks: z.array(weekSchema).min(1).max(52),
  createdAt: z.string().datetime(),
});

export const createProgramRequestSchema = z.object({
  program: programSchema,
});

export const updateProgramRequestSchema = z.object({
  program: programSchema.extend({
    updatedAt: z.string().datetime(),
  }),
});

export const toggleSessionCompletionSchema = z.object({
  action: z.literal("toggle-session-completion"),
  weekId: nonEmptyString.max(80),
  sessionId: nonEmptyString.max(80),
  expectedUpdatedAt: z.string().datetime(),
});

export const programStatusPatchSchema = z.object({
  status: z.enum(["active", "archived"]),
  expectedUpdatedAt: z.string().datetime(),
});

export async function parseJsonBody<T>(
  request: NextRequest,
  schema: z.ZodType<T>
): Promise<
  | { success: true; data: T }
  | { success: false; error: string; status: number }
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      error: "Malformed JSON body",
      status: 400,
    };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid payload",
      status: 400,
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}
