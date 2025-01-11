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

// GET WORKOUT SESSION FUNCTION

export async function startWorkoutSession(routineId: string) {
  try {
    const { userId } = await auth();
    console.log("Starting session with userId:", userId);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First verify the routine exists and belongs to this user
    const routine = await db
      .select()
      .from(routines)
      .where(eq(routines.id, routineId))
      .limit(1);

    console.log("Found routine:", routine);

    if (!routine.length || routine[0].userId !== userId) {
      throw new Error("Routine not found or unauthorized");
    }

    const sessionId = nanoid();
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

    console.log("Creating session with dat:", {
      id: sessionId,
      userId,
      routineId,
      status: "active",
      startedAt: timestamp,
      completedAt: null,
    });

    // Create new workout session
    await db.insert(workoutSessions).values({
      id: sessionId,
      userId,
      routineId,
      status: "active",
      startedAt: timestamp,
      completedAt: null,
    });

    console.log("Session created successfully:", sessionId);

    // Fetch exercises for this routine
    const routineExerciseList = await db
      .select({
        exercise: exercises,
        routineExercise: routineExercises,
      })
      .from(routineExercises)
      .where(eq(routineExercises.routineId, routineId))
      .leftJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
      .orderBy(routineExercises.order);

    if (!routineExerciseList.length) {
      console.log("Warning: No exercises found for routine", routineId);
    }

    redirect(`/session/${sessionId}`);
  } catch (error) {
    console.error("Detailed error in  startWorkoutSessionsf:", error);
    throw error;
  }
}

// GET WORKOUT SESSION FUNCTION

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

// COMPLETE WORKOUT SESSION FUNCTION

export async function completeWorkoutSession(sessionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await db
      .update(workoutSessions)
      .set({ status: "completed", completedAt: Date.now() })
      .where(eq(workoutSessions.id, sessionId));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error completing workout session:", error);
    throw error;
  }
}

// UPDATE WORKOUT DATA FUNCTION

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

    await db.transaction(async (tx) => {
      // Update notes in workout_data
      await tx
        .insert(workoutData)
        .values({
          id: nanoid(),
          sessionId,
          exerciseId,
          notes: data.notes,
          updatedAt: Date.now(),
        })
        .onConflictDoUpdate({
          target: [workoutData.sessionId, workoutData.exerciseId],
          set: {
            notes: data.notes,
            updatedAt: Date.now(),
          },
        });

      // Delete existing sets
      await tx
        .delete(sets)
        .where(
          and(eq(sets.sessionId, sessionId), eq(sets.exerciseId, exerciseId)),
        );

      // Insert new sets
      if (data.sets.length > 0) {
        await tx.insert(sets).values(
          data.sets.map((set, index) => ({
            id: nanoid(),
            sessionId,
            exerciseId,
            setNumber: index + 1,
            weight: parseInt(set.weight) || 0,
            reps: parseInt(set.reps) || 0,
            isWarmup: set.isWarmup ? 1 : 0,
            completedAt: Date.now(),
          })),
        );
      }
    });
  } catch (error) {
    console.error("Error updating workout data:", error);
    throw error;
  }
}
