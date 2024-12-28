"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  workoutSessions,
  planExercises,
  exercises,
  plans,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function startWorkoutSession(planId: string) {
  try {
    const { userId } = await auth();
    console.log("Starting session with userId:", userId);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First verify the plan exists and belongs to this user
    const plan = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    console.log("Found plan:", plan);

    if (!plan.length || plan[0].userId !== userId) {
      throw new Error("Plan not found or unauthorized");
    }

    const sessionId = nanoid();
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

    console.log("Creating session with dat:", {
      id: sessionId,
      userId,
      planId,
      status: "active",
      startedAt: timestamp,
      completedAt: null,
    });

    // Create new workout session
    await db.insert(workoutSessions).values({
      id: sessionId,
      userId,
      planId,
      status: "active",
      startedAt: timestamp,
      completedAt: null,
    });

    console.log("Session created successfully:", sessionId);

    // Fetch exercises for this plan
    const planExerciseList = await db
      .select({
        exercise: exercises,
        planExercise: planExercises,
      })
      .from(planExercises)
      .where(eq(planExercises.planId, planId))
      .leftJoin(exercises, eq(exercises.id, planExercises.exerciseId))
      .orderBy(planExercises.order);

    if (!planExerciseList.length) {
      console.log("Warning: No exercises found for plan", planId);
    }

    redirect(`/session/${sessionId}`);
  } catch (error) {
    console.error("Detailed error in  startWorkoutSessionsf:", error);
    throw error;
  }
}

export async function getWorkoutSession(sessionId: string) {
  try {
    const { userId } = await auth();
    console.log("Getting session for userId:", userId);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    console.log("Looking for session:", sessionId);

    const session = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .limit(1);

    console.log("Found Session:", session);

    if (!session.length) {
      throw new Error("Session not found");
    }

    if (session[0].userId.toLowerCase() !== userId.toLowerCase()) {
      console.log("Session userId:", session[0].userId);
      console.log("Current userId:", userId);
      throw new Error("Unauthorized session access");
    }

    const exercisesList = await db
      .select({
        exercise: exercises,
        planExercise: planExercises,
      })
      .from(planExercises)
      .where(eq(planExercises.planId, session[0].planId))
      .leftJoin(exercises, eq(exercises.id, planExercises.exerciseId))
      .orderBy(planExercises.order);

    console.log("Found exercises:", exercisesList);

    return {
      session: session[0],
      exercises: exercisesList,
    };
  } catch (error) {
    console.error("Error fetching workout session:", error);
    throw error;
  }
}
