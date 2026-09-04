import { adminPages } from "./adminPages";
import { authPages } from "./authPages";
import { callsPages } from "./callsPages";
import { communityPages } from "./communityPages";
import { home } from "./home";
import { howItWorks } from "./howItWorks";
import { legalPages } from "./legalPages";
import { memberPages } from "./memberPages";
import { projectsPages } from "./projectsPages";
import { rebound } from "./rebound";
import { account } from "./account";
import { calls } from "./calls";
import { chat } from "./chat";
import { project } from "./project";
import { ui } from "./ui";
import type { Messages } from "../types";
import { email } from "./email";
import { err } from "./err";
import { labels } from "./labels";
import { meta } from "./meta";
import { nav } from "./nav";
import { notif } from "./notif";
import { v } from "./v";

export const de = {
  email,
  err,
  account,
  adminPages,
  authPages,
  callsPages,
  communityPages,
  home,
  howItWorks,
  legalPages,
  memberPages,
  projectsPages,
  rebound,
  calls,
  chat,
  project,
  ui,
  common: {
    "support.link": "GeniGain unterstützen",
    "support.title": "GeniGain unterstützen",
    "support.lead": "GeniGain ist eine Plattform mit 0 % Provision: sie nimmt den Projekten nichts. Um zu leben und zu wachsen, zählt sie auf die, die an die Idee glauben.",
    "support.what": "Was deine Unterstützung finanziert: die Entwicklung und Sicherheit der Plattform, dann Orte in den Städten, um die zu begleiten, die anfangen — ein Ort zum Arbeiten, Lernen und um seine Unterstützer·innen zu treffen.",
    "support.surplus": "Verpflichtung: alles, was über den Bedarf der Plattform hinausgeht, fließt in die Finanzierung der Projekte anderer Mitglieder.",
    "support.direct": "Anders als Projekte hat diese Unterstützung weder Etappen noch Treuhand: sie ist eine Spende an die Plattform, direkt auf ihrem Konto.",
    "support.total": "Bisher erhalten: {amount}",
    "support.amountLabel": "Betrag (CHF)",
    "support.button": "Unterstützen",
    "support.pending": "Weiterleitung zur Zahlung…",
    "support.thanks": "Danke! Deine Unterstützung ist angekommen.",
    "support.cancelled": "Zahlung abgebrochen — nichts wurde belastet.",
    "support.login": "Melde dich an, um GeniGain zu unterstützen.",
    "support.unlock": "Und es öffnet eine Tür: GeniGain zu unterstützen zählt als Beitrag und schaltet dein Recht frei, dein eigenes Projekt zu starten.",
    someone: "Jemand",
    justNow: "gerade eben",
  },
  labels,
  meta,
  nav,
  notif,
  v,
} satisfies Messages;
