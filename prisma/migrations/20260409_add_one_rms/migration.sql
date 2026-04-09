-- CreateTable
CREATE TABLE "OneRM" (
    "id" TEXT NOT NULL,
    "exercise" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OneRM_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OneRM_userId_exercise_key" ON "OneRM"("userId", "exercise");

-- AddForeignKey
ALTER TABLE "OneRM" ADD CONSTRAINT "OneRM_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
