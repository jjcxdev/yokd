"use server";

import { asc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import type { Plan } from "@/lib/db/schema";
import { exercises, folders, planExercises, plans } from "@/lib/db/schema";
import type { Folders } from "@/types/folders";
import type { PlanWithExercises } from "@/lib/db/schema";

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
    // First get all plans in this folder
    const folderPlans = await db
      .select({ id: plans.id })
      .from(plans)
      .where(eq(plans.folderId, folderId));

    // Delete all plan_exercises for plans in this folder
    if (folderPlans.length > 0) {
      await db.delete(planExercises).where(
        inArray(
          planExercises.planId,
          folderPlans.map((plan) => plan.id),
        ),
      );
    }

    // Delete associated plans
    await db.delete(plans).where(eq(plans.folderId, folderId));

    // Then delete the folder
    await db.delete(folders).where(eq(folders.id, folderId));

    // Revalidate after deletion
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw new Error("Failed to delete folder");
  }
}

export async function deletePlan(planId: string) {
  try {
    // Firt delete associated plan_exercises
    await db.delete(planExercises).where(eq(planExercises.planId, planId));

    // Then delete the plan
    await db.delete(plans).where(eq(plans.id, planId));

    // Revalidate after delete
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw new Error("Failed to delete plan");
  }
}

export async function fetchFoldersWithPlans(): Promise<{
  folders: Folders[];
  plans: PlanWithExercises[];
}> {
  try {
    const foldersData = await db
      .select()
      .from(folders)
      .orderBy((f) => [asc(f.createdAt), asc(f.name)]);

    const plansData =
      foldersData.length > 0
        ? await db
            .select({
              // Select all plan fields
              id: plans.id,
              name: plans.name,
              folderId: plans.folderId,
              userId: plans.userId,
              createdAt: plans.createdAt,
              updatedAt: plans.updatedAt,
              status: plans.status,
              description: plans.description,
              // Add exercises as JSON array
              exerciseNames:
                sql<string>`GROUP_CONCAT(json_object('name', ${exercises.name}))`.as(
                  "exercises",
                ),
            })
            .from(plans)
            .leftJoin(planExercises, eq(plans.id, planExercises.planId))
            .leftJoin(exercises, eq(planExercises.exerciseId, exercises.id))
            .where(
              inArray(
                plans.folderId,
                foldersData.map((f) => f.id),
              ),
            )
            .groupBy(plans.id)
        : [];
    // Parse the JSON string into actual arrays
    const transformedPlans: PlanWithExercises[] = plansData.map((plan) => {
      try {
        // The string is already a series of JSON objects, but needs to be wrapped in brackets
        const exercisesArray = JSON.parse(`[${plan.exerciseNames}]`);
        return {
          ...plan,
          status: plan.status ?? "active",
          updatedAt: plan.updatedAt ?? plan.createdAt,
          exercises: exercisesArray,
        };
      } catch (error) {
        console.error("Error parsing exercises for plan:", plan.id, error);
        return {
          ...plan,
          status: plan.status ?? "active",
          updatedAt: plan.updatedAt ?? plan.createdAt,
          exercises: [],
        };
      }
    });

    return {
      folders: foldersData,
      plans: transformedPlans,
    };
  } catch (error) {
    console.error("Error fetching folders with plans:", error);
    throw new Error("Failed to fetch folders with plans");
  }
}
