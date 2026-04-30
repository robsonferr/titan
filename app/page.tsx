import { TitanDashboard } from "@/app/_components/titan-dashboard";
import { TitanDeploymentNotice } from "@/app/_components/titan-deployment-notice";
import { TitanEmptyDatabaseNotice } from "@/app/_components/titan-empty-database-notice";
import { TitanManagementConsole } from "@/app/_components/titan-management-console";
import { TitanSetupNotice } from "@/app/_components/titan-setup-notice";
import {
  applyQuestProgressOptionAction,
  toggleDailyQuestAction,
} from "@/app/actions";
import {
  getTitanAppState,
  getTitanManagementSnapshot,
} from "@/lib/server/titan-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await getTitanAppState();

  if (state.kind === "missing_database") {
    return (
      <TitanSetupNotice
        dbPath={state.dbPath}
        command={
          process.env.TITAN_DB_PATH
            ? `TITAN_DB_PATH=${process.env.TITAN_DB_PATH} npm run db:init`
            : "npm run db:init"
        }
      />
    );
  }

  if (state.kind === "invalid_configuration") {
    return (
      <TitanDeploymentNotice
        title="Production persistence missing"
        description="This hosted build uses SQLite, so it needs an explicit writable path on a persistent volume before the shell can boot safely."
        envKey={state.envKey}
        exampleValue={state.exampleValue}
      />
    );
  }

  const management = await getTitanManagementSnapshot();

  if (state.kind === "empty_database") {
    return (
      <TitanEmptyDatabaseNotice dbPath={state.dbPath} management={management} />
    );
  }

  return (
    <TitanDashboard
      snapshot={state.snapshot}
      onApplyQuestProgressOption={applyQuestProgressOptionAction}
      onToggleDailyQuest={toggleDailyQuestAction}
    >
      <TitanManagementConsole management={management} />
    </TitanDashboard>
  );
}
