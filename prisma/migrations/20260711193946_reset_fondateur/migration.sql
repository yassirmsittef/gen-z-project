-- Déblocage du compte fondateur (mot de passe oublié, pas encore de reset
-- par email) : mot de passe temporaire à changer IMMÉDIATEMENT après
-- connexion (Dashboard → Sécurité). Le hash ci-dessous meurt à ce moment-là.
UPDATE "User"
SET "passwordHash" = '$2a$10$h4stS5EZRcyPK11/XiuDvONe8gRgnpEdCopcdyOH757kEuB1RTXqW'
WHERE "email" IN ('yassirmsittef@icloud.com', 'yassir.msittef@icloud.com');
