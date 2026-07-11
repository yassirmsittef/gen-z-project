-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "stripeTransferId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeAccountId" TEXT;
