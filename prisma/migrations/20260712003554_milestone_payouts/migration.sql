/*
  Warnings:

  - You are about to drop the column `stripeTransferId` on the `Milestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "stripeChargeId" TEXT;

-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "stripeTransferId";

-- CreateTable
CREATE TABLE "MilestonePayout" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "contributionId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "stripeTransferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MilestonePayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MilestonePayout_contributionId_idx" ON "MilestonePayout"("contributionId");

-- CreateIndex
CREATE UNIQUE INDEX "MilestonePayout_milestoneId_contributionId_key" ON "MilestonePayout"("milestoneId", "contributionId");

-- AddForeignKey
ALTER TABLE "MilestonePayout" ADD CONSTRAINT "MilestonePayout_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestonePayout" ADD CONSTRAINT "MilestonePayout_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
