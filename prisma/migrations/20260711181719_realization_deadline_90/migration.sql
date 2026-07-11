-- Décision 2026-07-11 (bis) : échéance de réalisation portée de 60 à 90 jours.
-- Les projets financés dont l'horloge tournait déjà sur 60 j gagnent les 30 j
-- de différence (aucun changement de schéma).
UPDATE "Project"
SET "realizationDeadline" = "realizationDeadline" + INTERVAL '30 days'
WHERE "status" = 'FUNDED' AND "realizationDeadline" IS NOT NULL;
