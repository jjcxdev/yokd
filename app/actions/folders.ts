"use server";

import { asc, and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import {
  workoutData,
  workoutSessions,
  exercises,
  folders,
  planExercises,
  plans,
  users,
  sets,
} from "@/lib/db/schema";
import type { Folders } from "@/types/folders";
import type { PlanWithExercises } from "@/lib/db/schema";
import { nanoid } from "nanoid";

// CREATE FOLDER

export async function createFolder(name: string, userId: string) {
  console.log("Starting createFolder with:", { name, userId });

  try {
    // Verify auth
    console.log("Verifying auth...");
    const authResult = await auth();
    console.log("Auth result:", authResult);

    if (!authResult?.userId || authResult.userId !== userId) {
      console.log("Auth mismatch:", {
        authUserId: authResult?.userId,
        providedUserId: userId,
      });
      throw new Error("Unauthorized: User ID mismatch");
    }

    // Check if user exists in database
    console.log("Checking if user exists in database...");
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser.length) {
      console.log("User not found in database, creating user record...");
      const timestamp = Date.now();
      await db.insert(users).values({
        id: userId,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      console.log("User record created");
    }

    const timestamp = Date.now();

    // Create folder data matching schema exactly
    const folderData = {
      id: nanoid(),
      name,
      userId: authResult.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: null,
    };

    // Log the data we're trying to insert
    console.log("Creating folder with data:", folderData);

    try {
      // Insert the folder into the database
      console.log("Attempting to insert folder...");
      await db.insert(folders).values(folderData);
      console.log("Folder inserted succesfully");

      // Revalidate the dashboard page to show the new folder
      revalidatePath("/dashboard");
      console.log("Page revalidated");

      return { success: true, data: folderData };
    } catch (dbError) {
      console.error("Database error:", {
        error: dbError,
        message:
          dbError instanceof Error ? dbError.message : "Unknown database error",
        stack: dbError instanceof Error ? dbError.stack : undefined,
      });
      throw new Error(
        `Database error: ${dbError instanceof Error ? dbError.message : "Unknown database error"}`,
      );
    }
  } catch (error) {
    // Better error logging
    console.error("Detailed error in createFolder:", {
      error,
      name,
      userId,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Make the error message more specific
    throw error instanceof Error
      ? error
      : new Error("Failed to create folder: Database constraint error");
  }
}

// FETCH FOLDERS

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

// DELETE FOLDER

export async function deleteFolder(folderId: string) {
  try {
    console.log(`Attempting to delete folder with ID: ${folderId}`);

    // Validate auth
    const authResult = await auth();
    if (!authResult?.userId) {
      throw new Error("User not authenticated");
    }
    console.log(`Authenticated user ID: ${authResult.userId}`);

    // First get all plans in this folder
    const folderPlans = await db
      .select({ id: plans.id })
      .from(plans)
      .where(eq(plans.folderId, folderId));
    console.log(`Found ${folderPlans.length} plans in folder`);

    if (folderPlans.length > 0) {
      const planIds = folderPlans.map((plan) => plan.id);

      // Delete all workout data related to these plans
      await db
        .delete(workoutData)
        .where(
          inArray(
            workoutData.sessionId,
            db
              .select({ id: workoutSessions.id })
              .from(workoutSessions)
              .where(inArray(workoutSessions.planId, planIds)),
          ),
        );
      console.log(`Deleted workout data for plans in folder`);

      // Delete all sets related to these plans
      await db
        .delete(sets)
        .where(
          inArray(
            sets.sessionId,
            db
              .select({ id: workoutSessions.id })
              .from(workoutSessions)
              .where(inArray(workoutSessions.planId, planIds)),
          ),
        );
      console.log(`Deleted sets for plans in folder`);

      // Delete all workout sessions related to these plans
      await db
        .delete(workoutSessions)
        .where(inArray(workoutSessions.planId, planIds));
      console.log(`Deleted workout sessions for plans in folder`);

      // Delete all plan_exercises for plans in this folder
      await db
        .delete(planExercises)
        .where(inArray(planExercises.planId, planIds));
      console.log(`Deleted plan exercises for plans in folder`);

      // Delete associated plans
      await db.delete(plans).where(eq(plans.folderId, folderId));
      console.log(`Deleted plans in folder`);
    }

    // Ensure there are no remaining references to the folder
    const remainingReferences = await db
      .select({ id: plans.id })
      .from(plans)
      .where(eq(plans.folderId, folderId));
    if (remainingReferences.length > 0) {
      throw new Error(
        `Cannot delete folder with ID: ${folderId} as there are still references to it.`,
      );
    }

    // Then delete the folder
    await db.delete(folders).where(eq(folders.id, folderId));
    console.log(`Deleted folder with ID: ${folderId}`);

    // Revalidate after deletion
    revalidatePath("/dashboard");
    console.log("Page revalidated");
  } catch (error) {
    console.error("Error deleting folder:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error("Failed to delete folder");
  }
}

// DELETE PLAN

export async function deletePlan(planId: string) {
  try {
    // Validate auth
    const authResult = await auth();
    if (!authResult?.userId) {
      throw new Error("User not authenticated");
    }

    // Firt delete associated plan_exercises
    await db.delete(planExercises).where(eq(planExercises.planId, planId));

    // Then delete the plan
    await db.delete(plans).where(eq(plans.id, planId));

    console.log("Plan deleted successfully");
    // Revalidate after delete
    revalidatePath("/dashboard");
    console.log("Page revalidated");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting plan:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Error deleting plan:", error);
    }
    throw new Error("Failed to delete plan");
  }
}

// FETCH FOLDERS WITH PLANS

export async function fetchFoldersWithPlans(): Promise<{
  folders: Folders[];
  plans: PlanWithExercises[];
}> {
  try {
    // Get the current user's ID from auth
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Fetch only folders and plans that belong to the current user
    const foldersData = await db
      .select()
      .from(folders)
      .where(eq(folders.userId, userId))
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
              and(
                eq(plans.userId, userId),
                inArray(
                  plans.folderId,
                  foldersData.map((f) => f.id),
                ),
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
