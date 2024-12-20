import { fetchFolders } from "@/app/actions/folders";
import DashboardClient from "@/app/components/DashboardClient";

export default async function Dashboard() {
  const folders = await fetchFolders();
  return <DashboardClient initialFolders={folders} />;
}
