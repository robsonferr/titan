import { TitanDashboard } from "@/app/_components/titan-dashboard";
import { dashboardSnapshot } from "@/lib/mock-data";

export default function Home() {
  return <TitanDashboard snapshot={dashboardSnapshot} />;
}
