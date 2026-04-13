CREATE TABLE "ProgramProgress" (
    "id" SERIAL NOT NULL,
    "completedSessionIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "performedLoads" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "programId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ProgramProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProgramProgress_programId_userId_key" ON "ProgramProgress"("programId", "userId");
CREATE INDEX "ProgramProgress_programId_idx" ON "ProgramProgress"("programId");
CREATE INDEX "ProgramProgress_userId_idx" ON "ProgramProgress"("userId");

ALTER TABLE "ProgramProgress"
  ADD CONSTRAINT "ProgramProgress_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProgramProgress"
  ADD CONSTRAINT "ProgramProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
