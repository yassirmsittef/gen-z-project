-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'STORAGE_ALERT';

-- AlterTable
ALTER TABLE "CallVideo" ADD COLUMN     "storedBytes" INTEGER;
