import { fetchFoldersWithRoutines } from "@/app/actions/folders";
import DashboardClient from "@/app/components/DashboardClient";
import type { Folder, Routine } from "@/types/types";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let initialFolders: Folder[] = [];
  let initialRoutines: Routine[] = [];

  try {
    const { folders, routines } = await fetchFoldersWithRoutines();
    initialFolders = folders;
    initialRoutines = routines;
  } catch (error) {
    console.error("Error fetching folders with routines:", error);
  }

  return (
    <main className="flex min-h-full w-full justify-center">
      <div className="flex h-full w-full max-w-5xl gap-4">
        <DashboardClient
          initialFolders={initialFolders}
          initialRoutines={initialRoutines}
        />
      </div>
    </main>
  );
}
