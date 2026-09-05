"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

type Suggestion = { value: string; name: string; country: string };

/**
 * Saisie d'une ville avec suggestions : toutes les villes du monde de plus de
 * 5 000 habitants (GeoNames), cherchées CÔTÉ SERVEUR (/api/cities) — le jeu
 * pèse ~3 Mo, il ne descend jamais dans le navigateur. Le champ reste un
 * simple <input name="city"> : sans JavaScript, on tape sa ville et le serveur
 * la reconnaît quand même (findCity). La valeur choisie a la forme
 * « Ville — Pays », dans la langue du lecteur ; le serveur sait la relire.
 */
export function CityPicker({
  id,
  name = "city",
  defaultValue,
  placeholder,
  className,
  required,
}: {
  id: string;
  name?: string;
  defaultValue?: string | null;
  placeholder?: string;
  className?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chosen = useRef<string | null>(defaultValue ?? null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = value.trim();
    if (q.length < 2 || q === chosen.current) {
      setItems([]);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/cities?q=${encodeURIComponent(q)}`);
        const d = (await r.json()) as { cities?: Suggestion[] };
        setItems(d.cities ?? []);
        setOpen(true);
        setActive(-1);
      } catch {
        setItems([]);
      }
    }, 180);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  function choisir(s: Suggestion) {
    chosen.current = s.value;
    setValue(s.value);
    setItems([]);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        value={value}
        onChange={(e) => {
          chosen.current = null;
          setValue(e.target.value);
        }}
        onFocus={() => items.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!open || items.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, items.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            choisir(items[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && items.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={placeholder}
        className={className}
        required={required}
      />
      {open && items.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border/60 bg-card p-1 shadow-lg"
        >
          {items.map((s, i) => (
            <li key={`${s.name}|${s.country}|${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choisir(s)}
                className={`flex w-full items-baseline justify-between gap-3 rounded-lg px-3 py-2 text-start text-sm hover:bg-muted/60 ${i === active ? "bg-muted/60" : ""}`}
              >
                <span className="font-medium">{s.name}</span>
                <span className="truncate text-xs text-muted-foreground">{s.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
