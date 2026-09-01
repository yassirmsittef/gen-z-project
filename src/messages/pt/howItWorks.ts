import type { Messages } from "../types";

/** /comment-ca-marche: o manual completo — trajetória, FAQ, CTA. */
export const howItWorks = {
  "meta.title": "Como funciona",
  "meta.description":
    "Contribui primeiro, lança depois: fundos em custódia, desbloqueados etapa a etapa pelo voto dos contribuidores, reembolsados se não vingar.",
  "intro.label": "O manual",
  "intro.title": "Como funciona",
  "intro.lead": "A GeniGain assenta numa ideia simples:",
  "intro.highlight": "o dinheiro segue as provas",
  "intro.after":
    ". Contribui-se antes de publicar, os fundos ficam em custódia, e é o voto dos contribuidores que os desbloqueia, etapa a etapa.",
  "stages.contributeTitle": "Contribui primeiro",
  "stages.contributeChipMin": "a partir de {min} € / $ / …",
  "stages.contributeChipGate": "{gate} → direito de publicar",
  "stages.contributeBody":
    "Aqui ninguém aparece a pedir sem ter dado: começa-se por apoiar os outros. Contribuis por cartão, na moeda do projeto. Cada pagamento é convertido em dólares à taxa do dia e soma-se ao teu contador — aos {gate} acumulados, ganhas o direito de lançar o teu próprio projeto.",
  "stages.launchTitle": "Lança o teu projeto",
  "stages.launchChipDuration": "{min}–{max} dias",
  "stages.launchChipMilestones": "{min}–{max} etapas",
  "stages.launchBody":
    "Objetivo entre {minGoal} e {maxGoal} na moeda que escolheres, campanha de {minDays} a {maxDays} dias e, sobretudo: um plano dividido em {minMilestones} a {maxMilestones} etapas com valores cuja soma dá o objetivo. É esta divisão que torna o resto honesto — nunca recebes tudo de uma vez.",
  "stages.fundTitle": "A comunidade financia",
  "stages.fundChipEscrow": "custódia",
  "stages.fundChipRefund": "reembolso se falhar",
  "stages.fundBody":
    "Durante a campanha, as contribuições acumulam-se em custódia: nem tu nem ninguém lhes toca. Objetivo alcançado — a recolha para e a aventura começa. Objetivo falhado no prazo — cada contribuidor é reembolsado automaticamente no cartão, líquido das taxas de cartão que o banco não devolve (a GeniGain não fica com nenhuma).",
  "stages.proveTitle": "Prova, a comunidade vota",
  "stages.proveChipVote": "voto ponderado",
  "stages.proveChipDays": "{days} dias para concretizar",
  "stages.proveBody":
    "A cada etapa, publicas uma prova (links, imagens) e os teus contribuidores votam. Cada voz pesa o montante contribuído: a maioria dos montantes decide. Etapa validada = fundos da etapa desbloqueados. A mesma etapa recusada {attempts} vezes, ou passados os {days} dias, e o projeto para.",
  "stages.cashTitle": "Recebe — ou ressalta",
  "stages.cashChipPayout": "transferência por etapa",
  "stages.cashChipFee": "0 % de comissão",
  "stages.cashChipProrata": "proporção reembolsada",
  "stages.cashBody":
    "Cada etapa validada segue para a tua conta de transferências Stripe, líquida das taxas bancárias — a GeniGain não fica com nada pelo caminho. E se o projeto parar a meio? O que a comunidade validou fica-te garantido, toda a custódia restante volta proporcionalmente para os contribuidores — e a comunidade ajuda-te a ressaltar para o que vem a seguir.",
  "faq.heading": "As perguntas que nos fazem",
  "faq.investmentQ": "Isto é um investimento?",
  "faq.investmentA":
    "Não. Uma contribuição é um apoio: não dá parte do projeto, nem juros, nem rendimento financeiro. O que ganhas está noutro sítio: fazes nascer projetos que escolheste porque te falam ou te serão úteis — a app, o produto, o lugar ou o serviço que gostavas de ver existir e de que vais usufruir quando cá estiver. Guardas direito de voto sobre as suas etapas, constróis a tua reputação na comunidade e desbloqueias o direito de lançar o teu.",
  "faq.costQ": "Quanto custa?",
  "faq.costA":
    "0 % de comissão GeniGain. Quem contribui paga exatamente o montante que escolheu; as taxas bancárias (Stripe) são deduzidas das transferências para quem leva o projeto, como em qualquer plataforma — a GeniGain não fica com nada pelo caminho. Se um dia houver comissão, será anunciada com antecedência, mostrada antes de cada pagamento e nunca retroativa.",
  "faq.feesQ": "Quem paga as taxas de cartão, exatamente?",
  "faq.feesA":
    "As taxas de processamento são fixadas pela Stripe (o prestador de pagamentos) e variam consoante o teu cartão e o teu país — em geral, na ordem de 1,5 a 3 %. A GeniGain não as fixa, não as vê e não acrescenta nenhuma. Na prática: quando contribuis, pagas exatamente o teu montante; as taxas são cobradas pela Stripe e deduzidas do que recebe quem leva o projeto. Se o projeto falhar e fores reembolsado, a Stripe não devolve a comissão que cobrou à partida — o teu reembolso é, portanto, líquido dessas taxas, e também aqui a GeniGain não fica com nenhuma. É o único «custo» de uma contribuição, e nunca vai para o bolso da plataforma.",
  "faq.whoQ": "Quem pode participar?",
  "faq.whoA":
    "O registo está aberto a partir dos 15 anos. Para contribuir por cartão ou lançar uma campanha, é preciso ser maior de idade ou ter o acordo do teu representante legal.",
  "faq.vanishQ": "E se quem leva o projeto desaparecer sem deixar rasto?",
  "faq.vanishA":
    "É exatamente isso que a custódia impede: os fundos por desbloquear nunca estão nas mãos dessa pessoa. Sem prova validada, nada se mexe — e ao fim de {days} dias, tudo o que não foi desbloqueado por um voto volta automaticamente para os contribuidores (líquido das taxas de cartão, que o banco não devolve).",
  "faq.payoutQ": "Como recebo os meus fundos se sou eu a levar o projeto?",
  "faq.payoutA":
    "Através da Stripe Connect: crias a tua conta de transferências a partir do teu painel e passas a verificação de identidade da Stripe. Cada etapa validada é depois transferida automaticamente, na moeda do teu projeto. Uma etapa validada continua em dívida enquanto a tua conta não estiver pronta.",
  "faq.realMoneyQ": "Isto é dinheiro a sério?",
  "faq.realMoneyALive":
    "Sim. Os pagamentos são reais e protegidos pela Stripe: a tua contribuição é mesmo debitada, colocada em custódia e libertada etapa a etapa a quem leva o projeto, conforme o voto dos contribuidores. A GeniGain nunca vê nem guarda o número do teu cartão.",
  "faq.realMoneyATest":
    "A mecânica é real de ponta a ponta, mas a plataforma está em fase de teste: os pagamentos Stripe correm em modo de teste, nenhum cartão é realmente debitado. A abertura dos pagamentos reais será anunciada com clareza.",
  "legal.before": "A versão jurídica destas regras vive nas",
  "legal.link": "condições de utilização",
  "legal.after": ".",
  "cta.discover": "Descobrir projetos",
  "cta.register": "Criar a minha conta",
} satisfies Messages["howItWorks"];
