import { fetchFoldersWithPlans } from "@/app/actions/folders";
import DashboardClient from "@/app/components/DashboardClient";
import type { Folder, PlanWithExercises } from "@/types/types";

export default async function Dashboard() {
  let initialFolders: Folder[] = [];
  let initialPlans: PlanWithExercises[] = [];

  try {
    const { folders, plans } = await fetchFoldersWithPlans();
    initialFolders = folders;
    initialPlans = plans;
  } catch (error) {
    console.error("Error fetching folders with plans:", error);
  }

  return (
    <DashboardClient
      initialFolders={initialFolders}
      initialPlans={initialPlans}
    />
  );
}
