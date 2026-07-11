-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "realizationDeadline" TIMESTAMP(3);

-- Backfill : les projets déjà financés reçoivent l'échéance à partir de
-- maintenant (pas rétroactivement — équitable pour les porteurs en cours).
UPDATE "Project"
SET "realizationDeadline" = NOW() + INTERVAL '60 days'
WHERE "status" = 'FUNDED' AND "realizationDeadline" IS NULL;
