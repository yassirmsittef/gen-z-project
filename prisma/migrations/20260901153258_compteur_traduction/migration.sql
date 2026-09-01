-- CreateTable
CREATE TABLE "TranslationUsage" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "chars" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranslationUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranslationUsage_key_createdAt_idx" ON "TranslationUsage"("key", "createdAt");

-- CreateIndex
CREATE INDEX "TranslationUsage_createdAt_idx" ON "TranslationUsage"("createdAt");
