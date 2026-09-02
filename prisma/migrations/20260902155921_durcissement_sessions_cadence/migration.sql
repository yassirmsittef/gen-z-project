-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ActionThrottle" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionThrottle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActionThrottle_key_createdAt_idx" ON "ActionThrottle"("key", "createdAt");

-- CreateIndex
CREATE INDEX "ActionThrottle_createdAt_idx" ON "ActionThrottle"("createdAt");
