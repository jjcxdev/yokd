import { fetchFoldersWithPlans } from "@/app/actions/folders";
import DashboardClient from "@/app/components/DashboardClient";

export default async function Dashboard() {
  const { folders, plans } = await fetchFoldersWithPlans();
  return <DashboardClient initialFolders={folders} initialPlans={plans} />;
}
