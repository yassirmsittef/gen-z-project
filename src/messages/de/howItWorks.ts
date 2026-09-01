import type { Messages } from "../types";

/** /comment-ca-marche: die vollständige Bedienungsanleitung — Ablauf, FAQ, CTA. */
export const howItWorks = {
  "meta.title": "So funktioniert's",
  "meta.description":
    "Erst beitragen, dann starten: Gelder im Treuhandkonto, Etappe für Etappe durch die Abstimmung der Unterstützer freigegeben, zurückerstattet, wenn nichts daraus wird.",
  "intro.label": "Die Bedienungsanleitung",
  "intro.title": "So funktioniert's",
  "intro.lead": "GeniGain beruht auf einer einfachen Idee:",
  "intro.highlight": "Das Geld folgt den Nachweisen",
  "intro.after":
    ". Man trägt bei, bevor man postet, die Gelder bleiben im Treuhandkonto, und erst die Abstimmung der Unterstützer gibt sie frei, Etappe für Etappe.",
  "stages.contributeTitle": "Trag zuerst bei",
  "stages.contributeChipMin": "ab {min} € / $ / …",
  "stages.contributeChipGate": "{gate} → Recht zu posten",
  "stages.contributeBody":
    "Hier kommt niemand einfach mit dem Hut in der Hand an: Man fängt damit an, andere zu unterstützen. Du trägst per Karte bei, in der Währung des Projekts. Jede Zahlung wird zum Tageskurs in Dollar umgerechnet und auf deinen Zähler addiert — bei {gate} zusammen bekommst du das Recht, dein eigenes Projekt zu starten.",
  "stages.launchTitle": "Starte dein Projekt",
  "stages.launchChipDuration": "{min}–{max} Tage",
  "stages.launchChipMilestones": "{min}–{max} Etappen",
  "stages.launchBody":
    "Ziel zwischen {minGoal} und {maxGoal} in der Währung deiner Wahl, Kampagne von {minDays} bis {maxDays} Tagen, und vor allem: ein Plan, zerlegt in {minMilestones} bis {maxMilestones} bezifferte Etappen, deren Summe genau das Ziel ergibt. Diese Zerlegung macht den Rest ehrlich — du bekommst nie alles auf einmal.",
  "stages.fundTitle": "Die Community finanziert",
  "stages.fundChipEscrow": "Treuhandkonto",
  "stages.fundChipRefund": "Rückerstattung, wenn es nicht klappt",
  "stages.fundBody":
    "Während der Kampagne sammeln sich die Beiträge im Treuhandkonto: Weder du noch sonst jemand rührt sie an. Ziel erreicht — die Sammlung endet und das Abenteuer beginnt. Ziel zum Stichtag verfehlt — jeder Unterstützer wird automatisch auf seine Karte zurückerstattet, abzüglich der Kartengebühren, die die Bank nicht erstattet (GeniGain behält keinen Cent davon).",
  "stages.proveTitle": "Beweise es, die Community stimmt ab",
  "stages.proveChipVote": "gewichtete Abstimmung",
  "stages.proveChipDays": "{days} Tage zur Umsetzung",
  "stages.proveBody":
    "Bei jeder Etappe veröffentlichst du einen Nachweis (Links, Bilder), und deine Unterstützer stimmen ab. Jede Stimme wiegt so viel wie der beigetragene Betrag: Die Mehrheit der Beträge entscheidet. Etappe bestätigt = Gelder der Etappe freigegeben. Wird dieselbe Etappe {attempts} Mal abgelehnt oder sind die {days} Tage um, stoppt das Projekt.",
  "stages.cashTitle": "Kassier — oder mach den Rebound",
  "stages.cashChipPayout": "Auszahlung pro Etappe",
  "stages.cashChipFee": "0 % Provision",
  "stages.cashChipProrata": "anteilig zurückerstattet",
  "stages.cashBody":
    "Jede bestätigte Etappe geht auf dein Stripe-Auszahlungskonto, abzüglich der Bankgebühren — GeniGain nimmt sich unterwegs nichts. Und wenn das Projekt auf halber Strecke stoppt? Was die Community bestätigt hat, bleibt dir; das gesamte restliche Treuhandkonto geht anteilig zurück an die Unterstützer — und die Community hilft dir, für die Fortsetzung wieder aufzustehen.",
  "faq.heading": "Die Fragen, die uns gestellt werden",
  "faq.investmentQ": "Ist das eine Geldanlage?",
  "faq.investmentA":
    "Nein. Ein Beitrag ist eine Unterstützung: Er gibt weder einen Anteil am Projekt noch Zinsen noch eine Rendite. Was du davon hast, liegt woanders: Du lässt Projekte entstehen, die du ausgesucht hast, weil sie dich packen oder dir nützen werden — die App, das Produkt, den Ort oder den Service, den du gern existieren sehen und dann selbst nutzen würdest. Du behältst ein Stimmrecht über ihre Etappen, baust dir deine Reputation in der Community auf und schaltest das Recht frei, dein eigenes Projekt zu starten.",
  "faq.costQ": "Was kostet das?",
  "faq.costA":
    "0 % GeniGain-Provision. Wer beiträgt, zahlt genau den Betrag, den er gewählt hat; die Bankgebühren (Stripe) werden von den Auszahlungen an die Projektträger abgezogen, wie auf jeder Plattform — GeniGain behält unterwegs nichts. Sollte eines Tages eine Provision kommen, wird sie vorher angekündigt, vor jeder Zahlung angezeigt und niemals rückwirkend erhoben.",
  "faq.feesQ": "Wer zahlt genau die Kartengebühren?",
  "faq.feesA":
    "Die Bearbeitungsgebühren werden von Stripe (dem Zahlungsdienstleister) festgelegt und hängen von deiner Karte und deinem Land ab — meist in der Größenordnung von 1,5 bis 3 %. GeniGain legt sie nicht fest, sieht sie nicht und schlägt nichts drauf. Konkret: Wenn du beiträgst, zahlst du genau deinen Betrag; die Gebühren zieht Stripe ein und rechnet sie von dem ab, was der Projektträger bekommt. Scheitert das Projekt und wirst du zurückerstattet, gibt Stripe die anfangs einbehaltene Gebühr nicht zurück — deine Rückerstattung ist also netto nach diesen Gebühren, und auch davon behält GeniGain nichts. Das ist der einzige „Preis“ eines Beitrags, und er landet nie in der Tasche der Plattform.",
  "faq.whoQ": "Wer kann mitmachen?",
  "faq.whoA":
    "Die Registrierung ist ab 15 Jahren offen. Um per Karte beizutragen oder eine Kampagne zu starten, musst du volljährig sein oder die Zustimmung deiner Erziehungsberechtigten haben.",
  "faq.vanishQ": "Und wenn der Projektträger einfach abtaucht?",
  "faq.vanishA":
    "Genau das verhindert das Treuhandkonto: Nicht freigegebene Gelder sind nie in seinen Händen. Ohne bestätigten Nachweis bewegt sich nichts — und nach {days} Tagen geht alles, was keine Abstimmung freigegeben hat, automatisch zurück an die Unterstützer (abzüglich der Kartengebühren, die die Bank nicht erstattet).",
  "faq.payoutQ": "Wie bekomme ich als Projektträger meine Gelder?",
  "faq.payoutA":
    "Über Stripe Connect: Du legst dein Auszahlungskonto in deinem Dashboard an und durchläufst die Identitätsprüfung von Stripe. Jede bestätigte Etappe wird danach automatisch überwiesen, in der Währung deines Projekts. Eine bestätigte Etappe bleibt dir geschuldet, solange dein Konto noch nicht bereit ist.",
  "faq.realMoneyQ": "Ist das echtes Geld?",
  "faq.realMoneyALive":
    "Ja. Die Zahlungen sind echt und durch Stripe gesichert: Dein Beitrag wird wirklich abgebucht, ins Treuhandkonto gelegt und dem Projektträger Etappe für Etappe freigegeben, je nach Abstimmung der Unterstützer. GeniGain sieht und speichert deine Kartennummer nie.",
  "faq.realMoneyATest":
    "Die Mechanik ist von Anfang bis Ende echt, aber die Plattform ist in der Testphase: Die Stripe-Zahlungen laufen im Testmodus, keine Karte wird wirklich belastet. Die Öffnung für echte Zahlungen wird klar angekündigt.",
  "legal.before": "Die juristische Fassung dieser Regeln steht in den",
  "legal.link": "Nutzungsbedingungen",
  "legal.after": ".",
  "cta.discover": "Projekte entdecken",
  "cta.register": "Konto erstellen",
} satisfies Messages["howItWorks"];
