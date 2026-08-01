-- AlterTable
ALTER TABLE "ChatGroup" ADD COLUMN     "official" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ChatGroup_official_createdAt_idx" ON "ChatGroup"("official", "createdAt");
