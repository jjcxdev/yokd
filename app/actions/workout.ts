"use server";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, is, lt, not } from "drizzle-orm";
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

function safeParseInt(value: string): number {
  const parsed = parseInt(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// ---------------------------
// START WORKOUT SESSION FUNCTION
// ---------------------------

export async function startWorkoutSession(routineId: string) {
  try {
    const { userId } = await auth();
    // console.log("Starting session with userId:", userId);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First verify the routine exists and belongs to this user
    const routine = await db
      .select()
      .from(routines)
      .where(eq(routines.id, routineId))
      .limit(1);

    // console.log("Found routine:", routine);

    if (!routine.length || routine[0].userId !== userId) {
      throw new Error("Routine not found or unauthorized");
    }

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
        // console.log("Warning: No exercises found for routine", routineId);
      }

    const sessionId = nanoid();
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

    // console.log("Creating session with dat:", {
    //   id: sessionId,
    //   userId,
    //   routineId,
    //   status: "active",
    //   startedAt: timestamp,
    //   completedAt: null,
    // });

    // Create new workout session
    await db.insert(workoutSessions).values({
      id: sessionId,
      userId,
      routineId,
      status: "active",
      startedAt: timestamp,
      completedAt: null,
    });

    for (const { exercise, routineExercise } of routineExerciseList){
      if (exercise) {
        // console.log('Creating workout data for exercise:', {
        //   id: exercise.id,
        //   restTime: routineExercise.restTime,
        // });

        // First get the most recent workout_data for this exercise
        const previousWorkoutData = await db
        .select({restTime: workoutData.restTime})
        .from(workoutData)
        .where(eq(workoutData.exerciseId, exercise.id))
        .orderBy(desc(workoutData.updatedAt))
        .limit(1);

        // Use the previous rest time if it exists, otherwise use the default
        const restTime = previousWorkoutData.length > 0
        ? previousWorkoutData[0].restTime
        : routineExercise.restTime ?? 30;

        await db.insert(workoutData).values({
          id: nanoid(),
          sessionId,
          exerciseId: exercise.id,
          notes: "",
          restTime,
          updatedAt: Date.now(),
        })
      }
    }

    // console.log("Session created successfully:", sessionId);


    redirect(`/session/${sessionId}`);
  } catch (error) {
    console.error("Detailed error in  startWorkoutSessionsf:", error);
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

    // console.log('Getting workout session with ID:', sessionId);

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
        workoutData: {
          notes: workoutData.notes,
          sets: workoutData.sets,
          restTime: workoutData.restTime,
          updatedAt: workoutData.updatedAt,
        }
      })
      .from(routineExercises)
      .where(eq(routineExercises.routineId, session[0].routineId))
      .leftJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
      .leftJoin(
        workoutData,
        and(
          eq(workoutData.sessionId, sessionId),
          eq(workoutData.exerciseId, routineExercises.exerciseId),
        ),
      )
      .orderBy(routineExercises.order);

      // console.log('Raw exercisesList from database:', exercisesList);

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

    return {
      session: session[0],
      exercises: exercisesList.map((exercise) => {
        // console.log('Exercise data:', {
        //   id: exercise.exercise?.id,
        //   workoutData: exercise.workoutData,
        //   routineExercise: exercise.routineExercise,
        // });

        return {
        ...exercise,
        previousData: exercise.workoutData
          ? {
              notes: exercise.workoutData.notes || "",
              sets: JSON.stringify(
                previousSets
                  .filter((set) => set.exerciseId === exercise.exercise?.id)
                  .map((set) => ({
                    weight: set.weight.toString(),
                    reps: set.reps.toString(),
                    isWarmup: set.isWarmup === 1,
                  })),
              ),
              restTime:
                exercise.workoutData.restTime ??
                exercise.routineExercise.restTime ??
                30, // Default to 30 seconds
            }
          : {
              notes: "",
              sets: "[]",
              restTime: exercise.routineExercise.restTime || 30,
            },
          }
      }),
    };
  } catch (error) {
    console.error("Error fetching workout session:", error);
    throw error;
  }
}

// ---------------------------
// COMPLETE WORKOUT SESSION FUNCTION
// ---------------------------

