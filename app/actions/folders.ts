"use server";

import { asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import type { Plan} from "@/lib/db/schema";
import { folders, plans } from "@/lib/db/schema";
import type { Folders } from "@/types/folders";

export async function createFolder(name: string, userId: string) {
  try {
    const folderData = {
      id: crypto.randomUUID(),
      name,
      userId,
      createdAt: Date.now(),
    };

    await db.insert(folders).values(folderData);

    // Revalidate the dashboard page to show the new folder
    revalidatePath("/dashboard");

    return folderData;
  } catch (error) {
    console.error("Error creating Folder:", error);
    throw new Error("Failed to create folder");
  }
}

export async function fetchFolders() {
  try {
    const data = await db
      .select()
      .from(folders)
      .orderBy((folders) => [asc(folders.createdAt), asc(folders.name)]);
    return data;
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw new Error("Failed to fetch folders");
  }
}

export async function deleteFolder(folderId: string) {
  try {
    await db.delete(folders).where(eq(folders.id, folderId));

    // Also delete associated plans
    await db.delete(plans).where(eq(plans.folderId, folderId));

    // Revalidate after deletion
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw new Error("Failed to delete folder");
  }
}

export async function fetchFoldersWithPlans(): Promise<{
  folders: Folders[];
  plans: Plan[];
}> {
  try {
    const foldersData = await db
      .select()
      .from(folders)
      .orderBy((f) => [asc(f.createdAt), asc(f.name)]);

    const plansData =
      foldersData.length > 0
        ? await db
            .select()
            .from(plans)
            .where(
              inArray(
                plans.folderId,
                foldersData.map((f) => f.id),
              ),
            )
        : [];

    return {
      folders: foldersData,
      plans: plansData,
    };
  } catch (error) {
    console.error("Error fetching folders with plans:", error);
    throw new Error("Failed to fetch folders with plans");
  }
}
