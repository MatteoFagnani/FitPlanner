ALTER TABLE "OneRM" DROP CONSTRAINT IF EXISTS "OneRM_userId_fkey";
ALTER TABLE "Program" DROP CONSTRAINT IF EXISTS "Program_coachId_fkey";
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";

DROP INDEX IF EXISTS "User_email_key";
DROP INDEX IF EXISTS "User_name_key";

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "newId" SERIAL;
ALTER TABLE "OneRM" ADD COLUMN IF NOT EXISTS "newUserId" INTEGER;
ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "newCoachId" INTEGER;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "newUserId" INTEGER;
ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "newAthleteIds" JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE "OneRM"
SET "newUserId" = "User"."newId"
FROM "User"
WHERE "OneRM"."newUserId" IS NULL
  AND "OneRM"."userId"::text = "User"."id"::text;

UPDATE "Program"
SET "newCoachId" = "User"."newId"
FROM "User"
WHERE "Program"."newCoachId" IS NULL
  AND "Program"."coachId"::text = "User"."id"::text;

UPDATE "Session"
SET "newUserId" = "User"."newId"
FROM "User"
WHERE "Session"."newUserId" IS NULL
  AND "Session"."userId"::text = "User"."id"::text;

UPDATE "Program"
SET "newAthleteIds" = COALESCE(
  mapped.ids,
  '[]'::jsonb
)
FROM (
  SELECT
    p."id" AS "programId",
    jsonb_agg(u."newId" ORDER BY arr.ordinality) FILTER (WHERE u."newId" IS NOT NULL) AS ids
  FROM "Program" p
  LEFT JOIN LATERAL jsonb_array_elements_text(COALESCE(p."athleteIds"::jsonb, '[]'::jsonb)) WITH ORDINALITY AS arr(value, ordinality) ON TRUE
  LEFT JOIN "User" u ON u."id"::text = arr.value
  GROUP BY p."id"
) AS mapped
WHERE "Program"."id" = mapped."programId";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Program'
      AND column_name = 'athleteIds'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Program'
      AND column_name = 'newAthleteIds'
  ) THEN
    ALTER TABLE "Program" DROP COLUMN "athleteIds";
    ALTER TABLE "Program" RENAME COLUMN "newAthleteIds" TO "athleteIds";
  END IF;
END $$;

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_pkey";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'email'
  ) THEN
    ALTER TABLE "User" DROP COLUMN "email";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'newId'
  ) THEN
    ALTER TABLE "User" DROP COLUMN "id";
    ALTER TABLE "User" RENAME COLUMN "newId" TO "id";
  END IF;
END $$;

ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
ALTER TABLE "User" ADD CONSTRAINT "User_name_key" UNIQUE ("name");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'OneRM'
      AND column_name = 'userId'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'OneRM'
      AND column_name = 'newUserId'
  ) THEN
    ALTER TABLE "OneRM" DROP COLUMN "userId";
    ALTER TABLE "OneRM" RENAME COLUMN "newUserId" TO "userId";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Program'
      AND column_name = 'coachId'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Program'
      AND column_name = 'newCoachId'
  ) THEN
    ALTER TABLE "Program" DROP COLUMN "coachId";
    ALTER TABLE "Program" RENAME COLUMN "newCoachId" TO "coachId";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Session'
      AND column_name = 'userId'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Session'
      AND column_name = 'newUserId'
  ) THEN
    ALTER TABLE "Session" DROP COLUMN "userId";
    ALTER TABLE "Session" RENAME COLUMN "newUserId" TO "userId";
  END IF;
END $$;

ALTER TABLE "OneRM" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Program" ALTER COLUMN "coachId" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "userId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'OneRM_userId_fkey'
  ) THEN
    ALTER TABLE "OneRM"
      ADD CONSTRAINT "OneRM_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Program_coachId_fkey'
  ) THEN
    ALTER TABLE "Program"
      ADD CONSTRAINT "Program_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Session_userId_fkey'
  ) THEN
    ALTER TABLE "Session"
      ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
