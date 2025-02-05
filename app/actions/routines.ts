"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { routineExercises, routines } from "@/lib/db/schema";
import type { Routine, ExerciseData } from "@/types/types";
import { eq } from "drizzle-orm";

type RoutineInput = Pick<Routine, "name" | "folderId" | "userId"> & {
  exercises: ExerciseData[];
};

export async function postRoutines({
  name,
  folderId,
  exercises,
  userId,
}: RoutineInput) {
  console.log("Received exercises:", exercises);

  try {
    const routineId = nanoid();

    // Create routine first
    await db.insert(routines).values({
      id: routineId,
      name,
      folderId,
      userId,
    });

    console.log("Created routine:", routineId);

    // Map the exercises to the database format
    const transformedExercises = exercises.map((exercise, index) => {
      console.log("Processing exercise:", exercise);

      const workingSets = exercise.sets.filter((set) => !set.isWarmup);
      const warmupSets = exercise.sets.filter((set) => set.isWarmup);

      console.log("Working sets:", workingSets);
      console.log("Warmup sets:", warmupSets);

      const handleEmptyValue = (value: string) => {
        if (!value || value === "") return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      // Extract weights and convert arrays to strings
      const workingSetWeights = workingSets
        .map((set) => set.weight)
        .filter((weight) => weight !== "")
        .join(",");

      const warmupSetWeights = warmupSets
        .map((set) => set.weight)
        .filter((weight) => weight !== "")
        .join(",");

      return {
        id: nanoid(),
        routineId,
        exerciseId: exercise.exerciseId,
        order: index,
        workingSetWeights,
        warmupSetWeights,
        warmupSets: warmupSets.length,
        warmupReps: handleEmptyValue(warmupSets[0]?.reps) ?? null,
        workingSets: workingSets.length,
        workingReps: handleEmptyValue(workingSets[0]?.reps) ?? null,
        restTime: 30,
        notes: exercise.notes || null,
      };
    });

    // Execute the insert
    await db.insert(routineExercises).values(transformedExercises);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error in postRoutines:", error);
    return { success: false, error: String(error) };
  }
}
