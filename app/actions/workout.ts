"use server";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, is, lt } from "drizzle-orm";
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
import type { DBSet } from "@/types/types";

// ---------------------------
// GET WORKOUT SESSION FUNCTION
// ---------------------------

export async function startWorkoutSession(routineId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // First verify the routine exists and belongs to this user
    const routine = await db
      .select()
      .from(routines)
      .where(eq(routines.id, routineId))
      .limit(1);

    if (!routine.length || routine[0].userId !== userId) {
      throw new Error("Routine not found or unauthorized");
    }

    const sessionId = nanoid();
    const timestamp = Math.floor(Date.now() / 1000);

    // Get the routine exercises with their data
    const routineExerciseList = await db
      .select({
        exercise: exercises,
        routineExercise: routineExercises,
      })
      .from(routineExercises)
      .where(eq(routineExercises.routineId, routineId))
      .leftJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
      .orderBy(routineExercises.order);

    // Start a transaction to create everything at once
    await db.transaction(async (tx) => {
      // Create new workout session
      await tx.insert(workoutSessions).values({
        id: sessionId,
        userId,
        routineId,
        status: "active",
        startedAt: timestamp,
        completedAt: null,
      });

      // For each exercise, create workout_data and sets
      for (const { exercise, routineExercise } of routineExerciseList) {
        if (!exercise) continue;

        // Create workout_data entry
        await tx.insert(workoutData).values({
          id: nanoid(),
          sessionId,
          exerciseId: exercise.id,
          notes: routineExercise.notes ?? "",
          updatedAt: Date.now(),
        });

        // Parse weights and create sets
        const warmupWeights = JSON.parse(routineExercise.warmupSetWeights);
        const workingWeights = JSON.parse(routineExercise.workingSetWeights);
        const setsToCreate = [];

        // Add warmup sets
        for (let i = 0; i < routineExercise.warmupSets; i++) {
          setsToCreate.push({
            id: nanoid(),
            sessionId,
            exerciseId: exercise.id,
            setNumber: setsToCreate.length + 1,
            weight: warmupWeights[i] ?? 0,
            reps: routineExercise.warmupReps ?? 0,
            isWarmup: 1,
            completedAt: 0,
          });
        }

        // Add working sets
        for (let i = 0; i < routineExercise.workingSets; i++) {
          setsToCreate.push({
            id: nanoid(),
            sessionId,
            exerciseId: exercise.id,
            setNumber: setsToCreate.length + 1,
            weight: workingWeights[i] ?? 0,
            reps: routineExercise.workingReps ?? 0,
            isWarmup: 0,
            completedAt: 0,
          });
        }

        // Insert all sets if we have any
        if (setsToCreate.length > 0) {
          await tx.insert(sets).values(setsToCreate);
        }
      }
    });

    redirect(`/session/${sessionId}`);
  } catch (error) {
    console.error("Detailed error in startWorkoutSession:", error);
    throw error;
  }
}

// ---------------------------
// GET WORKOUT SESSION FUNCTION
// ---------------------------

export async function getWorkoutSession(sessionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const session = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .limit(1);

    if (!session.length) throw new Error("Session not found");
    if (session[0].userId.toLowerCase() !== userId.toLowerCase()) {
      throw new Error("Unauthorized session access");
    }

    // Get exercises for this routine
    const exercisesList = await db
      .select({
        exercise: exercises,
        routineExercise: routineExercises,
      })
      .from(routineExercises)
      .where(eq(routineExercises.routineId, session[0].routineId))
      .leftJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
      .orderBy(routineExercises.order);

    // Get the most recent completed session for this user/routine before this session
    const previousSession = await db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSessions.routineId, session[0].routineId),
          eq(workoutSessions.status, "completed"),
          lt(workoutSessions.startedAt, session[0].startedAt),
        ),
      )
      .orderBy(desc(workoutSessions.startedAt))
      .limit(1);

    // If we found a previous session, get its sets
    let previousSets: DBSet[] = [];
    []; // Initialize with empty array
    if (previousSession.length > 0) {
      previousSets = await db
        .select({
          exerciseId: sets.exerciseId,
          weight: sets.weight,
          reps: sets.reps,
          isWarmup: sets.isWarmup,
        })
        .from(sets)
        .where(eq(sets.sessionId, previousSession[0].id))
        .orderBy(sets.exerciseId, sets.setNumber);
    }

    // Get previous workout notes
    const previousWorkoutData = await db
      .select()
      .from(workoutData)
      .where(eq(workoutData.sessionId, previousSession[0]?.id ?? ""));

    return {
      session: session[0],
      exercises: exercisesList.map((exercise) => ({
        ...exercise,
        previousData: {
          notes:
            previousWorkoutData.find(
              (w) => w.exerciseId === exercise.exercise?.id,
            )?.notes || "",
          sets: JSON.stringify(
            previousSets
              .filter((set) => set.exerciseId === exercise.exercise?.id)
              .map((set) => ({
                weight: set.weight.toString(),
                reps: set.reps.toString(),
                isWarmup: set.isWarmup === 1,
              })),
          ),
        },
      })),
    };
  } catch (error) {
    console.error("Error fetching workout session:", error);
    throw error;
  }
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
      const parsed = parseInt(value);
      return Number.isFinite(parsed) ? parsed : 0;
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
        weight: safeParseInt(set.weight),
        reps: safeParseInt(set.reps),
        isWarmup: set.isWarmup ? 1 : 0,
        completedAt: Date.now(),
      }));

      // Delete existing sets and insert new snapshot
      await tx
        .delete(sets)
        .where(
          and(eq(sets.sessionId, sessionId), eq(sets.exerciseId, exerciseId)),
        );
      if (newSets.length > 0) {
        await tx.insert(sets).values(newSets);
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
      .set({ status: "cancelled", completedAt: Date.now() })
      .where(eq(workoutSessions.id, sessionId));
    return { success: true };
  } catch (error) {
    console.error("Error cancelling workout session:", error);
    return { success: false, error: "Failed to cancel workout session" };
  }
}
