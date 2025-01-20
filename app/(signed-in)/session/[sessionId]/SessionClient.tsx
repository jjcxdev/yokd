"use client";

import { isEqual } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

import { updateWorkoutData } from "@/app/actions/workout";
import ExceriseRoutineCard from "@/app/components/ExceriseRoutineCard";
import { type Exercise } from "@/lib/db/schema";
import type {
  ExerciseSet,
  ExerciseWithRoutine,
  SessionClientProps,
} from "@/types/types";

import { useSessionContext } from "./SessionContext";

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
          let initialSets: ExerciseSet[] = [];
          try {
            const workingWeights = JSON.parse(
              routineExercise.workingSetWeights,
            );
            const warmupWeights = JSON.parse(routineExercise.warmupSetWeights);

            // Create warmup sets
            const warmupSets = Array(routineExercise.warmupSets)
              .fill(null)
              .map((_, index) => ({
                weight:
                  warmupWeights[index] === null
                    ? ""
                    : (warmupWeights[index]?.toString() ?? ""),
                reps:
                  routineExercise.warmupReps === null
                    ? ""
                    : routineExercise.warmupReps.toString(),
                isWarmup: true,
              }));

            // Create working sets
            const workingSets = Array(routineExercise.workingSets)
              .fill(null)
              .map((_, index) => ({
                weight:
                  workingWeights[index] === null
                    ? ""
                    : (workingWeights[index]?.toString() ?? ""),
                reps:
                  routineExercise.workingReps === null
                    ? ""
                    : routineExercise.workingReps.toString(),
                isWarmup: false,
              }));

            initialSets = [...warmupSets, ...workingSets];
          } catch {
            initialSets = [];
          }

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
      if (initialRenderRef.current) {
        console.log("Skipping update - initial render");
        initialRenderRef.current = false;
        return;
      }
      console.log("Raw incoming sets data:", data.sets);

      console.log("Processing exercise update - not initial render");

      // Add IDs back to sets before storing
      const setsWithIds = data.sets.map((set, index) => {
        const newId = set.isWarmup ? index + 1 : index + 100;
        console.log(`Mapping set ${index}:`, { set, newId });
        return {
          ...set,
          id: newId,
        };
      });

      console.log("Mapped sets with IDs:", setsWithIds);

      const dataToSet = {
        notes: data.notes,
        sets: JSON.stringify(setsWithIds),
      };

      // Parse both current and new data for comparison
      const currentData = exerciseData[exerciseId];
      const currentSets = JSON.parse(currentData.sets) as Array<
        ExerciseSet & { id: number }
      >;

      // Compare data excluding IDs
      const setsAreEqual = isEqual(
        currentSets.map((s: ExerciseSet & { id: number }) => ({
          weight: s.weight,
          reps: s.reps,
          isWarmup: s.isWarmup,
        })),
        data.sets,
      );

      // Only update state if data has changed
      if (currentData.notes === data.notes && setsAreEqual) {
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
