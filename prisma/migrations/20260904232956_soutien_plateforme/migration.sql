-- CreateTable
CREATE TABLE "PlatformSupport" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformSupport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSupport_stripeSessionId_key" ON "PlatformSupport"("stripeSessionId");

-- CreateIndex
CREATE INDEX "PlatformSupport_createdAt_idx" ON "PlatformSupport"("createdAt");

-- AddForeignKey
ALTER TABLE "PlatformSupport" ADD CONSTRAINT "PlatformSupport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
