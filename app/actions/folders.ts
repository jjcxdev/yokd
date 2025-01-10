"use server";

import { auth } from "@clerk/nextjs/server";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import type { RoutineWithExercises } from "@/lib/db/schema";
import {
  exercises,
  folders,
  routineExercises,
  routines,
  sets,
  users,
  workoutData,
  workoutSessions,
} from "@/lib/db/schema";
import type { Folders } from "@/types/types";

//
// CREATE FOLDER
//

export async function createFolder(name: string, userId: string) {
  console.log("Starting createFolder with:", { name, userId });

  try {
    // Verify auth
    console.log("Verifying auth...");
    const authResult = await auth();
    console.log("Auth result:", authResult);

    if (!authResult.userId || authResult.userId !== userId) {
      console.log("Auth mismatch:", {
        authUserId: authResult.userId,
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

//
// FETCH FOLDERS
//

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

//
// DELETE FOLDER
//

export async function deleteFolder(folderId: string) {
  try {
    console.log(`Attempting to delete folder with ID: ${folderId}`);

    // Validate auth
    const authResult = await auth();
    if (!authResult.userId) {
      throw new Error("User not authenticated");
    }
    console.log(`Authenticated user ID: ${authResult.userId}`);

    // First get all routines in this folder
    const folderRoutines = await db
      .select({ id: routines.id })
      .from(routines)
      .where(eq(routines.folderId, folderId));
    console.log(`Found ${folderRoutines.length} routines in folder`);

    if (folderRoutines.length > 0) {
      const routineIds = folderRoutines.map((routine) => routine.id);

      // Delete all workout data related to these routines
      await db
        .delete(workoutData)
        .where(
          inArray(
            workoutData.sessionId,
            db
              .select({ id: workoutSessions.id })
              .from(workoutSessions)
              .where(inArray(workoutSessions.routineId, routineIds)),
          ),
        );
      console.log(`Deleted workout data for routines in folder`);

      // Delete all sets related to these routines
      await db
        .delete(sets)
        .where(
          inArray(
            sets.sessionId,
            db
              .select({ id: workoutSessions.id })
              .from(workoutSessions)
              .where(inArray(workoutSessions.routineId, routineIds)),
          ),
        );
      console.log(`Deleted sets for routines in folder`);

      // Delete all workout sessions related to these routines
      await db
        .delete(workoutSessions)
        .where(inArray(workoutSessions.routineId, routineIds));
      console.log(`Deleted workout sessions for routines in folder`);

      // Delete all routine_exercises for routines in this folder
      await db
        .delete(routineExercises)
        .where(inArray(routineExercises.routineId, routineIds));
      console.log(`Deleted routine exercises for routines in folder`);

      // Delete associated routines
      await db.delete(routines).where(eq(routines.folderId, folderId));
      console.log(`Deleted routines in folder`);
    }

    // Ensure there are no remaining references to the folder
    const remainingReferences = await db
      .select({ id: routines.id })
      .from(routines)
      .where(eq(routines.folderId, folderId));
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

//
// DELETE ROUTINE
//

export async function deleteRoutine(routineId: string) {
  try {
    // Validate auth
    const authResult = await auth();
    if (!authResult.userId) {
      throw new Error("User not authenticated");
    }

    console.log(`Attempting to delete routine with ID: ${routineId}`);

    // First delete all workout data related to this routine
    await db
      .delete(workoutData)
      .where(
        inArray(
          workoutData.sessionId,
          db
            .select({ id: workoutSessions.id })
            .from(workoutSessions)
            .where(eq(workoutSessions.routineId, routineId)),
        ),
      );

    console.log(`Deleted workout data for routine`);

    // Delete all sets related to this routine
    await db
      .delete(sets)
      .where(
        inArray(
          sets.sessionId,
          db
            .select({ id: workoutSessions.id })
            .from(workoutSessions)
            .where(eq(workoutSessions.routineId, routineId)),
        ),
      );

    console.log(`Deleted sets for routine`);

    // Delete all workout sessions related to this routine
    await db
      .delete(workoutSessions)
      .where(eq(workoutSessions.routineId, routineId));

    console.log(`Deleted workout sessions for routine`);

    // Firt delete associated routine_exercises
    await db
      .delete(routineExercises)
      .where(eq(routineExercises.routineId, routineId));

    console.log(`Deleted routine exercises for routine`);

    // Then delete the routine
    await db.delete(routines).where(eq(routines.id, routineId));

    console.log("Routine deleted successfully");

    // Revalidate after delete
    revalidatePath("/dashboard");
    console.log("Page revalidated");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting routine:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Error deleting routine:", error);
    }
    throw new Error("Failed to delete routine");
  }
}

//
// FETCH FOLDERS WITH ROUTINES
//

export async function fetchFoldersWithRoutines(): Promise<{
  folders: Folders[];
  routines: RoutineWithExercises[];
}> {
  try {
    // Get the current user's ID from auth
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    console.log("Fetching folders for user:", userId);

    // Fetch only folders and routines that belong to the current user
    const foldersData = await db
      .select({
        id: folders.id,
        name: folders.name,
        userId: folders.userId,
        createdAt: folders.createdAt,
        updatedAt: folders.updatedAt,
        description: folders.description,
      })
      .from(folders)
      .where(eq(folders.userId, userId))
      .orderBy((f) => [asc(f.createdAt), asc(f.name)]);

    console.log("Fetched folders:", foldersData);

    const routinesData =
      foldersData.length > 0
        ? await db
            .select({
              // Select all routine fields
              id: routines.id,
              name: routines.name,
              folderId: routines.folderId,
              userId: routines.userId,
              createdAt: routines.createdAt,
              updatedAt: routines.updatedAt,
              status: routines.status,
              description: routines.description,
              // Add exercises as JSON array
              exerciseNames:
                sql<string>`GROUP_CONCAT(json_object('name', ${exercises.name}))`.as(
                  "exercises",
                ),
            })
            .from(routines)
            .leftJoin(
              routineExercises,
              eq(routines.id, routineExercises.routineId),
            )
            .leftJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
            .where(
              and(
                eq(routines.userId, userId),
                inArray(
                  routines.folderId,
                  foldersData.map((f) => f.id),
                ),
              ),
            )
            .groupBy(routines.id)
        : [];

    console.log("Fetched routines:", routinesData);

    // Parse the JSON string into actual arrays
    const transformedRoutines: RoutineWithExercises[] = routinesData.map(
      (routine) => {
        try {
          // The string is already a series of JSON objects, but needs to be wrapped in brackets
          const exercisesArray = JSON.parse(`[${routine.exerciseNames}]`);
          return {
            ...routine,
            exercises: exercisesArray,
          };
        } catch (error) {
          console.error(
            "Error parsing exercises for routine:",
            routine.id,
            error,
          );
          return {
            ...routine,
            exercises: [],
          };
        }
      },
    );

    return {
      folders: foldersData,
      routines: transformedRoutines,
    };
  } catch (error) {
    console.error("Error fetching folders with routines:", error);
    throw new Error("Failed to fetch folders with routines");
  }
}
