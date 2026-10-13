"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lock } from "lucide-react";
import { FrozenNotice } from "@/components/frozen-notice";
import { useT } from "@/components/i18n-provider";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Un bouton d'action fermé avant le lancement (voir lib/launch) : il reste à
 * sa place, avec un cadenas, et un appui explique POURQUOI au lieu de mener à
 * une page vide. La fenêtre passe par un portail : la transition de page pose
 * un transform qui casserait un position: fixed.
 */
export function LockedButton({
  variant,
  size,
  className,
  children,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  children: React.ReactNode;
}) {
  const t = useT("common");
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant={variant}
        size={size}
        className={className}
        title={t("frozen.locked")}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Lock aria-hidden />
        {children}
      </Button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="w-full max-w-md space-y-3 rounded-3xl border border-white/[0.12] bg-card p-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <span id={titleId} className="sr-only">{t("frozen.title")}</span>
              <FrozenNotice />
              <div className="flex justify-end px-2 pb-1">
                <Button ref={closeRef} type="button" size="sm" onClick={() => setOpen(false)}>
                  {t("frozen.close")}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
