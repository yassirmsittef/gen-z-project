-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProjectCategory" ADD VALUE 'ECOMMERCE';
ALTER TYPE "ProjectCategory" ADD VALUE 'SERVICES';
ALTER TYPE "ProjectCategory" ADD VALUE 'EDUCATION';
ALTER TYPE "ProjectCategory" ADD VALUE 'SANTE';
ALTER TYPE "ProjectCategory" ADD VALUE 'FINANCE';
ALTER TYPE "ProjectCategory" ADD VALUE 'SPORT';
ALTER TYPE "ProjectCategory" ADD VALUE 'MEDIA';
ALTER TYPE "ProjectCategory" ADD VALUE 'ARTISANAT';
ALTER TYPE "ProjectCategory" ADD VALUE 'IMMOBILIER';

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_senderId_createdAt_idx" ON "Message"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_recipientId_createdAt_idx" ON "Message"("recipientId", "createdAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
