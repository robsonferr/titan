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

  if (state.kind === "missing_schema") {
    return (
      <TitanSetupNotice
        bindingName={state.bindingName}
        commands={[
          {
            label: "Local D1 bootstrap",
            command: "npm run db:setup:local",
          },
          {
            label: "Remote D1 bootstrap",
            command: "npm run db:setup:remote",
          },
        ]}
      />
    );
  }

  if (state.kind === "missing_binding") {
    return (
      <TitanDeploymentNotice
        title="Cloudflare binding missing"
        description="This Workers build needs the TITAN_DB D1 binding before the dashboard can load real data."
        bindingName={state.bindingName}
        configLocation={state.configLocation}
      />
    );
  }

  const management = await getTitanManagementSnapshot();

  if (state.kind === "empty_database") {
    return (
      <TitanEmptyDatabaseNotice
        bindingName={state.bindingName}
        management={management}
      />
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
