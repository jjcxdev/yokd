"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { routineExercises, routines } from "@/lib/db/schema";
import type { RoutineExercise, Routine } from "@/types/types";

type RoutineInput = Pick<Routine, "name" | "folderId" | "userId"> & {
  exercises: RoutineExercise[];
};

export async function postRoutines({
  name,
  folderId,
  exercises,
  userId,
}: RoutineInput) {
  try {
    // Generate routine ID
    const newRoutineId = nanoid();

    // Create the routine
    await db.insert(routines).values({
      id: newRoutineId,
      name: name,
      folderId: folderId,
      userId: userId,
      createdAt: Date.now(),
    });

    // Create the exercise entries with the generated routineId
    await db.insert(routineExercises).values(
      exercises.map((exercise) => ({
        ...exercise,
        workingSetWeights: exercise.workingSetWeights,
        warmupSetWeights: exercise.warmupSetWeights,
        id: nanoid(), // Generate unique ID for each exercise
        routineId: newRoutineId,
      })),
    );

    // Revalidate the dashboard to show new data
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error inserting exercises:", error);
    return { success: false, error: "Failed to create routine" };
  }
}
