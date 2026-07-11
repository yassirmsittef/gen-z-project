-- PIVOT ARGENT RÉEL (décision fondateur 2026-07-12) : suppression du wallet
-- de tokens. Une devise par projet, montants en unités MINEURES, paiement
-- direct par carte, gate « 50 $ contribués » via l'équivalent USD figé au
-- paiement. L'ancien monde était en tokens = dollars entiers → ×100 et
-- currency='usd' pour tout l'existant. Les soldes de wallet (fictifs)
-- disparaissent avec le ledger — approuvé.

-- 1. Nouvelles colonnes
ALTER TABLE "User" ADD COLUMN "contributedUsdCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'usd';
ALTER TABLE "Contribution" ADD COLUMN "usdCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Contribution" ADD COLUMN "stripeSessionId" TEXT;
ALTER TABLE "Contribution" ADD COLUMN "stripePaymentIntentId" TEXT;
ALTER TABLE "Contribution" ADD COLUMN "refundDueMinor" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Contribution" ADD COLUMN "stripeRefundId" TEXT;

-- 2. Conversions (PostgreSQL évalue toutes les expressions sur la ligne
--    d'ORIGINE : les deux SET ci-dessous partent de l'ancien montant)
UPDATE "Project" SET "goal" = "goal" * 100, "raised" = "raised" * 100, "released" = "released" * 100;
UPDATE "Milestone" SET "amount" = "amount" * 100;
UPDATE "Contribution" SET "amount" = "amount" * 100, "usdCents" = "amount" * 100;
UPDATE "Vote" SET "weight" = "weight" * 100;
UPDATE "User" SET "contributedUsdCents" = "totalContributed" * 100;

-- 3. Le wallet disparaît
ALTER TABLE "User" DROP COLUMN "credits";
ALTER TABLE "User" DROP COLUMN "totalContributed";
DROP TABLE "CreditTransaction";
DROP TYPE "TransactionType";

-- 4. Idempotence du webhook de contribution
CREATE UNIQUE INDEX "Contribution_stripeSessionId_key" ON "Contribution"("stripeSessionId");
