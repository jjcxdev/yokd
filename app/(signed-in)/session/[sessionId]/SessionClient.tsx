"use client";

import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const updateTimeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const { onRestTimeTrigger } = useSessionContext();

  const initialRenderRef = useRef(true);

  // Initialize state with empty object first
  const [exerciseData, setExerciseData] = useState<
    Record<string, { notes: string; sets: ExerciseSet[] }>
  >({});

  // Move initialization logic to useEffect
  useEffect(() => {
    const initialData: Record<string, { notes: string; sets: ExerciseSet[] }> =
      {};

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
          } catch (error) {
            console.error("Failed to create initial sets:", error);
          }

          // Merge routine defaults with previous workout data if available.
          let mergedSets = initialSets;
          let mergedNotes = routineExercise.notes || "";

          if (previousData) {
            try {
              // Parse the stored JSON string from previous data
              const previousSets = previousData.sets
                ? JSON.parse(previousData.sets)
                : [];

              // Prioritize previous session's data as the base
              mergedSets = previousSets.length > 0 ? previousSets : initialSets;
              mergedNotes = previousData.notes || routineExercise.notes || "";
            } catch (error) {
              console.error("Error applying previous data:", error);
            }
          }

          // Prepare local data
          const localData = {
            notes: mergedNotes,
            sets: mergedSets,
          };
          // Prepare the data to send (sets is already an array)
          const dataToSend = {
            notes: mergedNotes,
            sets: mergedSets,
          };

          // Update the local state
          initialData[exercise.id] = localData;

          // Clear any pending timeout for this exercise...
          if (updateTimeoutsRef.current[exercise.id]) {
            clearTimeout(updateTimeoutsRef.current[exercise.id]);
          }

          // Set up an update call with a delay for this exercise.
          updateTimeoutsRef.current[exercise.id] = setTimeout(() => {
            console.log("Sending workout data to server:", {
              sessionId: sessionData.sessionId,
              exerciseId: exercise.id,
              data: dataToSend,
            });
            updateWorkoutData(
              sessionData.sessionId,
              exercise.id,
              dataToSend,
            ).catch((error) => {
              console.error("Error updating workout data:", error);
            });
            delete updateTimeoutsRef.current[exercise.id];
          }, 1000);
        }
      },
    );

    // Set initial data in one operation
    setExerciseData(initialData);
  }, [sessionData.exercises, sessionData.sessionId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(updateTimeoutsRef.current).forEach((timeout) =>
        clearTimeout(timeout),
      );
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

      const currentData = exerciseData[exerciseId];
      const currentSets = currentData?.sets ?? [];

      // Compare data excluding IDs
      const setsAreEqual = isEqual(
        currentSets.map((s: ExerciseSet) => ({
          weight: s.weight,
          reps: s.reps,
          isWarmup: s.isWarmup,
        })),
        data.sets,
      );

      if (currentData?.notes === data.notes && setsAreEqual) {
        console.log("Skipping update - data is the same");
        return;
      }

      const dataToSet = {
        notes: data.notes,
        sets: setsWithIds,
      };

      console.log(`Updating exercise data for ${exerciseId}`, dataToSet);

      setExerciseData((prev) => ({
        ...prev,
        [exerciseId]: dataToSet,
      }));

      // Clear any existing timeout for this exercise.
      if (updateTimeoutsRef.current[exerciseId]) {
        clearTimeout(updateTimeoutsRef.current[exerciseId]);
      }

      // Set a new timeout for updating this exercise.
      updateTimeoutsRef.current[exerciseId] = setTimeout(() => {
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
        delete updateTimeoutsRef.current[exerciseId];
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
                notes: exerciseData[exercise.id]?.notes || "",
                sets: exerciseData[exercise.id]?.sets || [],
              }}
              onUpdate={(data) => handleExerciseUpdate(exercise.id, data)}
              onRestTimeTrigger={onRestTimeTrigger}
            />
          ))}
      </div>
    </div>
  );
}
