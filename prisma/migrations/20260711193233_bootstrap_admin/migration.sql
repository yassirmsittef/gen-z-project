-- Amorçage de la modération : le compte du fondateur devient ADMIN.
-- (Migration de données — la voie standard vers Neon, les secrets Vercel
-- étant « sensitive » et non lisibles hors build. Sans effet si l'email
-- n'existe pas, comme sur la base de dev.)
UPDATE "User"
SET "role" = 'ADMIN'
WHERE "email" IN ('yassirmsittef@icloud.com', 'yassir.msittef@icloud.com');
