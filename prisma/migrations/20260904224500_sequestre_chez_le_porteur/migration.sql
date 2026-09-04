-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "stripeEscrowReversalId" TEXT,
ADD COLUMN     "stripeEscrowTransferId" TEXT;

-- AlterTable
ALTER TABLE "MilestonePayout" ADD COLUMN     "stripePayoutId" TEXT;
