-- AlterTable
ALTER TABLE "User" ADD COLUMN     "links" TEXT[] DEFAULT ARRAY[]::TEXT[];
