-- AlterEnum
ALTER TYPE "ReportTargetType" ADD VALUE 'CALL_VIDEO';

-- CreateTable
CREATE TABLE "CallVideo" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "url" TEXT,
    "posterUrl" TEXT,
    "caption" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "removedAt" TIMESTAMP(3),
    "removedById" TEXT,
    "removalReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CallVideo_removedAt_createdAt_idx" ON "CallVideo"("removedAt", "createdAt");

-- CreateIndex
CREATE INDEX "CallVideo_callId_removedAt_createdAt_idx" ON "CallVideo"("callId", "removedAt", "createdAt");

-- CreateIndex
CREATE INDEX "CallVideo_authorId_createdAt_idx" ON "CallVideo"("authorId", "createdAt");

-- AddForeignKey
ALTER TABLE "CallVideo" ADD CONSTRAINT "CallVideo_callId_fkey" FOREIGN KEY ("callId") REFERENCES "BoycottCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallVideo" ADD CONSTRAINT "CallVideo_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
