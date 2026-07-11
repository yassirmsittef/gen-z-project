-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mutedNotifications" "NotificationType"[] DEFAULT ARRAY[]::"NotificationType"[];
