"use client";

import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  updateWorkoutData,
  bulkUpdateWorkoutData,
} from "@/app/actions/workout";
import ExceriseRoutineCard from "@/app/components/ExerciseRoutineCard";
import { type Exercise } from "@/lib/db/schema";
import type {
  ExerciseSet,
  ExerciseWithRoutine,
  SessionClientProps,
  ExerciseData,
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
    Record<string, ExerciseData>
  >({});

  // Always initialize the exerciseData using sessionData.
  // We no longer check localStorage here.
  useEffect(() => {
    const initialData: Record<string, ExerciseData> = {};
    sessionData.exercises.forEach((exercise) => {
      if (exercise.exercise) {
        const parsedSets = (() => {
          const setsData = exercise.previousData?.sets;
          if (!setsData) return [];

          try {
            const parsed =
              typeof setsData === "string" ? JSON.parse(setsData) : setsData;
            return Array.isArray(parsed)
              ? parsed.map((set) => ({
                  id: set.setNumber,
                  weight: set.weight.toString(),
                  reps: set.reps.toString(),
                  isWarmup: Boolean(set.isWarmup),
                }))
              : [];
          } catch (error) {
            console.error("Error parsing sets:", error);
            return [];
          }
        })();
        initialData[exercise.exercise.id] = {
          exerciseId: exercise.exercise.id,
          notes: exercise.previousData?.notes || "",
          sets: parsedSets,
        };
      }
    });
    setExerciseData(initialData);

    // Clear any local storage cache for this session, as it is not used at startup.
    localStorage.removeItem(`session-${sessionData.sessionId}`);
  }, [sessionData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(updateTimeoutsRef.current).forEach((timeout) =>
        clearTimeout(timeout),
      );
    };
  }, []);

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (Object.keys(exerciseData).length > 0) {
        bulkUpdateWorkoutData(sessionData.sessionId, exerciseData).catch(
          console.error,
        );
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [exerciseData, sessionData]);

  const validateExerciseData = (data: Record<string, ExerciseData>) => {
    return Object.entries(data).every(([_, exercise]) => {
      return (
        exercise &&
        typeof exercise === "object" &&
        Array.isArray(exercise.sets) &&
        typeof exercise.exerciseId === "string"
      );
    });
  };

  const handleExerciseUpdate = useCallback(
    (exerciseId: string, data: ExerciseData) => {
      setExerciseData((prev) => {
        const newData = {
          ...prev,
          [exerciseId]: data,
        };

        if (validateExerciseData(newData)) {
          // Only update if data is valid
          localStorage.setItem(
            `session-${sessionData.sessionId}`,
            JSON.stringify(newData),
          );
          return newData;
        }
        return prev;
      });
    },
    [sessionData.sessionId],
  );

  // Change the helper function to handle potential missing IDs while preserving types
  const ensureSetsHaveIds = (
    sets: Array<Omit<ExerciseSet, "id"> & { id?: number }>,
  ): ExerciseSet[] => {
    return sets.map((set, index) => ({
      ...set,
      id: set.id || index + 1, // Use existing ID if present, otherwise generate
    }));
  };

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
                sets: ensureSetsHaveIds(exerciseData[exercise.id]?.sets || []),
              }}
              onUpdate={(data) => handleExerciseUpdate(exercise.id, data)}
              onRestTimeTrigger={onRestTimeTrigger}
            />
          ))}
      </div>
    </div>
  );
}
