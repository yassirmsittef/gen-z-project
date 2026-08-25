-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarBytes" INTEGER;
-- CreateTable
CREATE TABLE "UploadTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UploadTicket_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "UploadTicket_userId_createdAt_idx" ON "UploadTicket"("userId", "createdAt");
-- CreateIndex
CREATE INDEX "UploadTicket_createdAt_idx" ON "UploadTicket"("createdAt");
-- AddForeignKey
ALTER TABLE "UploadTicket" ADD CONSTRAINT "UploadTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
