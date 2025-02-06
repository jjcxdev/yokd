"use server";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray, is, lt, not, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import {
  exercises,
  routineExercises,
  routines,
  sets,
  workoutData,
  workoutSessions,
} from "@/lib/db/schema";
import type { DBSet, ExerciseData, ExerciseWithRoutine } from "@/types/types";
import type { SessionStatus } from "@/types/types";

// Add this utility function at the top of the file
const convertToBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string")
    return value.toLowerCase() === "true" || value === "1";
  return false;
};

// ---------------------------
// GET WORKOUT SESSION FUNCTION
// ---------------------------

const parseWeightsArray = (weightsString: string | null): number[] => {
  if (!weightsString) return [];
  try {
// If it's already a number, return it as a single-item array
    if (!isNaN(Number(weightsString))) {
      return [Number(weightsString)];
    }

    // If it's a comma-separated string
    if (weightsString.includes(",")) {
      return weightsString
        .split(",")
        .map(Number)
        .filter((n) => !isNaN(n));
    }

    // Try parsing as JSON
    const parsed = JSON.parse(weightsString);
    if (Array.isArray(parsed)) {
      return parsed.map(Number).filter((n) => !isNaN(n));
    }

    return [];
  } catch {
    return [];
  }
};

export async function startWorkoutSession(routineId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const [session] = await db
      .insert(workoutSessions)
      .values({
        id: nanoid(),
        userId,
        routineId,
        status: "active",
        startedAt: Math.floor(Date.now() / 1000),
        completedAt: null,
      })
      .returning();
    
    // Get routine exercises
    const exercisesList = await db
      .select()
      .from(routineExercises)
      .where(eq(routineExercises.routineId, routineId))
      .orderBy(routineExercises.order);

    // Create initial sets for each exercise
    for (const routineExercise of exercisesList) {
      // Parse weights arrays from JSON strings - they're stored as stringified arrays of numbers
      const warmupWeights = parseWeightsArray(routineExercise.warmupSetWeights);
      const workingWeights = parseWeightsArray(
        routineExercise.workingSetWeights,
      );

      const timestamp = Math.floor(Date.now() / 1000);

      // Create warmup sets with proper boolean conversion
      const warmupSets = Array(routineExercise.warmupSets || 0)
        .fill(null)
        .map((_, i) => ({
          id: nanoid(),
          sessionId: session.id,
          exerciseId: routineExercise.exerciseId,
          setNumber: i + 1,
          weight: Number(warmupWeights[i] || 0),
          reps:
            parseInt(routineExercise.warmupReps?.toString() || "0", 10) || 0,
          isWarmup: 1,
          completedAt: timestamp,
        }));

      // Create working sets with proper boolean conversion
      const workingSets = Array(routineExercise.workingSets || 0)
        .fill(null)
        .map((_, i) => ({
          id: nanoid(),
          sessionId: session.id,
          exerciseId: routineExercise.exerciseId,
          setNumber: warmupSets.length + i + 1,
          weight: Number(workingWeights[i] || 0),
          reps:
            parseInt(routineExercise.workingReps?.toString() || "0", 10) || 0,
          isWarmup: 0,
          completedAt: timestamp,
        }));

      const allSets = [...warmupSets, ...workingSets];
      if (allSets.length > 0) {
        await db.insert(sets).values(allSets);
      }

      // Create initial workout data
      await db.insert(workoutData).values({
        id: nanoid(),
        sessionId: session.id,
        exerciseId: routineExercise.exerciseId,
        notes: routineExercise.notes || "",
        updatedAt: Date.now(),
      });
    }

    redirect(`/session/${session.id}`);

    return session;
  } catch (error) {
    console.error("Error starting workout session:", error);
    throw error;
  }
}

// ---------------------------
// GET WORKOUT SESSION FUNCTION
// ---------------------------

type QueryResult = {
  exercise: typeof exercises.$inferSelect;
  routineExercise: typeof routineExercises.$inferSelect;
  previousData: {
    notes: string | null;
    sets: {
      weight: number;
      reps: number;
      isWarmup: number;
      setNumber: number;
    } | null;
  };
};

