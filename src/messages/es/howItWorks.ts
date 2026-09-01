import type { Messages } from "../types";

/** /comment-ca-marche: el manual completo — trayectoria, FAQ, CTA. */
export const howItWorks = {
  "meta.title": "Cómo funciona",
  "meta.description":
    "Contribuye primero, lanza después: fondos en depósito, desbloqueados etapa por etapa por el voto de los contribuyentes, reembolsados si no sale adelante.",
  "intro.label": "El manual",
  "intro.title": "Cómo funciona",
  "intro.lead": "GeniGain se apoya en una idea simple:",
  "intro.highlight": "el dinero sigue a las pruebas",
  "intro.after":
    ". Se contribuye antes de publicar, los fondos quedan en depósito, y es el voto de los contribuyentes el que los desbloquea, etapa por etapa.",
  "stages.contributeTitle": "Contribuye primero",
  "stages.contributeChipMin": "desde {min} € / $ / …",
  "stages.contributeChipGate": "{gate} → derecho a publicar",
  "stages.contributeBody":
    "Aquí nadie llega con su hucha por delante: se empieza apoyando a los demás. Contribuyes con tarjeta, en la divisa del proyecto. Cada pago se convierte a dólares al tipo de cambio del día y se suma a tu contador — con {gate} acumulados, ganas el derecho a lanzar tu propio proyecto.",
  "stages.launchTitle": "Lanza tu proyecto",
  "stages.launchChipDuration": "{min}–{max} días",
  "stages.launchChipMilestones": "{min}–{max} etapas",
  "stages.launchBody":
    "Objetivo entre {minGoal} y {maxGoal} en la divisa que elijas, campaña de {minDays} a {maxDays} días, y sobre todo: un plan dividido en {minMilestones} a {maxMilestones} etapas con su importe, cuya suma da el objetivo. Ese reparto es lo que hace honesto todo lo demás — nunca recibes todo de golpe.",
  "stages.fundTitle": "La comunidad financia",
  "stages.fundChipEscrow": "depósito",
  "stages.fundChipRefund": "reembolso si no sale",
  "stages.fundBody":
    "Durante la campaña, las contribuciones se acumulan en depósito: ni tú ni nadie las toca. Objetivo alcanzado: la recaudación se detiene y empieza la aventura. Objetivo fallido al vencimiento: cada contribuyente es reembolsado automáticamente en su tarjeta, neto de las comisiones de tarjeta que el banco no devuelve (GeniGain no se queda ninguna).",
  "stages.proveTitle": "Demuestra, la comunidad vota",
  "stages.proveChipVote": "voto ponderado",
  "stages.proveChipDays": "{days} días para realizarlo",
  "stages.proveBody":
    "En cada etapa publicas una prueba (enlaces, imágenes) y tus contribuyentes votan. Cada voz pesa lo que ha contribuido: la mayoría de los importes decide. Etapa validada = fondos de la etapa liberados. Una misma etapa rechazada {attempts} veces, o los {days} días agotados, y el proyecto se detiene.",
  "stages.cashTitle": "Cobra — o rebota",
  "stages.cashChipPayout": "transferencia por etapa",
  "stages.cashChipFee": "0 % de comisión",
  "stages.cashChipProrata": "prorrata reembolsada",
  "stages.cashBody":
    "Cada etapa validada sale hacia tu cuenta de transferencias Stripe, neta de las tarifas bancarias — GeniGain no se queda nada por el camino. ¿Y si el proyecto se detiene a mitad? Lo que la comunidad ha validado es tuyo, todo el depósito restante vuelve a prorrata a los contribuyentes — y la comunidad te ayuda a rebotar hacia lo siguiente.",
  "faq.heading": "Las preguntas que nos hacéis",
  "faq.investmentQ": "¿Es una inversión?",
  "faq.investmentA":
    "No. Una contribución es un apoyo: no da parte del proyecto, ni intereses, ni rendimiento financiero. Lo que ganas está en otro sitio: haces nacer proyectos que has elegido porque te llegan o porque te serán útiles — la app, el producto, el lugar o el servicio que te gustaría ver existir y del que disfrutarás cuando esté. Conservas el derecho a votar sus etapas, construyes tu reputación en la comunidad y desbloqueas el derecho a lanzar el tuyo.",
  "faq.costQ": "¿Cuánto cuesta?",
  "faq.costA":
    "0 % de comisión GeniGain. El contribuyente paga exactamente el importe que ha elegido; las tarifas bancarias (Stripe) se deducen de las transferencias a quien lleva el proyecto, como en cualquier plataforma — GeniGain no se queda nada por el camino. Si algún día llega una comisión, se anunciará por adelantado, se mostrará antes de cada pago y nunca será retroactiva.",
  "faq.feesQ": "¿Quién paga exactamente las comisiones de tarjeta?",
  "faq.feesA":
    "Las comisiones de procesamiento las fija Stripe (el proveedor de pago) y varían según tu tarjeta y tu país — en general del orden del 1,5 al 3 %. GeniGain no las fija, no las ve y no añade ninguna. En concreto: cuando contribuyes, pagas exactamente tu importe; las comisiones las cobra Stripe y se deducen de lo que recibe quien lleva el proyecto. Si el proyecto fracasa y se te reembolsa, Stripe no devuelve la comisión que cobró al principio — tu reembolso es, por tanto, neto de esas comisiones, y también ahí GeniGain no se queda ninguna. Es el único «coste» de una contribución, y nunca acaba en el bolsillo de la plataforma.",
  "faq.whoQ": "¿Quién puede participar?",
  "faq.whoA":
    "El registro está abierto a partir de los 15 años. Para contribuir con tarjeta o lanzar una campaña hay que ser mayor de edad o contar con el permiso de tu representante legal.",
  "faq.vanishQ": "¿Y si quien lleva el proyecto desaparece del mapa?",
  "faq.vanishA":
    "Es exactamente lo que impide el depósito: los fondos no desbloqueados nunca están en sus manos. Sin prueba validada, no se mueve nada — y al cabo de {days} días, todo lo que no se haya desbloqueado por un voto vuelve automáticamente a los contribuyentes (neto de las comisiones de tarjeta, que el banco no devuelve).",
  "faq.payoutQ": "¿Cómo recibo mis fondos si llevo un proyecto?",
  "faq.payoutA":
    "Con Stripe Connect: creas tu cuenta de transferencias desde tu panel y pasas la verificación de identidad de Stripe. Cada etapa validada se transfiere después automáticamente, en la divisa de tu proyecto. Una etapa validada sigue debiéndose mientras tu cuenta no esté lista.",
  "faq.realMoneyQ": "¿Es dinero de verdad?",
  "faq.realMoneyALive":
    "Sí. Los pagos son reales y están protegidos por Stripe: tu contribución se cobra de verdad, se coloca en depósito y se libera a quien lleva el proyecto etapa por etapa según el voto de los contribuyentes. GeniGain nunca ve ni guarda el número de tu tarjeta.",
  "faq.realMoneyATest":
    "La mecánica es real de principio a fin, pero la plataforma está en fase de pruebas: los pagos de Stripe funcionan en modo de prueba, no se cobra realmente ninguna tarjeta. La apertura de los pagos reales se anunciará con claridad.",
  "legal.before": "La versión jurídica de estas reglas vive en las",
  "legal.link": "condiciones de uso",
  "legal.after": ".",
  "cta.discover": "Descubrir los proyectos",
  "cta.register": "Crear mi cuenta",
} satisfies Messages["howItWorks"];
