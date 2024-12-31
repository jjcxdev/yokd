"use client";

import { isEqual } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

import { updateWorkoutData } from "@/app/actions/workout";
import ExceriseRoutineCard from "@/app/components/ExceriseRoutineCard";
import { type Exercise } from "@/lib/db/schema";

type ExerciseSet = {
  weight: string;
  reps: string;
};

type ExerciseWithPlan = {
  exercise: Exercise | null;
  planExercise: {
    id: string;
    planId: string;
    exerciseId: string;
    order: number;
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
    exercises: ExerciseWithPlan[];
    userId: string;
    planId: string;
    status: "active" | "completed" | "cancelled";
    startedAt: number;
    completedAt: number | null;
    sessionId: string;
  };
  onRestTimeTrigger: (time: number) => void;
}

function isValidExercise(
  exerciseData: ExerciseWithPlan,
): exerciseData is ExerciseWithPlan & { exercise: Exercise } {
  return exerciseData.exercise !== null;
}

export default function SessionClient({
  sessionData,
  onRestTimeTrigger,
}: SessionClientProps) {
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
      ({ exercise, planExercise, previousData }) => {
        if (exercise) {
          console.log(
            `Initializing exercise data for ${exercise.id}`,
            previousData,
            planExercise,
          );

          // If we have previous data, use it
          if (previousData) {
            console.log(`Found previous data for ${exercise.id}`, previousData);
            initialData[exercise.id] = {
              notes: previousData.notes,
              sets: previousData.sets,
            };
          } else {
            console.log(
              `No previous data for ${exercise.id}, initializing with empty data`,
            );
            // Otherwise, initialize with empty data
            const totalSets =
              planExercise.warmupSets + planExercise.workingSets;
            const emptySets = Array(totalSets).fill({
              weight: "",
              reps: planExercise.workingReps.toString(),
            });

            initialData[exercise.id] = {
              notes: planExercise.notes || "",
              sets: JSON.stringify(emptySets),
            };
          }
          console.log(
            `Final intial data for ${exercise.id}`,
            initialData[exercise.id],
          );
        }
      },
    );

    console.log("Finial initialized exercise data:", initialData);
    hasInitialized.current = true;
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
    <div className="flex min-h-screen w-96 flex-col gap-4">
      <div className="flex flex-col gap-6">
        {sessionData.exercises
          .filter(isValidExercise)
          .map(({ exercise, planExercise }) => (
            <ExceriseRoutineCard
              key={exercise.id}
              exercise={exercise}
              planExercise={planExercise}
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
