-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "sourceId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_type_sourceId_idx" ON "Notification"("type", "sourceId");
