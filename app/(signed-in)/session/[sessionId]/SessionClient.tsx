"use client";

import { index } from "drizzle-orm/mysql-core";
import { isEqual } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

import { updateWorkoutData } from "@/app/actions/workout";
import ExceriseRoutineCard from "@/app/components/ExceriseRoutineCard";
import { type Exercise } from "@/lib/db/schema";

import { useSessionContext } from "./SessionContext";

type ExerciseSet = {
  weight: string;
  reps: string;
};

type ExerciseWithRoutine = {
  exercise: Exercise | null;
  routineExercise: {
    id: string;
    routineId: string;
    exerciseId: string;
    order: number;
    workingSetWeights: string;
    warmupSets: number;
    warmupReps: number;
    workingSets: number;
    workingReps: number;
    restTime: number;
    notes?: string | null;
  };
  previousData?: {
    notes: string;
    sets: string;
  };
};

interface SessionClientProps {
  sessionData: {
    exercises: ExerciseWithRoutine[];
    userId: string;
    routineId: string;
    status: "active" | "completed" | "cancelled";
    startedAt: number;
    completedAt: number | null;
    sessionId: string;
  };
}

function isValidExercise(
  exerciseData: ExerciseWithRoutine,
): exerciseData is ExerciseWithRoutine & { exercise: Exercise } {
  return exerciseData.exercise !== null;
}

export default function SessionClient({ sessionData }: SessionClientProps) {
  const { onRestTimeTrigger } = useSessionContext();

  // Keep track of pending updates
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const hasInitialized = useRef(false);
  const initialRenderRef = useRef(true);

  // Initialize with previous data if available
  const [exerciseData, setExerciseData] = useState<
    Record<string, { notes: string; sets: string }>
  >(() => {
    console.log("Initializing exercise data:", sessionData.exercises);
    const initialData: Record<string, { notes: string; sets: string }> = {};

    sessionData.exercises.forEach(
      ({ exercise, routineExercise, previousData }) => {
        if (exercise) {
          console.log(
            `Initializing exercise data for ${exercise.id}`,
            previousData,
            routineExercise,
          );

          // First create sets with initial weights from the routine
          const workingWeights = JSON.parse(routineExercise.workingSetWeights);
          const initialSets = Array(routineExercise.workingSets)
            .fill(null)
            .map((_, index) => ({
              weight: workingWeights[index]?.toString() ?? "0",
              reps: routineExercise.workingReps.toString(),
            }));

          // Check for valid previous data
          const hasPreviousData =
            previousData?.sets &&
            previousData.sets !== "[]" &&
            JSON.parse(previousData.sets).length > 0;

          if (hasPreviousData) {
            console.log(
              `Found previous data with non-empty sets for ${exercise.id}`,
              previousData,
            );
            initialData[exercise.id] = {
              notes: previousData.notes,
              sets: previousData.sets,
            };
          } else {
            console.log(`Using initial working sets for ${exercise.id}`);
            initialData[exercise.id] = {
              notes: routineExercise.notes || "",
              sets: JSON.stringify(initialSets),
            };
          }
        }
      },
    );

    console.log("Final initialized exercise data:", initialData);
    return initialData;
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handleExerciseUpdate = useCallback(
    (exerciseId: string, data: { notes: string; sets: Array<ExerciseSet> }) => {
      console.log(`Exercise update for ${exerciseId}`, {
        initialRender: initialRenderRef.current,
        data,
      });

      // Skip if this is not the initial render
      if (!initialRenderRef.current) {
        console.log("Processing update - not initial render");
      } else {
        console.log("Skipping update - initial render");
        initialRenderRef.current = false;
        return;
      }

      const dataToSet = {
        notes: data.notes,
        sets: JSON.stringify(data.sets),
      };

      // Parse both current and new data for comparison
      const currentData = exerciseData[exerciseId];
      const currentSets = JSON.parse(currentData.sets);
      const newSets = data.sets;

      // Only update state if data has changed
      if (currentData.notes === data.notes && isEqual(currentSets, newSets)) {
        console.log("Skipping update - data is the same");
        return;
      }

      console.log(`Updating exercise data for ${exerciseId}`, dataToSet);

      setExerciseData((prev) => ({
        ...prev,
        [exerciseId]: dataToSet,
      }));

      // Clear any pending update
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Set new timeout for update
      updateTimeoutRef.current = setTimeout(() => {
        console.log("Sending workout data to server:", {
          sessionId: sessionData.sessionId,
          exerciseId,
          data,
        });

        updateWorkoutData(sessionData.sessionId, exerciseId, data).catch(
          (error) => {
            console.error("Error updating workout data:", error);
          },
        );
      }, 1000);
    },
    [sessionData.sessionId, exerciseData],
  );

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center gap-4 pb-20">
      <div className="flex w-full flex-col items-center gap-6">
        {sessionData.exercises
          .filter(isValidExercise)
          .map(({ exercise, routineExercise }) => (
            <ExceriseRoutineCard
              key={exercise.id}
              exercise={exercise}
              routineExercise={routineExercise}
              previousData={{
                notes: exerciseData[exercise.id].notes,
                sets: exerciseData[exercise.id].sets,
              }}
              onUpdate={(data) => handleExerciseUpdate(exercise.id, data)}
              onRestTimeTrigger={onRestTimeTrigger}
            />
          ))}
      </div>
    </div>
  );
}
