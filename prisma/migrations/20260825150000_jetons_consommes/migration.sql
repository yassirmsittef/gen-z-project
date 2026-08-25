-- AlterTable
ALTER TABLE "UploadTicket" ADD COLUMN     "consumedAt" TIMESTAMP(3);
-- CreateIndex
CREATE INDEX "UploadTicket_consumedAt_createdAt_idx" ON "UploadTicket"("consumedAt", "createdAt");
