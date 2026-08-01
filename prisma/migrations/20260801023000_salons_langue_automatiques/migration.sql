-- Ouvre les salons d'accueil (langues) SANS intervention humaine.
--
-- Le bouton du panneau d'annuaire suppose une session ADMIN ; en production
-- personne ne doit dépendre d'une connexion réussie pour que la plateforme
-- ait une porte d'entrée dans sa langue. Ce bootstrap s'exécute au
-- déploiement (`prisma migrate deploy` du vercel-build).
--
-- Idempotent : `ON CONFLICT (slug) DO NOTHING` — un salon déjà ouvert (par le
-- bouton, par le seed) n'est ni dupliqué ni écrasé, et le texte de référence
-- reste LANGUAGE_ROOMS dans src/lib/constants.ts (recopié ici parce qu'une
-- migration SQL ne peut pas lire le TypeScript).
--
-- L'animateur est le plus ancien compte ADMIN ; à défaut d'ADMIN, le plus
-- ancien compte tout court (le fondateur, en pratique) — sans quoi rien ne
-- serait créé, ownerId étant obligatoire.

WITH equipe AS (
  SELECT "id"
  FROM "User"
  ORDER BY ("role" = 'ADMIN') DESC, "createdAt" ASC
  LIMIT 1
)
INSERT INTO "ChatGroup" ("id", "slug", "name", "purpose", "category", "ownerId", "official", "createdAt")
SELECT
  -- Identifiant déterministe : rejouer ce bootstrap ne peut pas créer de doublon.
  'salon' || md5(salon.slug),
  salon.slug,
  salon.name,
  salon.purpose,
  'AUTRE'::"ProjectCategory",
  equipe."id",
  true,
  NOW()
FROM (
  VALUES
    ('salon-francais', 'Français', 'Le salon francophone : présente-toi, demande un coup de main, trouve des collabs.'),
    ('salon-english', 'English', 'The English-speaking room: say hi, ask for a hand, find people to build with.'),
    ('salon-espanol', 'Español', 'La sala en español: preséntate, pide ayuda y encuentra colaboraciones.'),
    ('salon-deutsch', 'Deutsch', 'Der deutschsprachige Raum: stell dich vor, bitte um Hilfe, finde Mitstreiter.'),
    ('salon-italiano', 'Italiano', 'La stanza italiana: presentati, chiedi una mano, trova collaborazioni.'),
    ('salon-portugues', 'Português', 'A sala em português: apresenta-te, pede ajuda e encontra colaborações.'),
    ('salon-arabe', 'العربية', 'غرفة عربية: عرّف بنفسك، اطلب المساعدة، وابحث عن فرص تعاون.')
) AS salon(slug, name, purpose)
CROSS JOIN equipe
ON CONFLICT ("slug") DO NOTHING;

-- Un salon sans son animateur dedans serait un fil que personne ne lit :
-- on pose l'adhésion de l'animateur pour tout salon officiel qui en manque.
INSERT INTO "ChatGroupMember" ("groupId", "userId", "lastReadAt", "joinedAt")
SELECT "id", "ownerId", NOW(), NOW()
FROM "ChatGroup"
WHERE "official" = true
ON CONFLICT ("groupId", "userId") DO NOTHING;
