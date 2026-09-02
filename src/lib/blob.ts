import { del, head, list } from "@vercel/blob";
import { VIDEO_BLOB_PREFIX } from "@/lib/constants";

/**
 * Fichiers que NOUS hébergeons sur Vercel Blob, par opposition aux URL
 * collées par les membres (visuel de projet pointant vers un domaine tiers).
 * On ne supprime jamais ce qu'on n'héberge pas.
 */
/**
 * Trouvé par l'audit : « contient ".blob.vercel-storage.com/" » n'est pas un
 * test d'hôte. `https://evil.example/?x=.blob.vercel-storage.com/` passait,
 * et `https://X.PUBLIC.BLOB.VERCEL-STORAGE.COM/…` (une majuscule) déjouait
 * l'unicité tout en restant « à nous » — de quoi accrocher, puis détruire, le
 * témoignage d'un autre. On lit l'URL comme le navigateur : schéma https,
 * hôte NORMALISÉ, suffixe exact précédé d'un sous-domaine.
 */
export function isOwnBlob(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(u.hostname);
  } catch {
    return false;
  }
}

/** La même URL, écrite d'une seule façon : hôte en minuscules, sans query
 *  ni fragment — c'est sous cette forme qu'on la stocke et qu'on la compare,
 *  sinon « ?v=1 » suffit à faire passer un fichier pour un autre. */
export function canonicalBlobUrl(url: string): string {
  const u = new URL(url);
  return `${u.protocol}//${u.hostname.toLowerCase()}${u.pathname}`;
}

/**
 * Un fichier du DOSSIER DES TÉMOIGNAGES, et pas seulement du magasin.
 *
 * Vérifier l'hôte ne suffit pas : les photos de profil vivent dans le même
 * magasin, sous `avatars/`. Sans contrôle de dossier, un membre pouvait
 * soumettre l'URL de la photo de quelqu'un comme vidéo ou comme vignette —
 * elle passait l'unicité (qui n'interroge que les témoignages) et la mesure
 * (qui réussit, puisque le fichier est bien à nous), s'affichait sur le fil,
 * puis DISPARAISSAIT du profil de la victime au premier retrait.
 */
export function isVideoBlob(url: string | null | undefined): url is string {
  if (!isOwnBlob(url)) return false;
  try {
    return new URL(url).pathname.startsWith(`/${VIDEO_BLOB_PREFIX}`);
  } catch {
    return false;
  }
}

/**
 * Efface un fichier qu'on héberge — best-effort et JAMAIS dans une
 * transaction : c'est un appel réseau, son échec ne doit pas annuler
 * l'écriture en base qui l'accompagne. Un blob orphelin se rattrape ; une
 * transaction annulée à cause du réseau, non.
 */
export async function deleteOwnBlob(url: string | null | undefined): Promise<void> {
  if (!isOwnBlob(url)) return;
  try {
    await del(url);
  } catch (error) {
    console.error("[blob] suppression impossible", url, error);
  }
}

/**
 * Taille réelle d'un fichier qu'on héberge, lue AUPRÈS DU STOCKAGE — jamais
 * déclarée par le client : c'est cette valeur qui alimente la jauge du
 * plafond global, elle doit être opposable. Best-effort comme la
 * suppression : null si la mesure échoue (la jauge sous-compte alors un peu,
 * et le log en garde la trace).
 */
export async function statOwnBlob(url: string | null | undefined): Promise<number | null> {
  if (!isOwnBlob(url)) return null;
  try {
    return (await head(url)).size;
  } catch (error) {
    console.error("[blob] taille illisible", url, error);
    return null;
  }
}

/**
 * Parcourt un dossier du magasin et rend les fichiers qui y dorment, page par
 * page. Sortie paresseuse : un magasin de plusieurs milliers de fichiers ne
 * tient pas forcément en mémoire, et l'appelant s'arrête quand il veut.
 */
export async function* listOwnBlobs(...prefixes: string[]) {
  for (const prefix of prefixes) {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      for (const blob of page.blobs) yield blob;
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  }
}
