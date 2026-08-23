-- DropIndex
DROP INDEX "BoycottAnswer_projectId_idx";

-- DropIndex
DROP INDEX "CallComment_callId_createdAt_idx";

-- AlterTable
ALTER TABLE "BoycottAnswer" ADD COLUMN     "withdrawnAt" TIMESTAMP(3),
ADD COLUMN     "withdrawnBy" TEXT;

-- AlterTable
ALTER TABLE "CallComment" ADD COLUMN     "removedAt" TIMESTAMP(3),
ADD COLUMN     "removedById" TEXT;

-- CreateIndex
CREATE INDEX "BoycottAnswer_projectId_withdrawnAt_idx" ON "BoycottAnswer"("projectId", "withdrawnAt");

-- CreateIndex
CREATE INDEX "CallComment_callId_removedAt_createdAt_idx" ON "CallComment"("callId", "removedAt", "createdAt");

-- CreateIndex
CREATE INDEX "CallComment_userId_createdAt_idx" ON "CallComment"("userId", "createdAt");
