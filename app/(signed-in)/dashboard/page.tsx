import { fetchFoldersWithRoutines } from "@/app/actions/folders";
import DashboardClient from "@/app/components/DashboardClient";
import type { Folder, RoutineWithExercises } from "@/types/types";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let initialFolders: Folder[] = [];
  let initialRoutines: RoutineWithExercises[] = [];

  try {
    const { folders, routines } = await fetchFoldersWithRoutines();
    initialFolders = folders;
    initialRoutines = routines;
  } catch (error) {
    console.error("Error fetching folders with routines:", error);
  }

  return (
    <DashboardClient
      initialFolders={initialFolders}
      initialRoutines={initialRoutines}
    />
  );
}
