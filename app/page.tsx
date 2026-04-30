import { TitanDashboard } from "@/app/_components/titan-dashboard";
import { TitanManagementConsole } from "@/app/_components/titan-management-console";
import { TitanSetupNotice } from "@/app/_components/titan-setup-notice";
import {
  getTitanAppState,
  getTitanManagementSnapshot,
} from "@/lib/server/titan-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await getTitanAppState();

  if (state.kind === "missing_database") {
    return <TitanSetupNotice dbPath={state.dbPath} />;
  }

  const management = await getTitanManagementSnapshot();

  return (
    <TitanDashboard snapshot={state.snapshot}>
      <TitanManagementConsole management={management} />
    </TitanDashboard>
  );
}
