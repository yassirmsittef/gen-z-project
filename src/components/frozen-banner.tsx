import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { FEATURES_FROZEN } from "@/lib/launch";

/** Le bandeau d'avant-lancement, sur toutes les pages : la transparence d'abord. */
export async function FrozenBanner() {
  if (!FEATURES_FROZEN) return null;
  const t = await getT("common");
  return (
    <div className="border-b border-primary/20 bg-primary/10">
      <p className="mx-auto max-w-6xl px-4 py-2 text-center text-xs text-foreground/90 sm:text-sm">
        {t("frozen.banner")}{" "}
        <Link href="/chat" className="font-semibold text-primary underline-offset-4 hover:underline">
          {t("frozen.chat")}
        </Link>
      </p>
    </div>
  );
}
