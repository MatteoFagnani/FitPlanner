ALTER TABLE "OneRM" DROP CONSTRAINT "OneRM_userId_fkey";
ALTER TABLE "Program" DROP CONSTRAINT "Program_coachId_fkey";
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

DROP INDEX IF EXISTS "User_email_key";

ALTER TABLE "User"
  ADD COLUMN "newId" SERIAL;

ALTER TABLE "OneRM"
  ADD COLUMN "newUserId" INTEGER;

UPDATE "OneRM"
SET "newUserId" = "User"."newId"
FROM "User"
WHERE "OneRM"."userId" = "User"."id";

ALTER TABLE "Program"
  ADD COLUMN "newCoachId" INTEGER;

UPDATE "Program"
SET "newCoachId" = "User"."newId"
FROM "User"
WHERE "Program"."coachId" = "User"."id";

ALTER TABLE "Session"
  ADD COLUMN "newUserId" INTEGER;

UPDATE "Session"
SET "newUserId" = "User"."newId"
FROM "User"
WHERE "Session"."userId" = "User"."id";

ALTER TABLE "Program"
  ADD COLUMN "newAthleteIds" JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE "Program"
SET "newAthleteIds" = COALESCE(
  mapped.ids,
  '[]'::jsonb
)
FROM (
  SELECT
    p."id" AS "programId",
    jsonb_agg(u."newId" ORDER BY arr.ordinality) AS ids
  FROM "Program" p
  LEFT JOIN LATERAL jsonb_array_elements_text(COALESCE(p."athleteIds"::jsonb, '[]'::jsonb)) WITH ORDINALITY AS arr(value, ordinality) ON TRUE
  LEFT JOIN "User" u ON u."id" = arr.value
  GROUP BY p."id"
) AS mapped
WHERE "Program"."id" = mapped."programId";

ALTER TABLE "Program"
  DROP COLUMN "athleteIds";

ALTER TABLE "Program"
  RENAME COLUMN "newAthleteIds" TO "athleteIds";

ALTER TABLE "User" DROP CONSTRAINT "User_pkey";

ALTER TABLE "User"
  DROP COLUMN "id",
  DROP COLUMN "email";

ALTER TABLE "User"
  RENAME COLUMN "newId" TO "id";

ALTER TABLE "User"
  ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

ALTER TABLE "User"
  ADD CONSTRAINT "User_name_key" UNIQUE ("name");

ALTER TABLE "OneRM"
  DROP COLUMN "userId";

ALTER TABLE "OneRM"
  RENAME COLUMN "newUserId" TO "userId";

ALTER TABLE "OneRM"
  ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Program"
  DROP COLUMN "coachId";

ALTER TABLE "Program"
  RENAME COLUMN "newCoachId" TO "coachId";

ALTER TABLE "Program"
  ALTER COLUMN "coachId" SET NOT NULL;

ALTER TABLE "Session"
  DROP COLUMN "userId";

ALTER TABLE "Session"
  RENAME COLUMN "newUserId" TO "userId";

ALTER TABLE "Session"
  ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "OneRM"
  ADD CONSTRAINT "OneRM_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Program"
  ADD CONSTRAINT "Program_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session"
  ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