export async function completeWorkoutSession(
  sessionId: string,
  clientData: Record<
    string,
    {
      notes: string;
      sets: Array<{ weight: string; reps: string; isWarmup: boolean }>;
      restTime?: number;
    }
  >,
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Send all changes to the database
    await Promise.all(
      Object.entries(clientData).map(async ([exerciseId, data]) => {
        await db.transaction(async (tx) => {
          // Update notes ans rest_time in workout_data
          await tx
            .insert(workoutData)
            .values({
              id: nanoid(),
              sessionId,
              exerciseId,
              notes: data.notes,
              restTime: data.restTime ?? 30,
              updatedAt: Date.now(),
            })
            .onConflictDoUpdate({
              target: [workoutData.sessionId, workoutData.exerciseId],
              set: {
                notes: data.notes,
                restTime: data.restTime ?? 30,
                updatedAt: Date.now(),
              },
            });

          // Delete existing sets
          await tx
            .delete(sets)
            .where(
              and(
                eq(sets.sessionId, sessionId),
                eq(sets.exerciseId, exerciseId),
              ),
            );

          // Insert new sets
          if (data.sets.length > 0) {
            await tx.insert(sets).values(
              data.sets.map((set, index) => ({
                id: nanoid(),
                sessionId,
                exerciseId,
                setNumber: index + 1,
                weight: safeParseInt(set.weight),
                reps: safeParseInt(set.reps),
                isWarmup: set.isWarmup ? 1 : 0,
                completedAt: Date.now(),
              })),
            );
          }
        });
      }),
    ),
      // Mark the session as completed
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

// ---------------------------
// UPDATE WORKOUT DATA FUNCTION
// ---------------------------

export async function updateWorkoutData(
  sessionId: string,
  exerciseId: string,
  data: {
    notes?: string;
    sets?: Array<{
      weight: string;
      reps: string;
      isWarmup: boolean;
    }>;
    restTime?: number;
  },
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

      // If no data is provided to update, don't do anything
      if (!data.notes && !data.sets && data.restTime === undefined) {
        return { success: true};
    }

    await db.transaction(async (tx) => {
      // Only if we have notes or restTime to update
      if (data.notes !== undefined || data.restTime !== undefined) {
        // Get current workout data if it exists
        const currentData = await tx
        .select()
        .from(workoutData)
        .where(
          and(
            eq(workoutData.sessionId, sessionId),
            eq(workoutData.exerciseId, exerciseId),
          )
        )
        .limit(1);

        // Only update if data has changed
        const notesChanged = data.notes !== undefined && (!currentData.length || currentData[0].notes !== data.notes );
        const restTimeChanged = data.restTime !== undefined && (!currentData.length || currentData[0].restTime !== data.restTime);

        if (notesChanged || restTimeChanged) {
          const updateValues: any = {};
          if (notesChanged) updateValues.notes = data.notes;
          if (restTimeChanged) updateValues.restTime = data.restTime;
          updateValues.updatedAt = Date.now();

        await tx
          .insert(workoutData)
          .values({
            ...currentData[0],
            ...updateValues,
            id: nanoid(),
            sessionId,
            exerciseId,
          })
          .onConflictDoUpdate({
            target: [workoutData.sessionId, workoutData.exerciseId],
            set: updateValues,
          });
        }
      }

      // Only update sets if they're provided
      if (data.sets) {
        const currentSets = await tx
        .select({
          weight: sets.weight,
          reps: sets.reps,
          isWarmup: sets.isWarmup,
            setNumber: sets.setNumber,
        }).from(sets)
        .where(
          and(eq(sets.sessionId, sessionId), eq(sets.exerciseId, exerciseId)),
        )
        .orderBy(sets.setNumber);

        // Compare sets by converting weight and reps to strings and booleans
        const normalizedCurrentSets = currentSets.map((set) => ({
          weight: set.weight.toString(),
          reps: set.reps.toString(),
          isWarmup: set.isWarmup === 1,
        }));

        const setsChanged =
        normalizedCurrentSets.length !== data.sets.length ||
        !normalizedCurrentSets.every((set, index) =>{
          const newSet = data.sets![index];
          return (
            set.weight === newSet.weight &&
            set.reps === newSet.reps &&
            set.isWarmup === newSet.isWarmup
          );
        });

        if (setsChanged) {
        await tx
          .delete(sets)
          .where(
            and(eq(sets.sessionId, sessionId), eq(sets.exerciseId, exerciseId)),
          );

        await tx.insert(sets).values(
          data.sets.map((set, index) => ({
            id: nanoid(),
            sessionId,
            exerciseId,
            setNumber: index + 1,
            weight: safeParseInt(set.weight),
            reps: safeParseInt(set.reps),
            isWarmup: set.isWarmup ? 1 : 0,
            completedAt: Date.now(),
          })),
        );
      }
    }
    });

    return { success: true };
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
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Mark the session as cancelled
    await db
      .update(workoutSessions)
      .set({ status: "cancelled" })
      .where(eq(workoutSessions.id, sessionId));

    return { success: true };
  } catch (error) {
    console.error("Error cancelling workout session:", error);
    return { success: false, error: "Failed to cancel workout session" };
  }
}