export async function getWorkoutSession(sessionId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const session = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.id, sessionId))
    .get();

  if (!session) throw new Error("Session not found");

  const previousSession = await db
    .select()
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.userId, userId),
        eq(workoutSessions.routineId, session.routineId),
        eq(workoutSessions.status, "completed"),
        lt(workoutSessions.startedAt, session.startedAt),
      ),
    )
    .orderBy(desc(workoutSessions.startedAt))
    .limit(1)
    .get();

  const exercisesQuery = await db
    .select({
      exercise: exercises,
      routineExercise: routineExercises,
      previousData: {
        notes: workoutData.notes,
        sets: sql<string>`json_group_array(
          json_object(
            'weight', CAST(${sets.weight} AS TEXT),
            'reps', CAST(${sets.reps} AS TEXT),
            'isWarmup', ${sets.isWarmup}
          )
        )`.as("sets"),
      },
    })
    .from(exercises)
    .innerJoin(
      routineExercises,
      and(
        eq(routineExercises.exerciseId, exercises.id),
        eq(routineExercises.routineId, session.routineId),
      ),
    )
    .leftJoin(
      workoutData,
      and(
        eq(workoutData.exerciseId, exercises.id),
        eq(workoutData.sessionId, sessionId),
      ),
    )
    .leftJoin(
      sets,
      and(eq(sets.exerciseId, exercises.id), eq(sets.sessionId, sessionId)),
    )
    .groupBy(exercises.id);
  
  console.log("Raw query results from sets and workout_data:", exercisesQuery);
  const exerciseResults = exercisesQuery as unknown as QueryResult[];

  const exercisesMap = exerciseResults.reduce<
    Record<string, ExerciseWithRoutine>
  >((acc, row) => {
    const exerciseId = row.routineExercise.exerciseId;
    if (!acc[exerciseId]) {
      acc[exerciseId] = {
        exercise: row.exercise,
        routineExercise: {
          ...row.routineExercise,
          workingSetWeights: Array.isArray(
            row.routineExercise.workingSetWeights,
          )
            ? JSON.stringify(row.routineExercise.workingSetWeights)
            : row.routineExercise.workingSetWeights || "",
          warmupSetWeights: Array.isArray(row.routineExercise.warmupSetWeights)
            ? JSON.stringify(row.routineExercise.warmupSetWeights)
            : row.routineExercise.warmupSetWeights || "",
        },
        previousData: {
          notes: row.previousData?.notes ?? "",
          sets: [],
        },
      };
    }

    // If the aggregated sets string exists, parse it into an array and push each one
    const setsValue = row.previousData?.sets;
    let setsArray: Array<{
      weight: number;
      reps: number;
      isWarmup: boolean;
      setNumber: number;
    }> = [];

    if (setsValue) {
      if (typeof setsValue === "string") {
        try {
          const parsed = JSON.parse(setsValue);
          setsArray = (Array.isArray(parsed) ? parsed : [parsed]).map(
            (set) => ({
              weight: Number(set.weight),
              reps: Number(set.reps),
              setNumber: Number(set.setNumber),
              isWarmup: convertToBoolean(set.isWarmup),
            }),
          );
        } catch (error) {
          console.error("Error parsing sets JSON:", error);
          setsArray = [];
        }
      } else if (typeof setsValue === "object") {
        setsArray = (Array.isArray(setsValue) ? setsValue : [setsValue]).map(
          (set) => ({
            ...set,
            isWarmup: convertToBoolean(set.isWarmup),
          }),
        );
      }
    } else {
      setsArray = [];
    }

    setsArray.forEach((setObj) => {
      acc[exerciseId].previousData!.sets.push({
        id: setObj.setNumber,
        weight: setObj.weight.toString(),
        reps: setObj.reps.toString(),
        isWarmup: Boolean(setObj.isWarmup),
      });
    });

    return acc;
  }, {});

  return {
    sessionId,
    userId,
    routineId: session.routineId,
    status: session.status,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    exercises: Object.values(exercisesMap) as ExerciseWithRoutine[],
  };
}

// ---------------------------
// COMPLETE WORKOUT SESSION FUNCTION
// ---------------------------

export async function completeWorkoutSession(sessionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First verify the session belongs to this user
    const session = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .limit(1);

    if (
      !session.length ||
      session[0].userId.toLowerCase() !== userId.toLowerCase()
    ) {
      throw new Error("Session not found or unauthorized");
    }

    await db
      .update(workoutSessions)
      .set({
        status: "completed",
        completedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(workoutSessions.id, sessionId));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error completing workout session:", error);
    throw error;
  }
}

// ---------------------------
// UPDATE WORKOUT DATA FUNCTION
// ---------------------------

