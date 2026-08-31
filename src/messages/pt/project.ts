import type { Messages } from "../types";

/**
 * Namespace `project` — criação/edição de projeto, contribuição, etapas de
 * desbloqueio (linha do tempo + provas), cockpit de campanha, botões de
 * paragem e de retirada, comentários, novidades, seguir, cartão de projeto.
 * (Os rótulos partilhados CATEGORY_LABELS / STATUS_LABELS ficam nas suas
 * constantes — ver lote dedicado.)
 */
export const project = {
  // ——— CreateProjectForm ———
  "createProjectForm.answersCallLabel": "Estás a responder a um apelo",
  "createProjectForm.replaceTarget": "Substituir {target}",
  "createProjectForm.quotedWanted": "«{wanted}»",
  "createProjectForm.answersCallHelp":
    "É o caderno de encargos escrito por quem lançou o apelo. O teu projeto será declarado substituto logo na criação, e todos os apoiantes do apelo serão avisados.",
  "createProjectForm.projectSection": "O teu projeto",
  "createProjectForm.titleLabel": "Título",
  "createProjectForm.titlePlaceholder": "Ex.: EP de 5 faixas — LUA NEGRA",
  "createProjectForm.pitchLabel": "Pitch (140 caracteres máx.)",
  "createProjectForm.pitchPlaceholder": "Uma frase que dê vontade de te financiar.",
  "createProjectForm.descriptionLabel": "Descrição",
  "createProjectForm.descriptionPlaceholder":
    "Conta: o que é, para quem, porquê tu, e para que servirá o dinheiro (mín. 50 caracteres).",
  "createProjectForm.categoryLabel": "Categoria",
  "createProjectForm.categoryPlaceholder": "Escolher…",
  "createProjectForm.currencyLabel": "Moeda do projeto",
  "createProjectForm.goalLabel": "Objetivo ({currency})",
  "createProjectForm.durationLabel": "Duração da campanha ({min}–{max} dias)",
  "createProjectForm.skillsLabel": "Competências procuradas (opcional)",
  "createProjectForm.skillsPlaceholder": "ex.: edição, mistura, foto — separadas por vírgulas",
  "createProjectForm.skillsHelp": "Encaminhamos para o teu projeto os membros com estas competências.",
  "createProjectForm.coverLabel": "Imagem de capa (URL, opcional)",
  "createProjectForm.milestonesSection": "Etapas de desbloqueio",
  "createProjectForm.milestonesHelp":
    "Cada etapa desbloqueia um montante em {currency}, mediante prova validada pelo voto ponderado dos teus contribuidores. A soma deve igualar o teu objetivo. Uma vez financiado, tens {days} dias para concretizar tudo e obter validação — depois disso, o resto da custódia é reembolsado aos contribuidores.",
  "createProjectForm.milestonesHelpStrong": "0 % de comissão GeniGain",
  "createProjectForm.milestonesHelpAfterStrong":
    "— apenas as taxas bancárias são deduzidas das transferências.",
  "createProjectForm.milestoneNumber": "Etapa {number}",
  "createProjectForm.removeMilestoneTitle": "Eliminar esta etapa",
  "createProjectForm.milestoneTitleLabel": "Título",
  "createProjectForm.milestoneTitlePlaceholder": "Ex.: Maquete terminada",
  "createProjectForm.milestoneAmountLabel": "Montante ({currency})",
  "createProjectForm.milestoneDeliverableLabel": "O que vais entregar",
  "createProjectForm.milestoneDeliverablePlaceholder":
    "O que os contribuidores poderão verificar nesta etapa.",
  "createProjectForm.addMilestone": "Adicionar uma etapa",
  "createProjectForm.submitPending": "A criar…",
  "createProjectForm.submit": "Lançar o meu projeto",

  // ——— EditProjectForm ———
  "editProjectForm.titleLabel": "Título",
  "editProjectForm.titleHelp":
    "O endereço da página não muda: os links já partilhados continuam a funcionar.",
  "editProjectForm.pitchLabel": "Pitch (140 caracteres máx.)",
  "editProjectForm.descriptionLabel": "Descrição",
  "editProjectForm.categoryLabel": "Categoria",
  "editProjectForm.coverLabel": "Imagem de capa (URL, opcional)",
  "editProjectForm.skillsLabel": "Competências procuradas (opcional)",
  "editProjectForm.skillsPlaceholder": "ex.: edição, mistura, foto — separadas por vírgulas",
  "editProjectForm.submitPending": "A guardar…",
  "editProjectForm.submit": "Guardar as alterações",

  // ——— ContributeForm ———
  "contributeForm.freeAmountLabel": "Montante livre ({currency})",
  "contributeForm.anonymousStrong": "Contribuir anonimamente",
  "contributeForm.anonymousRest":
    "— o teu nome não aparecerá no projeto, nem a quem o leva, nem no fio de atividade.",
  "contributeForm.redirecting": "A redirecionar para o pagamento…",
  "contributeForm.submit": "Contribuir com {amount}",
  "contributeForm.feeStrong": "0 % de comissão GeniGain",
  "contributeForm.feeRest":
    "— aplicam-se apenas as taxas de cartão (fixadas pela Stripe, nem vistas nem tocadas pela GeniGain).",
  "contributeForm.escrowIntro":
    "Pagamento seguro Stripe. Fundos em custódia, desbloqueados etapa a etapa pelo voto dos contribuidores. Se a campanha não vingar, o teu dinheiro volta",
  "contributeForm.escrowStrong": "líquido das taxas de cartão",
  "contributeForm.escrowAfterStrong":
    ": a Stripe não as devolve, a GeniGain não fica com nenhuma.",
  "contributeForm.feesLink": "Detalhe das taxas",

  // ——— MilestoneTimeline ———
  "milestoneTimeline.statusLocked": "Bloqueada",
  "milestoneTimeline.statusAwaitingProof": "Prova aguardada",
  "milestoneTimeline.statusUnderReview": "Votação em curso",
  "milestoneTimeline.statusReleased": "Fundos libertados",
  "milestoneTimeline.proofCounter": "Prova {index}/{max}",
  "milestoneTimeline.proofRejected": "Recusada",
  "milestoneTimeline.proofApproved": "Validada",
  "milestoneTimeline.proofPending": "Votação em curso",
  "milestoneTimeline.proofImageAlt": "Prova de progresso",
  "milestoneTimeline.majorityAt": "maioria a {amount}",
  "milestoneTimeline.alreadyVoted": "Já votaste",
  "milestoneTimeline.approve": "Validar",
  "milestoneTimeline.reject": "Recusar",
  "milestoneTimeline.awaitingOwnerProof":
    "À espera da prova de progresso de quem leva o projeto...",

  // ——— ProofForm ———
  "proofForm.heading": "Envia a tua prova de progresso",
  "proofForm.lastAttempt": "Última tentativa — sê convincente!",
  "proofForm.contentLabel": "O que concretizaste",
  "proofForm.contentPlaceholder":
    "Descreve concretamente o que foi feito nesta etapa (mín. 20 caracteres)…",
  "proofForm.linksLabel": "Links (um por linha, opcional)",
  "proofForm.linksPlaceholder": "https://demo.exemplo.pt\nhttps://github.com/…",
  "proofForm.imagesLabel": "Imagens (um URL por linha, opcional)",
  "proofForm.imagesPlaceholder": "https://.../foto-oficina.jpg",
  "proofForm.submitPending": "A enviar…",
  "proofForm.submit": "Enviar a prova a votação",

  // ——— CampaignCockpit ———
  "campaignCockpit.heading": "Pilotagem — visível só para ti",
  "campaignCockpit.dailyCollection": "Recolha por dia",
  "campaignCockpit.emptyState":
    "Ainda sem contribuições — partilha o teu link, o contador começa aqui.",
  "campaignCockpit.sparklineAria": {
    one: "Recolha por dia desde o lançamento: {amount} em {count} dia.",
    other: "Recolha por dia desde o lançamento: {amount} em {count} dias.",
  },
  "campaignCockpit.todayPoint": "{amount} hoje",
  "campaignCockpit.paceLabel": "Ritmo para lá chegar",
  "campaignCockpit.perDay": "{amount}/dia",
  "campaignCockpit.goalReached": "Objetivo alcançado",
  "campaignCockpit.milestonesValidated": "Etapas validadas",
  "campaignCockpit.contributorsLabel": "Quem contribui",
  "campaignCockpit.followersLabel": "Quem segue",
  "campaignCockpit.convertedShare": "destes, {percent} % contribuíram",
  "campaignCockpit.realizeBefore": "A concretizar antes de",
  "campaignCockpit.daysToDeadline": "D-{days}",

  // ——— CancelProjectButton ———
  // UMA frase, não seis fragmentos: a ordem das palavras pertence a cada
  // língua (o alemão e o árabe não seguem a sintaxe francesa).
  "cancelProjectButton.confirmBody":
    "Ao confirmares, o projeto passa definitivamente a «não alcançado» e até {amount} volta para {contributors} (líquido das taxas de cartão, alguns dias conforme o banco). Não há volta atrás.",
  "cancelProjectButton.contributorCount": {
    one: "{count} contribuidor",
    other: "{count} contribuidores",
  },
  "cancelProjectButton.contributorsGeneric": "os contribuidores",
  "cancelProjectButton.confirmPending": "A parar…",
  "cancelProjectButton.confirmSubmit": "Sim, parar e reembolsar",
  "cancelProjectButton.cancel": "Cancelar",
  "cancelProjectButton.arm": "Parar o projeto",

  // ——— DeleteProjectButton ———
  "deleteProjectButton.confirmPending": "A retirar…",
  "deleteProjectButton.confirmSubmit": "Sim, retirar definitivamente",
  "deleteProjectButton.cancel": "Cancelar",
  "deleteProjectButton.arm": "Retirar o projeto",

  // ——— CommentForm ———
  "commentForm.placeholder": "Encoraja, faz uma pergunta, oferece uma ajuda…",
  "commentForm.ariaLabel": "O teu comentário",
  "commentForm.submitPending": "A enviar…",
  "commentForm.submit": "Comentar",

  // ——— ProjectUpdateForm ———
  "projectUpdateForm.titleLabel": "Título da novidade",
  "projectUpdateForm.titlePlaceholder": "ex.: O equipamento chegou!",
  "projectUpdateForm.bodyLabel": "Que há de novo?",
  "projectUpdateForm.bodyPlaceholder":
    "Progressos, bastidores, agradecimentos... os teus contribuidores serão notificados.",
  "projectUpdateForm.success": "Novidade publicada — contribuidores notificados.",
  "projectUpdateForm.submitPending": "A publicar…",
  "projectUpdateForm.submit": "Publicar a novidade",

  // ——— FollowButton ———
  "followButton.unfollowTitle": "Deixar de seguir este projeto",
  "followButton.followTitle": "Seguir este projeto",
  "followButton.following": "A seguir",
  "followButton.follow": "Seguir",

  // ——— ProjectCard ———
  "projectCard.replaces": "Substitui {targets}",
  "projectCard.contributions": {
    one: "{count} contribuição",
    other: "{count} contribuições",
  },
  "projectCard.daysLeft": {
    one: "{count} dia restante",
    other: "{count} dias restantes",
  },
} satisfies Messages["project"];
