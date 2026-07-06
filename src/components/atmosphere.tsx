/**
 * Couche atmosphérique globale (immersion « Igloo-tier ») : trois voiles
 * d'aurora en profondeur, un grain filmique et une vignette. Purement
 * décoratif (aria-hidden), sans interaction ; les animations sont coupées
 * par prefers-reduced-motion (règle globale dans globals.css).
 */
export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden>
      <div className="aurora aurora-1" />
      <div className="aurora aurora-2" />
      <div className="aurora aurora-3" />
      <div className="grain" />
      <div className="vignette" />
    </div>
  );
}
