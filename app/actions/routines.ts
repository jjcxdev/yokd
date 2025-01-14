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
      // Log the exercise we're processing
      console.log("Processing exercise:", exercise);

      const workingSets = exercise.sets.filter((set) => !set.isWarmup);
      const warmupSets = exercise.sets.filter((set) => set.isWarmup);

      // Log the sets after filtering
      console.log("Working sets:", workingSets);
      console.log("Warmup sets:", warmupSets);

      const transformed = {
        id: nanoid(),
        routineId,
        exerciseId: exercise.exerciseId,
        order: index,
        workingSetWeights: JSON.stringify(
          workingSets.map((set) => parseFloat(set.weight) || 0),
        ),
        warmupSetWeights: JSON.stringify(
          warmupSets.map((set) => parseFloat(set.weight) || 0),
        ),
        warmupSets: warmupSets.length,
        warmupReps: parseInt(warmupSets[0]?.reps || "0"),
        workingSets: workingSets.length,
        workingReps: parseInt(workingSets[0]?.reps || "0"),
        restTime: 30,
        notes: exercise.notes || null,
      };

      // Log the transformed exercise
      console.log("Transformed exercise:", transformed);
      return transformed;
    });

    // Log the query before executing
    const query = db.insert(routineExercises).values(transformedExercises);
    const sql = query.toSQL();
    console.log("SQL to execute:", sql.sql);
    console.log("SQL parameters:", sql.params);

    // Execute the insert
    await query;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error in postRoutines:", error);
    return { success: false, error: String(error) };
  }
}
