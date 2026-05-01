import { TitanDashboard } from "@/app/_components/titan-dashboard";
import { TitanDeploymentNotice } from "@/app/_components/titan-deployment-notice";
import { TitanEmptyDatabaseNotice } from "@/app/_components/titan-empty-database-notice";
import { TitanManagementConsole } from "@/app/_components/titan-management-console";
import { TitanSetupNotice } from "@/app/_components/titan-setup-notice";
import {
  applyQuestProgressOptionAction,
  toggleDailyQuestAction,
} from "@/app/actions";
import { getMessages, type Locale } from "@/lib/i18n";
import {
  getTitanAppState,
  getTitanManagementSnapshot,
} from "@/lib/server/titan-repository";

type TitanPageKind = "hud" | "quests" | "boss" | "forge";

export async function renderTitanPage(
  locale: Locale,
  page: TitanPageKind,
): Promise<React.JSX.Element> {
  const messages = getMessages(locale);
  const state = await getTitanAppState(locale);

  if (state.kind === "missing_schema") {
    return (
      <TitanSetupNotice
        locale={locale}
        bindingName={state.bindingName}
        commands={[
          {
            label: messages.setupNotice.localBootstrap,
            command: "npm run db:setup:local",
          },
          {
            label: messages.setupNotice.remoteBootstrap,
            command: "npm run db:setup:remote",
          },
        ]}
      />
    );
  }

  if (state.kind === "missing_binding") {
    return (
      <TitanDeploymentNotice
        locale={locale}
        title={messages.deploymentNotice.missingBindingTitle}
        description={messages.deploymentNotice.missingBindingDescription}
        bindingName={state.bindingName}
        configLocation={state.configLocation}
      />
    );
  }

  const needsManagement = page === "forge" || state.kind === "empty_database";
  const management = needsManagement
    ? await getTitanManagementSnapshot(locale)
    : null;

  if (state.kind === "empty_database") {
    return (
      <TitanEmptyDatabaseNotice
        locale={locale}
        bindingName={state.bindingName}
        management={management!}
      />
    );
  }

  if (page === "forge") {
    return (
      <TitanDashboard
        locale={locale}
        snapshot={state.snapshot}
        onApplyQuestProgressOption={applyQuestProgressOptionAction}
        onToggleDailyQuest={toggleDailyQuestAction}
        sections={{
          hero: false,
          monthlyBoss: false,
          featuredGoal: false,
          dailyQuests: false,
          secondaryQuests: false,
          rewards: false,
        }}
      >
        <TitanManagementConsole locale={locale} management={management!} />
      </TitanDashboard>
    );
  }

  if (page === "quests") {
    return (
      <TitanDashboard
        locale={locale}
        snapshot={state.snapshot}
        onApplyQuestProgressOption={applyQuestProgressOptionAction}
        onToggleDailyQuest={toggleDailyQuestAction}
        sections={{
          hero: false,
          monthlyBoss: false,
          featuredGoal: false,
          dailyQuests: true,
          secondaryQuests: true,
          rewards: false,
        }}
      />
    );
  }

  if (page === "boss") {
    return (
      <TitanDashboard
        locale={locale}
        snapshot={state.snapshot}
        onApplyQuestProgressOption={applyQuestProgressOptionAction}
        onToggleDailyQuest={toggleDailyQuestAction}
        sections={{
          hero: false,
          monthlyBoss: true,
          featuredGoal: false,
          dailyQuests: false,
          secondaryQuests: false,
          rewards: true,
        }}
      />
    );
  }

  return (
    <TitanDashboard
      locale={locale}
      snapshot={state.snapshot}
      onApplyQuestProgressOption={applyQuestProgressOptionAction}
      onToggleDailyQuest={toggleDailyQuestAction}
      sections={{
        hero: true,
        monthlyBoss: true,
        featuredGoal: true,
        dailyQuests: false,
        secondaryQuests: false,
        rewards: false,
      }}
    />
  );
}
