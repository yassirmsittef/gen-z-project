"use client";

/**
 * Dernier filet : quand c'est le layout racine lui-même qui casse, plus rien
 * n'est monté — ni providers, ni dictionnaire. Cette page se suffit donc à
 * elle-même (html, body, styles en ligne) et parle deux langues à la fois,
 * faute de savoir laquelle lit le visiteur. Elle ne dit rien de l'erreur.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0b0d12",
          color: "#e6e8ef",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p style={{ fontSize: 12, letterSpacing: "0.14em", opacity: 0.6 }}>500</p>
          <h1 style={{ fontSize: 22, margin: "0.5rem 0" }}>Quelque chose a cassé de notre côté.</h1>
          <p style={{ fontSize: 14, opacity: 0.8 }}>
            Rien de ce que tu as fait n&apos;est en cause. Réessaie ; si ça persiste, écris-nous à
            bonjour@genigain.com.
          </p>
          <p style={{ fontSize: 14, opacity: 0.6, marginTop: "1rem" }}>
            Something broke on our side — nothing you did caused it. Try again, or write to
            bonjour@genigain.com.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1rem",
              padding: "0.6rem 1.4rem",
              borderRadius: 999,
              border: "1px solid rgba(120,200,255,0.4)",
              background: "rgba(120,200,255,0.12)",
              color: "#9fd6ff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Réessayer · Try again
          </button>
        </div>
      </body>
    </html>
  );
}
