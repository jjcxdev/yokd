"use server";

import { db } from "@/lib/db";
import { planExercises, plans } from "@/lib/db/schema";
import { ExerciseInput } from "@/types/exercises";
import { nanoid } from "nanoid";

interface RoutineInput {
  name: string;
  folderId: string;
  exercises: ExerciseInput[];
}

export async function postRoutines({
  name,
  folderId,
  exercises,
}: RoutineInput) {
  try {
    // First create the plan
    const newPlanId = nanoid();

    await db.insert(plans).values({
      id: newPlanId,
      name: name,
      folderId: folderId,
      createdAt: Date.now(),
    });

    // Then create all plan exercises
    await db.insert(planExercises).values(
      exercises.map((exercise) => ({
        ...exercise,
        planId: newPlanId,
      })),
    );

    return { success: true };
  } catch (error) {
    console.error("Error inserting exercises:", error);
    return { success: false, error: "Failed to create routine" };
  }
}
