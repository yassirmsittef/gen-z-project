-- Un fichier de stockage ne peut être référencé que par UNE ligne.
-- Sans ces index, un membre pouvait publier l'URL du témoignage d'un autre
-- puis retirer sa propre ligne : la suppression du fichier détruisait la
-- vidéo de la victime. Les mêmes octets pouvaient aussi être comptés
-- plusieurs fois dans la jauge de stockage.
-- PostgreSQL autorise autant de NULL qu'on veut dans un index unique : les
-- lignes retirées (url et posterUrl à NULL) ne se gênent pas entre elles.

-- CreateIndex
CREATE UNIQUE INDEX "CallVideo_url_key" ON "CallVideo"("url");

-- CreateIndex
CREATE UNIQUE INDEX "CallVideo_posterUrl_key" ON "CallVideo"("posterUrl");
