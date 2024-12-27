"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { planExercises, plans } from "@/lib/db/schema";
import type { ExerciseInput } from "@/types/exercises";

interface RoutineInput {
  name: string;
  folderId: string;
  exercises: ExerciseInput[];
  userId: string;
}

export async function postRoutines({
  name,
  folderId,
  exercises,
  userId,
}: RoutineInput) {
  try {
    // Generate plan ID
    const newPlanId = nanoid();

    // Create the plan
    await db.insert(plans).values({
      id: newPlanId,
      name: name,
      folderId: folderId,
      userId: userId,
      createdAt: Date.now(),
    });

    // Create the exercise entries with the generated planId
    await db.insert(planExercises).values(
      exercises.map((exercise) => ({
        ...exercise,
        id: nanoid(), // Generate unique ID for each exercise
        planId: newPlanId,
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