export async function updateWorkoutData(
  sessionId: string,
  exerciseId: string,
  data: {
    notes: string;
    sets: Array<{
      weight: string;
      reps: string;
      isWarmup: boolean;
    }>;
  },
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Validate input
    function safeParseInt(value: string): number {
      const parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    }

    await db.transaction(async (tx) => {
      // Get existing workout_data for this exercise
      const existingData = await tx
        .select()
        .from(workoutData)
        .where(
          and(
            eq(workoutData.sessionId, sessionId),
            eq(workoutData.exerciseId, exerciseId),
          ),
        )
        .limit(1);
      // Insert or update workout_data entry to store notes (our snapshot metadata)
      if (existingData.length > 0) {
        await tx
          .update(workoutData)
          .set({
            notes: data.notes,
            updatedAt: Date.now(),
          })
          .where(
            and(
              eq(workoutData.sessionId, sessionId),
              eq(workoutData.exerciseId, exerciseId),
            ),
          );
      } else {
        await tx.insert(workoutData).values({
          id: nanoid(),
          sessionId,
          exerciseId,
          notes: data.notes,
          updatedAt: Date.now(),
        });
      }

      // Always update the sets snapshot.
      const newSets = data.sets.map((set, index) => ({
        id: nanoid(),
        sessionId,
        exerciseId,
        setNumber: index + 1,
        weight: Number(set.weight),
        reps: Number(set.reps),
        isWarmup: set.isWarmup ? 1 : 0,
        completedAt: Date.now(),
      }));

      // Delete existing sets and insert new snapshot
      const existingSets = await tx
        .delete(sets)
        .where(
          and(eq(sets.sessionId, sessionId), eq(sets.exerciseId, exerciseId)),
        );

      const preservedIds = newSets.map((s) => s.id);
      await tx
        .delete(sets)
        .where(
          and(
            eq(sets.sessionId, sessionId),
            eq(sets.exerciseId, exerciseId),
            not(inArray(sets.id, preservedIds)),
          ),
        );
      if (newSets.length > 0) {
        await tx
          .insert(sets)
          .values(newSets)
          .onConflictDoUpdate({
            target: [sets.id],
            set: {
              weight: sql`excluded.weight`,
              reps: sql`excluded.reps`,
              completedAt: sql`excluded.completed_at`,
            },
          });
      }
    });
  } catch (error) {
    console.error("Error updating workout data:", error);
    throw error;
  }
}

// ---------------------------
// CANCEL WORKOUT SESSION FUNCTION
// ---------------------------
export async function cancelWorkoutSession(sessionId: string) {
  try {
    await db
      .update(workoutSessions)
      .set({
        status: "cancelled",
        completedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(workoutSessions.id, sessionId));
    return { success: true };
  } catch (error) {
    console.error("Error cancelling workout session:", error);
    return { success: false, error: "Failed to cancel workout session" };
  }
}

// ---------------------------
// BULK UPDATE WORKOUT DATA
// ---------------------------
export async function bulkUpdateWorkoutData(
  sessionId: string,
  exerciseUpdates: Record<string, ExerciseData>,
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Debug logging
    console.log("=== bulkUpdateWorkoutData Debug ===");
    console.log("sessionId:", sessionId);
    console.log("exerciseUpdates:", {
      type: typeof exerciseUpdates,
      isNull: exerciseUpdates === null,
      isUndefined: exerciseUpdates === undefined,
      keys: exerciseUpdates ? Object.keys(exerciseUpdates) : "N/A",
      raw: exerciseUpdates,
    });

    // Validation
    if (!exerciseUpdates) {
      console.log("No exercise updates - using empty object");
      exerciseUpdates = {};
    }

    if (typeof exerciseUpdates !== "object" || Array.isArray(exerciseUpdates)) {
      console.error("Invalid exercise updates format - using empty object");
      exerciseUpdates = {};
    }

    await db.transaction(async (tx) => {
      for (const [exerciseId, data] of Object.entries(exerciseUpdates)) {
        if (!data?.sets || !Array.isArray(data.sets)) {
          console.log(`Skipping exercise ${exerciseId} - invalid data`);
          continue;
        }

        // Update workout data
        await tx
          .update(workoutData)
          .set({
            notes: data.notes || "",
            updatedAt: Date.now(),
          })
          .where(
            and(
              eq(workoutData.sessionId, sessionId),
              eq(workoutData.exerciseId, exerciseId),
            ),
          );

        // Delete existing sets
        await tx
          .delete(sets)
          .where(
            and(eq(sets.sessionId, sessionId), eq(sets.exerciseId, exerciseId)),
          );

        // Insert new sets
        if (data.sets.length > 0) {
          const newSets = data.sets.map((set, index) => ({
            id: nanoid(),
            sessionId,
            exerciseId,
            setNumber: index + 1,
            weight: Number(set.weight) || 0,
            reps: Number(set.reps) || 0,
            isWarmup: set.isWarmup ? 1 : 0,
            completedAt: Math.floor(Date.now() / 1000),
          }));

          await tx.insert(sets).values(newSets);
        }
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Error in bulkUpdateWorkoutData:", error);
    throw error;
  }
}
