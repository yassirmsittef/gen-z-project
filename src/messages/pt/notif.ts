import type { Messages } from "../types";

export const notif = {
  "contribution.received.title": "{actor} apoiou «{projectTitle}» ({money})",

  "contribution.confirmed.title": "A tua contribuição de {money} a «{projectTitle}» está confirmada",
  "contribution.confirmed.body":
    "Os fundos entram na custódia do projeto: serão libertados etapa a etapa, sob o controlo do voto dos contribuidores — incluindo o teu. Se o projeto não vingar, a parte não libertada volta automaticamente ao teu cartão.",

  "refund.lateClose.title": "A tua contribuição a «{projectTitle}» chegou após o fecho",
  "refund.lateClose.body":
    "A campanha terminou entretanto: a tua contribuição volta ao teu cartão, líquida das taxas de cartão que o banco não devolve (a GeniGain não fica com nenhuma).",

  "refund.projectFailed.title": "Reembolso de {money} — «{projectTitle}»",
  "refund.projectFailed.body":
    "A campanha não vingou: a tua parte da custódia restante volta ao teu cartão (alguns dias conforme o banco), líquida das taxas de cartão que o banco não devolve — a GeniGain não fica com nenhuma.",

  "projectFunded.owner.title": "Objetivo alcançado para «{projectTitle}»!",
  "projectFunded.owner.body":
    "A recolha terminou — envia a prova da etapa 1 para desbloquear os primeiros fundos.",

  "projectFunded.supporter.title": "«{projectTitle}» está financiado!",
  "projectFunded.supporter.body":
    "Os fundos serão libertados etapa a etapa, sob o controlo dos contribuidores.",

  "proofToVote.title": "Prova a examinar — «{projectTitle}»",
  "proofToVote.body": "Etapa {order}: {milestoneTitle}. O teu voto desbloqueia (ou não) os fundos.",

  "milestoneReleased.next.title": "Etapa {order} validada — {money} libertados",
  "milestoneReleased.next.body":
    "A comunidade validou a tua prova para «{projectTitle}». Próxima etapa: «{nextTitle}». A transferência segue para a tua conta Stripe.",

  "milestoneReleased.final.title": "Etapa {order} validada — {money} libertados",
  "milestoneReleased.final.body":
    "«{projectTitle}» está totalmente concretizado. Parabéns! A transferência final segue para a tua conta Stripe.",

  "proofRejected.title": "Prova recusada — «{projectTitle}»",
  "proofRejected.body": {
    one: "Etapa {order}: a comunidade não validou. Resta-te {count} tentativa — reforça a tua prova (fotos, links públicos).",
    other:
      "Etapa {order}: a comunidade não validou. Restam-te {count} tentativas — reforça a tua prova (fotos, links públicos).",
  },

  "projectFailed.owner.title": "«{projectTitle}» não vingou",
  "projectFailed.owner.body":
    "{reason} O falhanço não é uma saída: esperam-te oportunidades no percurso de ressalto.",

  "failReason.stoppedByOwner": "Projeto parado por quem o levava.",
  "failReason.goalNotReached": "Objetivo não alcançado antes do fim da campanha.",
  "failReason.proofsRefused": "As provas de progresso foram recusadas pela comunidade.",
  "failReason.milestonesNotRealized":
    "Etapas não concretizadas nos {days} dias após o financiamento.",

  "boycottAnswered.title": "Um substituto para {target}",
  "boycottAnswered.body": "«{projectTitle}» lança-se para substituir {target}.",

  "boycottRemoved.title": "O teu apelo foi removido",
  "boycottRemoved.body": "«{target}» — {reason}.",
  "boycottRemoved.defaultReason": "não conforme com a carta dos apelos",

  "callComment.title": "{actor} respondeu ao teu apelo sobre {target}",
  "callComment.body": "{excerpt}",

  "callVideo.new.title": "{actor} filmou um testemunho sobre {target}",
  "callVideo.new.body": "{excerpt}",

  "callVideo.removed.title": "O teu testemunho filmado foi removido",
  "callVideo.removed.body": "{excerpt}",

  "storageAlert.warn.title": "Armazenamento alojado a {warnPct}% ({usedMo} MB de {capMo} MB)",
  "storageAlert.warn.body":
    "O armazém (testemunhos do direto E fotos de perfil) aproxima-se do teto. O cockpit mostra a repartição. Faz limpeza, ou sobe o teto do alojamento antes que recuse os envios.",

  "storageAlert.full.title":
    "Armazenamento alojado saturado ({usedMo} MB de {capMo} MB) — os envios são recusados",
  "storageAlert.full.body":
    "O próximo testemunho arriscaria ultrapassar o teto: a entrega de tokens de upload está suspensa até haver espaço livre.",

  "groupMessage.title": "{actor} escreveu em {groupName}",

  "comment.title": "{actor} comentou «{projectTitle}»",
  "comment.body": "{excerpt}",

  "projectUpdate.title": "Novidade de «{projectTitle}»: {updateTitle}",

  "message.new.title": "Nova mensagem de {actor}",

  "partnership.request.title": "Pedido de parceria de {brandName}",
  "partnership.request.body": "Para «{projectTitle}». O copiloto IA preparou a sua análise.",

  "partnership.requestBudget.title": "Pedido de parceria de {brandName}",
  "partnership.requestBudget.body":
    "Para «{projectTitle}» · {budgetUsd} $ propostos. O copiloto IA preparou a sua análise.",

  "tombstone.CALL_VIDEO": "Este testemunho foi removido.",
  "tombstone.CALL_COMMENT": "Esta resposta foi removida.",
  "tombstone.COMMENT": "Este comentário foi removido.",
} satisfies Messages["notif"];
