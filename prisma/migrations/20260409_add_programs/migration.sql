CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "coachId" TEXT NOT NULL,
    "athleteIds" JSONB NOT NULL,
    "weeks" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Program"
ADD CONSTRAINT "Program_coachId_fkey"
FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Program_coachId_idx" ON "Program"("coachId");
CREATE INDEX "Program_status_idx" ON "Program"("status");
