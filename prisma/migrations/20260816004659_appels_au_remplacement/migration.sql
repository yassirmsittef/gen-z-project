-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'BOYCOTT_ANSWERED';

-- AlterEnum
ALTER TYPE "ReportTargetType" ADD VALUE 'BOYCOTT_CALL';

-- CreateTable
CREATE TABLE "BoycottCall" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "targetKey" TEXT NOT NULL,
    "category" "ProjectCategory" NOT NULL,
    "reason" TEXT NOT NULL,
    "wanted" TEXT NOT NULL,
    "sources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "removedAt" TIMESTAMP(3),
    "removedById" TEXT,
    "removalReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoycottCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoycottSupport" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoycottSupport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoycottAnswer" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoycottAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoycottCall_slug_key" ON "BoycottCall"("slug");

-- CreateIndex
CREATE INDEX "BoycottCall_targetKey_idx" ON "BoycottCall"("targetKey");

-- CreateIndex
CREATE INDEX "BoycottCall_removedAt_createdAt_idx" ON "BoycottCall"("removedAt", "createdAt");

-- CreateIndex
CREATE INDEX "BoycottCall_authorId_createdAt_idx" ON "BoycottCall"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "BoycottSupport_userId_createdAt_idx" ON "BoycottSupport"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BoycottSupport_callId_userId_key" ON "BoycottSupport"("callId", "userId");

-- CreateIndex
CREATE INDEX "BoycottAnswer_projectId_idx" ON "BoycottAnswer"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "BoycottAnswer_callId_projectId_key" ON "BoycottAnswer"("callId", "projectId");

-- AddForeignKey
ALTER TABLE "BoycottCall" ADD CONSTRAINT "BoycottCall_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoycottSupport" ADD CONSTRAINT "BoycottSupport_callId_fkey" FOREIGN KEY ("callId") REFERENCES "BoycottCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoycottSupport" ADD CONSTRAINT "BoycottSupport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoycottAnswer" ADD CONSTRAINT "BoycottAnswer_callId_fkey" FOREIGN KEY ("callId") REFERENCES "BoycottCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoycottAnswer" ADD CONSTRAINT "BoycottAnswer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
