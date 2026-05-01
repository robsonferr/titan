export const SUPPORTED_LOCALES = ["pt-BR", "en-US"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt-BR";
export const LOCALE_HEADER = "x-titan-locale";

const MESSAGES = {
  "pt-BR": {
    meta: {
      title: "TITAN // Evolua suas metas",
      description:
        "App de quests para transformar metas em tarefas diárias e semanais, ganhar XP e liberar recompensas.",
    },
    enums: {
      questType: {
        daily: "diária",
        weekly: "semanal",
        monthly: "mensal",
        epic: "épica",
      },
      progressKind: {
        boolean: "check",
        counter: "contador",
      },
      rewardRarity: {
        common: "comum",
        rare: "rara",
        legendary: "lendária",
      },
      sideLabel: "extra",
      coreLabel: "core",
      unlocked: "liberado",
      locked: "bloqueado",
      active: "ativo",
      idle: "parado",
      links: "links",
    },
    login: {
      kicker: "Acesso privado",
      title: "Entrar no TITAN",
      description:
        "Entre para abrir suas quests, acompanhar seu XP e manter o Boss do mês sob controle.",
      passwordLabel: "Senha",
      idleLabel: "Entrar",
      pendingLabel: "Entrando...",
      errorInvalid: "Senha errada. Tenta de novo.",
      errorConfig: "O acesso ainda não está pronto neste ambiente.",
      errorThrottled: "Muitas tentativas seguidas. Espere um pouco e tente de novo.",
    },
    logout: {
      button: "Sair",
    },
    setupNotice: {
      kicker: "Banco desconectado",
      title: "TITAN sem dados",
      description:
        "O app encontrou o banco, mas a estrutura do TITAN ainda não foi aplicada. Rode a migração e a seed abaixo, depois recarregue.",
      badge: "Configuração pendente",
      binding: "Binding D1",
      localBootstrap: "Bootstrap local D1",
      remoteBootstrap: "Bootstrap remoto D1",
    },
    deploymentNotice: {
      kicker: "Configuração obrigatória",
      badge: "Ajuste necessário",
      requiredBinding: "Binding obrigatório",
      configureIn: "Configurar em",
      missingBindingTitle: "Binding Cloudflare ausente",
      missingBindingDescription:
        "Este app precisa do binding D1 TITAN_DB para carregar dados reais.",
    },
    emptyDatabaseNotice: {
      kicker: "Primeira configuração",
      title: "Crie o primeiro template",
      description:
        "O banco do TITAN já está online, mas ainda não existe nenhum template. Monte a primeira run para liberar dashboard, Boss e Shop com dados reais.",
      badge: "Sem template",
      statusLabel: "Status",
      statusDescription:
        "Banco pronto. Crie um Template e depois adicione Quests e Rewards.",
      activeBinding: "Binding D1 ativo",
    },
    loading: {
      kicker: "Entrando na run",
      title: "Carregando TITAN",
      description: "Organizando suas quests, o Boss do mês e a Shop.",
      badge: "Carregando",
    },
    notFound: {
      kicker: "Área desconhecida",
      title: "Essa tela se perdeu",
      description:
        "Essa rota saiu do mapa. Volte ao painel principal para continuar sua run.",
      button: "Voltar ao painel",
    },
    error: {
      kicker: "Algo saiu da rota",
      title: "A run travou",
      description:
        "Esta tela encontrou um erro e não conseguiu continuar. Tente carregar de novo ou volte ao painel.",
      badge: "Erro visível",
      retry: "Tentar de novo",
      back: "Voltar ao painel",
    },
    globalError: {
      kicker: "Falha geral",
      title: "O TITAN caiu",
      description:
        "Algo mais sério derrubou o app inteiro. Recarregue para voltar ao jogo.",
      badge: "Falha crítica",
      retry: "Recarregar TITAN",
    },
    dashboard: {
      nav: {
        hud: "HUD",
        quests: "Quests",
        boss: "Boss",
        forge: "Forja",
      },
      hero: {
        kicker: "Painel de hoje",
        pilot: "Jogador",
        activeTemplate: "Template ativo",
        streak: "Sequência",
        core: "Core",
        boss: "Boss",
        controlsLabel: "Controles",
        languageLabel: "Idioma",
      },
      questCard: {
        xp: "XP",
        undoCheck: "Desfazer check",
        markDone: "Marcar como feito",
        syncingQuest: "Sincronizando quest...",
        useQuickAddDeckAbove: "Use o deck de adição rápida acima",
        addQuickOptionsInForge: "Adicione opções rápidas na Forja",
        questCleared: "Quest concluída",
        openQuest: "Abrir quest",
      },
      rewardCard: {
        kicker: "Recompensa da Shop",
        xpCost: "Custo em XP",
      },
      featuredGoal: {
        kicker: "Missão em foco",
        addBurst: "Somar progresso",
        pendingBurst: "Somando progresso...",
        usesToday: "hoje",
        noBurstTitle: "Sem atalhos ainda",
        noBurstDescription:
          "Essa missão já pode acumular progresso, mas ainda faltam atalhos para deixar o avanço rápido.",
        noBurstHint: "Crie atalhos na Forja.",
        noCounterTitle: "Nenhuma missão de contador equipada",
        noCounterDescription:
          "Adicione uma missão diária com meta numérica para acender esta barra de progresso.",
        noCounterHint:
          "Protein Log funciona muito bem aqui.",
      },
      sections: {
        dailyEyebrow: "Hoje",
        dailyTitle: "Quests diárias",
        dailyEmptyTitle: "Ainda não há quests diárias",
        dailyEmptyDescription:
          "O template está ativo, mas o dia ainda está sem quests. Adicione Morning Buff, Night Protocol, Protein Log ou outras quests core na Forja.",
        dailyEmptyHint: "O Boss do mês só anda quando este deck entra em jogo.",
        secondaryEyebrow: "Missão de longo prazo",
        secondaryTitle: "Semanal + Mensal + Épica",
        secondaryCaption: "Objetivos que levam mais de um dia.",
        secondaryEmptyTitle: "Ainda não há quests de longo prazo",
        secondaryEmptyDescription:
          "Faltam quests semanais, um Boss mensal ou objetivos épicos para dar mais profundidade à progressão.",
        secondaryEmptyHint: "Adicione uma meta semanal ou um Boss mensal na Forja.",
        lootEyebrow: "Shop",
        lootTitle: "Recompensas",
        lootCaption: "Prêmios que valem o grind.",
        lootEmptyTitle: "A Shop ainda está vazia",
        lootEmptyDescription:
          "Sem recompensas, o XP perde graça. Adicione alguns itens para deixar a progressão mais concreta.",
        lootEmptyHint: "Recompensas soltas também aparecem aqui.",
      },
    },
    progressBar: {
      onlineSuffix: "% da meta",
      progressLoadedToday: "Progresso de hoje",
      goalPrefix: "Meta",
    },
    monthlyBoss: {
      kicker: "Boss mensal",
      title: "Boss da consistência",
      percent: "Progresso",
      successfulDaysPrefix: "dias válidos de",
      noClearedDays:
        "Ainda não há dias válidos. Feche um dia com pelo menos 3 das 4 quests core para acordar o Boss.",
      thresholdPrefix: "Você precisa de",
      thresholdSuffix: "para vencer este Boss.",
      monthBooting: "Começando",
      shieldUp: "No controle",
      recovering: "Correndo atras",
    },
    management: {
      kicker: "Forja",
      title: "Monte sua progressão",
      caption:
        "Crie templates, quests, recompensas e atalhos que transformam metas em missões acionáveis.",
      templateForgeTitle: "Novo template",
      templateForgeSubtitle: "Defina a temporada",
      templateTitleLabel: "Título do template",
      templateTitlePlaceholder: "Modo Escola + Treino",
      templateSummaryLabel: "Resumo do template",
      templateSummaryPlaceholder:
        "Equilibre estudo, esporte e hábitos base em uma rotina que dá XP todo dia.",
      dailyClearRuleLabel: "Meta para fechar o dia",
      createTemplate: "Criar template",
      creatingTemplate: "Criando template...",
      rewardForgeTitle: "Nova recompensa",
      rewardForgeSubtitle: "Abasteça a Shop",
      rewardTitleLabel: "Título da recompensa",
      rewardTitlePlaceholder: "Tempo extra no game",
      rewardDescriptionLabel: "Descrição da recompensa",
      rewardDescriptionPlaceholder:
        "Liberada depois de manter a rotina em dia por uma semana.",
      rarityLabel: "Raridade",
      xpCostLabel: "Custo em XP",
      spawnUnlocked: "Já começa liberada na Shop",
      createReward: "Criar recompensa",
      creatingReward: "Criando recompensa...",
      questForgeTitle: "Nova quest",
      questForgeSubtitle: "Transforme meta em ação",
      templateLabel: "Template",
      questTypeLabel: "Tipo de quest",
      progressModeLabel: "Modo de progresso",
      xpValueLabel: "Valor de XP",
      questTitleLabel: "Título da quest",
      questTitlePlaceholder: "Sessão de foco",
      questSummaryLabel: "Resumo da quest",
      questSummaryPlaceholder:
        "Faça blocos curtos até avançar a meta do dia.",
      targetValueLabel: "Meta numérica",
      unitLabel: "Unidade",
      unitPlaceholder: "min / reps / páginas",
      attachRewardOnSpawnLabel: "Vincular recompensa ao criar",
      noRewardYet: "Sem recompensa",
      countAsCore: "Contar como quest core na regra do dia",
      createQuest: "Criar quest",
      creatingQuest: "Criando quest...",
      createTemplateFirst: "Crie um template primeiro",
      createTemplateFirstDescription:
        "Toda quest precisa de um template para entrar na run. Monte o template primeiro e depois volte aqui.",
      createTemplateFirstHint:
        "Comece pelo bloco de template ao lado.",
      linkDockTitle: "Atalhos e vínculos",
      linkDockSubtitle: "Acerte a progressão",
      counterQuestLabel: "Quest de contador",
      quickAddLabel: "Nome do atalho",
      quickAddPlaceholder: "Shake +21g",
      valueLabel: "Valor",
      addQuickProgressOption: "Criar atalho de progresso",
      addingBurst: "Criando atalho...",
      noCounterQuestsTitle: "Ainda não há quest de contador",
      noCounterQuestsDescription:
        "Atalhos rápidos só funcionam em quests com meta numérica. Crie uma primeiro e depois monte os presets aqui.",
      noCounterQuestsHint:
        "Protein Log é perfeito para presets como Shake +21g, Carne +25g e Ovo +6g.",
      questLabel: "Quest",
      rewardLabel: "Recompensa",
      attachRewardToQuest: "Vincular recompensa à quest",
      attachingReward: "Vinculando...",
      needQuestsAndRewardsTitle: "Faltam quests e recompensas",
      needQuestsAndRewardsDescription:
        "Para criar vínculos, você precisa ter pelo menos uma quest e uma recompensa.",
      templatesKicker: "Templates",
      templatesTitle: "Seus templates",
      templatesCaption:
        "Troque de template para mudar o foco da run.",
      questsCountSuffix: "quests",
      coreCountSuffix: "core",
      rulePrefix: "Regra",
      activateTemplate: "Ativar",
      activatingTemplate: "Trocando...",
      rosterEmptyTitle: "Ainda não há templates",
      rosterEmptyDescription:
        "Sem template, o TITAN ainda não sabe qual run mostrar.",
      rosterEmptyHint: "Comece pelo primeiro bloco desta tela.",
      questsKicker: "Quests",
      questsTitle: "Quests criadas",
      questsCaption:
        "Tudo o que você montar aparece aqui com progresso e vínculos.",
      optionsSuffix: "opções",
      rewardLinkedPrefix: "Recompensa vinculada //",
      rewardPending: "Recompensa pendente",
      buildQueueEmptyTitle: "Ainda não há quests",
      buildQueueEmptyDescription:
        "Sem quests, as metas ainda não viraram ação.",
      buildQueueEmptyHint:
        "Crie pelo menos uma Quest Diária para começar.",
      rewardsKicker: "Recompensas",
      rewardsTitle: "Recompensas criadas",
      rewardsCaption:
        "Veja raridade, desbloqueio e o que cada item entrega.",
      lootLedgerEmptyTitle: "Ainda não há recompensas",
      lootLedgerEmptyDescription:
        "Sem recompensas, a Shop fica sem motivo para existir.",
      lootLedgerEmptyHint: "Crie a primeira recompensa acima.",
    },
    domain: {
      noCoreQuestRule: "Defina quests core para criar a regra do dia.",
      clearDayRule: (successTarget: number, totalCoreQuests: number) =>
        `${successTarget} de ${totalCoreQuests} quests core fecham o dia.`,
      questCleared: "Concluída",
      questReady: "Pronta",
      questCharging: "Carregando",
      rewardPrefix: "Recompensa:",
      lootPrefix: "Loot //",
      monthlyBossPrefix: "Boss Mensal //",
      bossCracked: "Boss vencido",
      onShield: "No escudo",
      dangerZone: "Zona de perigo",
      defaultPlayerName: "Jogador",
    },
  },
  "en-US": {
    meta: {
      title: "TITAN // Teen Goals Level Up",
      description:
        "Quest app that turns goals into daily and weekly actions, XP, and rewards.",
    },
    enums: {
      questType: {
        daily: "daily",
        weekly: "weekly",
        monthly: "monthly",
        epic: "epic",
      },
      progressKind: {
        boolean: "check",
        counter: "counter",
      },
      rewardRarity: {
        common: "common",
        rare: "rare",
        legendary: "legendary",
      },
      sideLabel: "side",
      coreLabel: "core",
      unlocked: "unlocked",
      locked: "locked",
      active: "active",
      idle: "idle",
      links: "links",
    },
    login: {
      kicker: "Private access",
      title: "Sign in to TITAN",
      description:
        "Sign in to open your quests, track your XP, and keep the monthly Boss under control.",
      passwordLabel: "Password",
      idleLabel: "Sign in",
      pendingLabel: "Signing in...",
      errorInvalid: "Wrong password. Try again.",
      errorConfig: "Access is not ready in this environment yet.",
      errorThrottled: "Too many attempts in a row. Wait a bit and try again.",
    },
    logout: {
      button: "Sign out",
    },
    setupNotice: {
      kicker: "Database disconnected",
      title: "TITAN DB offline",
      description:
        "The app found the database, but the TITAN structure has not been applied yet. Run the migration and seed flow below, then reload.",
      badge: "Setup needed",
      binding: "D1 binding",
      localBootstrap: "Local D1 bootstrap",
      remoteBootstrap: "Remote D1 bootstrap",
    },
    deploymentNotice: {
      kicker: "Required setup",
      badge: "Action needed",
      requiredBinding: "Required binding",
      configureIn: "Configure in",
      missingBindingTitle: "Cloudflare binding missing",
      missingBindingDescription:
        "This app needs the TITAN_DB D1 binding before it can load real data.",
    },
    emptyDatabaseNotice: {
      kicker: "First setup",
      title: "Forge the first template",
      description:
        "The TITAN database is online, but there are no templates yet. Build the first run so the dashboard, Boss, and Shop can load real data.",
      badge: "No template yet",
      statusLabel: "Status",
      statusDescription:
        "Database ready. Create a Template first, then add Quests and Rewards.",
      activeBinding: "Active D1 binding",
    },
    loading: {
      kicker: "Entering the run",
      title: "Booting TITAN",
      description: "Loading your quests, the monthly Boss, and the Shop.",
      badge: "Loading",
    },
    notFound: {
      kicker: "Unknown area",
      title: "This screen got lost",
      description:
        "That route is outside the map. Jump back to the main dashboard to keep the run going.",
      button: "Back to dashboard",
    },
    error: {
      kicker: "Something went off track",
      title: "Run interrupted",
      description:
        "This screen hit an error and could not keep going. Try again or head back to the dashboard.",
      badge: "Visible error",
      retry: "Try again",
      back: "Back to dashboard",
    },
    globalError: {
      kicker: "Major failure",
      title: "TITAN crashed",
      description:
        "Something bigger took the whole app down. Reload to get back into the game.",
      badge: "Critical fault",
      retry: "Reload TITAN",
    },
    dashboard: {
      nav: {
        hud: "HUD",
        quests: "Quests",
        boss: "Boss",
        forge: "Forge",
      },
      hero: {
        kicker: "Today's board",
        pilot: "Player",
        activeTemplate: "Active template",
        streak: "Streak",
        core: "Core",
        boss: "Boss",
        controlsLabel: "Controls",
        languageLabel: "Language",
      },
      questCard: {
        xp: "XP",
        undoCheck: "Undo check",
        markDone: "Mark done",
        syncingQuest: "Syncing quest...",
        useQuickAddDeckAbove: "Use the quick-add deck above",
        addQuickOptionsInForge: "Add quick options in Forge",
        questCleared: "Quest cleared",
        openQuest: "Open quest",
      },
      rewardCard: {
        kicker: "Shop reward",
        xpCost: "XP cost",
      },
      featuredGoal: {
        kicker: "Focus mission",
        addBurst: "Add progress",
        pendingBurst: "Adding progress...",
        usesToday: "today",
        noBurstTitle: "No shortcuts yet",
        noBurstDescription:
          "This mission can already track progress, but it still needs shortcuts to make leveling up faster.",
        noBurstHint: "Create shortcuts in the Forge.",
        noCounterTitle: "No counter quest equipped",
        noCounterDescription:
          "Add a daily mission with a number goal to light up this progress bar.",
        noCounterHint:
          "Protein Log is a strong fit here.",
      },
      sections: {
        dailyEyebrow: "Today",
        dailyTitle: "Daily Quests",
        dailyEmptyTitle: "No daily quests yet",
        dailyEmptyDescription:
          "The active template exists, but today's board is still empty. Add Morning Buff, Night Protocol, Protein Log, or other core quests in the Forge.",
        dailyEmptyHint: "The monthly Boss will not move until daily quests are live.",
        secondaryEyebrow: "Long-term goals",
        secondaryTitle: "Weekly + Monthly + Epic",
        secondaryCaption: "Goals that take more than one day.",
        secondaryEmptyTitle: "No long-term quests yet",
        secondaryEmptyDescription:
          "Weekly quests, a Monthly Boss, or Epic goals can give this run more depth once the daily loop is working.",
        secondaryEmptyHint: "Add a weekly goal or a Monthly Boss in the Forge.",
        lootEyebrow: "Shop",
        lootTitle: "Rewards",
        lootCaption: "Prizes worth the grind.",
        lootEmptyTitle: "Shop is empty",
        lootEmptyDescription:
          "Without rewards, XP feels flat. Add a few prizes to make progress feel real.",
        lootEmptyHint: "Standalone rewards also show up here.",
      },
    },
    progressBar: {
      onlineSuffix: "% of goal",
      progressLoadedToday: "Today's progress",
      goalPrefix: "Goal",
    },
    monthlyBoss: {
      kicker: "Monthly Boss",
      title: "Consistency Boss",
      percent: "Progress",
      successfulDaysPrefix: "valid days out of",
      noClearedDays:
        "No valid days yet. Finish a day with at least 3 of the 4 core quests to wake the Boss meter.",
      thresholdPrefix: "You need",
      thresholdSuffix: "to clear this Boss.",
      monthBooting: "Starting up",
      shieldUp: "In control",
      recovering: "Catching up",
    },
    management: {
      kicker: "Forge",
      title: "Build your progression",
      caption:
        "Create templates, quests, rewards, and shortcuts that turn goals into actions.",
      templateForgeTitle: "New template",
      templateForgeSubtitle: "Set the season",
      templateTitleLabel: "Template title",
      templateTitlePlaceholder: "School + Training Mode",
      templateSummaryLabel: "Template summary",
      templateSummaryPlaceholder:
        "Mix study, sport, and reset habits into one routine that earns XP every day.",
      dailyClearRuleLabel: "Goal to clear the day",
      createTemplate: "Create template",
      creatingTemplate: "Creating template...",
      rewardForgeTitle: "New reward",
      rewardForgeSubtitle: "Fill the Shop",
      rewardTitleLabel: "Reward title",
      rewardTitlePlaceholder: "Extra game time",
      rewardDescriptionLabel: "Reward description",
      rewardDescriptionPlaceholder:
        "Unlocked after keeping your routine on track for a full week.",
      rarityLabel: "Rarity",
      xpCostLabel: "XP cost",
      spawnUnlocked: "Starts unlocked in the Shop",
      createReward: "Create reward",
      creatingReward: "Creating reward...",
      questForgeTitle: "New quest",
      questForgeSubtitle: "Turn goals into actions",
      templateLabel: "Template",
      questTypeLabel: "Quest type",
      progressModeLabel: "Progress mode",
      xpValueLabel: "XP value",
      questTitleLabel: "Quest title",
      questTitlePlaceholder: "Focus session",
      questSummaryLabel: "Quest summary",
      questSummaryPlaceholder:
        "Stack short sessions until you move the day forward.",
      targetValueLabel: "Number goal",
      unitLabel: "Unit",
      unitPlaceholder: "min / reps / pages",
      attachRewardOnSpawnLabel: "Link reward on create",
      noRewardYet: "No reward yet",
      countAsCore: "Count as a core quest in the daily rule",
      createQuest: "Create quest",
      creatingQuest: "Creating quest...",
      createTemplateFirst: "Create a Template first",
      createTemplateFirstDescription:
        "Every quest needs a template before it can join the run. Build the template first, then come back here.",
      createTemplateFirstHint:
        "Start with the template block next to this one.",
      linkDockTitle: "Shortcuts and links",
      linkDockSubtitle: "Tune progression",
      counterQuestLabel: "Counter quest",
      quickAddLabel: "Shortcut label",
      quickAddPlaceholder: "Shake +21g",
      valueLabel: "Value",
      addQuickProgressOption: "Create progress shortcut",
      addingBurst: "Creating shortcut...",
      noCounterQuestsTitle: "No counter quests yet",
      noCounterQuestsDescription:
        "Shortcuts only work for quests with number goals. Create one first, then add preset buttons here.",
      noCounterQuestsHint:
        "Protein Log is perfect for presets like Shake +21g, Meat +25g, and Egg +6g.",
      questLabel: "Quest",
      rewardLabel: "Reward",
      attachRewardToQuest: "Link reward to quest",
      attachingReward: "Linking...",
      needQuestsAndRewardsTitle: "Need quests and rewards",
      needQuestsAndRewardsDescription:
        "You need at least one quest and one reward before you can connect them.",
      templatesKicker: "Templates",
      templatesTitle: "Your templates",
      templatesCaption:
        "Switch templates to change the run focus instantly.",
      questsCountSuffix: "quests",
      coreCountSuffix: "core",
      rulePrefix: "Rule",
      activateTemplate: "Activate",
      activatingTemplate: "Switching...",
      rosterEmptyTitle: "No templates yet",
      rosterEmptyDescription:
        "Without a template, TITAN does not know which run to show.",
      rosterEmptyHint: "Start with the first block on this screen.",
      questsKicker: "Quests",
      questsTitle: "Created quests",
      questsCaption:
        "Everything you build shows up here with its progress and links.",
      optionsSuffix: "options",
      rewardLinkedPrefix: "Reward linked //",
      rewardPending: "Reward pending",
      buildQueueEmptyTitle: "No quests yet",
      buildQueueEmptyDescription:
        "Without quests, goals have not turned into action yet.",
      buildQueueEmptyHint:
        "Create at least one Daily Quest to get started.",
      rewardsKicker: "Rewards",
      rewardsTitle: "Created rewards",
      rewardsCaption:
        "See rarity, unlock state, and what each item adds to the Shop.",
      lootLedgerEmptyTitle: "No rewards yet",
      lootLedgerEmptyDescription:
        "Without rewards, the Shop has nothing to offer.",
      lootLedgerEmptyHint: "Create your first reward above.",
    },
    domain: {
      noCoreQuestRule: "Set core quests to create the daily clear rule.",
      clearDayRule: (successTarget: number, totalCoreQuests: number) =>
        `${successTarget} of ${totalCoreQuests} core quests clear the day.`,
      questCleared: "Cleared",
      questReady: "Ready",
      questCharging: "Charging",
      rewardPrefix: "Reward:",
      lootPrefix: "Loot //",
      monthlyBossPrefix: "Monthly Boss //",
      bossCracked: "Boss beaten",
      onShield: "On the shield",
      dangerZone: "Danger zone",
      defaultPlayerName: "Player",
    },
  },
} as const;

export type Messages = (typeof MESSAGES)[Locale];

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function resolveLocale(value: string | null | undefined): Locale {
  if (value && isSupportedLocale(value)) {
    return value;
  }

  return DEFAULT_LOCALE;
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const [segment] = pathname.split("/").filter(Boolean);

  if (!segment || !isSupportedLocale(segment)) {
    return null;
  }

  return segment;
}

export function stripLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);

  if (!locale) {
    return pathname || "/";
  }

  const stripped = pathname.slice(locale.length + 1);
  return stripped ? (stripped.startsWith("/") ? stripped : `/${stripped}`) : "/";
}

export function buildLocalizedPath(locale: Locale, pathname = "/"): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const basePath = stripLocaleFromPathname(normalizedPath);

  if (basePath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${basePath}`;
}

export function getLocaleFromAbsoluteUrl(value: string | null | undefined): Locale {
  if (!value) {
    return DEFAULT_LOCALE;
  }

  try {
    return resolveLocale(getLocaleFromPathname(new URL(value).pathname));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function formatQuestTypeLabel(
  locale: Locale,
  value: "daily" | "weekly" | "monthly" | "epic",
): string {
  return getMessages(locale).enums.questType[value];
}

export function formatProgressKindLabel(
  locale: Locale,
  value: "boolean" | "counter",
): string {
  return getMessages(locale).enums.progressKind[value];
}

export function formatRewardRarityLabel(
  locale: Locale,
  value: "common" | "rare" | "legendary",
): string {
  return getMessages(locale).enums.rewardRarity[value];
}
