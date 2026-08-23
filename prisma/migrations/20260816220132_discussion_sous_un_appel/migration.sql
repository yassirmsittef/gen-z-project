-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CALL_COMMENT';

-- AlterEnum
ALTER TYPE "ReportTargetType" ADD VALUE 'CALL_COMMENT';

-- CreateTable
CREATE TABLE "CallComment" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CallComment_callId_createdAt_idx" ON "CallComment"("callId", "createdAt");

-- AddForeignKey
ALTER TABLE "CallComment" ADD CONSTRAINT "CallComment_callId_fkey" FOREIGN KEY ("callId") REFERENCES "BoycottCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallComment" ADD CONSTRAINT "CallComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
