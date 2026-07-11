-- CreateEnum
CREATE TYPE "PartnershipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "PartnershipCompensation" AS ENUM ('MONEY', 'PRODUCT', 'VISIBILITY', 'MIXED');

-- CreateTable
CREATE TABLE "PartnershipRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "contactName" TEXT,
    "brandEmail" TEXT NOT NULL,
    "brandWebsite" TEXT,
    "compensation" "PartnershipCompensation" NOT NULL,
    "budget" INTEGER,
    "message" TEXT NOT NULL,
    "deliverables" TEXT,
    "status" "PartnershipStatus" NOT NULL DEFAULT 'PENDING',
    "trackToken" TEXT NOT NULL,
    "aiAnalysis" JSONB,
    "aiAnalyzedAt" TIMESTAMP(3),
    "ownerReply" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnershipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnershipRequest_trackToken_key" ON "PartnershipRequest"("trackToken");

-- CreateIndex
CREATE INDEX "PartnershipRequest_projectId_status_idx" ON "PartnershipRequest"("projectId", "status");

-- AddForeignKey
ALTER TABLE "PartnershipRequest" ADD CONSTRAINT "PartnershipRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
