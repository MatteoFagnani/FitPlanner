ALTER TABLE "OneRM" DROP CONSTRAINT IF EXISTS "OneRM_pkey";
ALTER TABLE "Program" DROP CONSTRAINT IF EXISTS "Program_pkey";
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_pkey";

ALTER TABLE "OneRM" ADD COLUMN IF NOT EXISTS "newId" SERIAL;
ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "newId" SERIAL;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "newId" SERIAL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'OneRM'
      AND column_name = 'id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'OneRM'
      AND column_name = 'newId'
  ) THEN
    ALTER TABLE "OneRM" DROP COLUMN "id";
    ALTER TABLE "OneRM" RENAME COLUMN "newId" TO "id";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Program'
      AND column_name = 'id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Program'
      AND column_name = 'newId'
  ) THEN
    ALTER TABLE "Program" DROP COLUMN "id";
    ALTER TABLE "Program" RENAME COLUMN "newId" TO "id";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Session'
      AND column_name = 'id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Session'
      AND column_name = 'newId'
  ) THEN
    ALTER TABLE "Session" DROP COLUMN "id";
    ALTER TABLE "Session" RENAME COLUMN "newId" TO "id";
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OneRM_pkey') THEN
    ALTER TABLE "OneRM" ADD CONSTRAINT "OneRM_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Program_pkey') THEN
    ALTER TABLE "Program" ADD CONSTRAINT "Program_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Session_pkey') THEN
    ALTER TABLE "Session" ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");
  END IF;
END $$;
