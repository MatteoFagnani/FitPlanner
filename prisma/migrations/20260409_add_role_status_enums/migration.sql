CREATE TYPE "UserRole" AS ENUM ('coach', 'athlete');
CREATE TYPE "ProgramStatus" AS ENUM ('active', 'archived');

ALTER TABLE "User"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";

ALTER TABLE "Program"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "ProgramStatus" USING "status"::"ProgramStatus",
  ALTER COLUMN "status" SET DEFAULT 'active';
