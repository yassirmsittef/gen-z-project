-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "key" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "params" JSONB,
ADD COLUMN     "retractedAt" TIMESTAMP(3),
ALTER COLUMN "title" DROP NOT NULL;
