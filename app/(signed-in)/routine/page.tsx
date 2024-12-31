"use client";

import { useUser } from "@clerk/nextjs";
import _ from "lodash";
import { nanoid } from "nanoid";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { GiWeightLiftingUp } from "react-icons/gi";
import { IoAddCircle } from "react-icons/io5";

import { postRoutines } from "@/app/actions/routines";
import ExerciseRoutineCard from "@/app/components/ExceriseRoutineCard";
import SaveHeader from "@/app/components/SaveHeader";
import SecondaryButton from "@/app/components/SecondaryButton";
import type { Exercise } from "@/lib/db/schema";
import type { ExerciseInput } from "@/types/types";

interface ExerciseData {
  exerciseId: string;
  notes: string;
  sets: Array<{ weight: string; reps: string }>;
}

function RoutineContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const selectedExercisesParam = searchParams.get("selectedExercises");
  const routineNameParam = searchParams.get("routineName");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routineName, setRoutineName] = useState<string>(
    routineNameParam || "",
  );
  const [exerciseData, setExerciseData] = useState<
    Record<string, ExerciseData>
  >({});

  useEffect(() => {
    // When we recive new selected exercises, add them to our existing exercises
    if (selectedExercisesParam) {
      try {
        const newExercises = JSON.parse(
          decodeURIComponent(selectedExercisesParam),
        );
        setExercises((prevExercises) => {
          // Create a set of existing exercise IDs to avoid duplicates
          const existingIds = new Set(prevExercises.map((e) => e.id));

          // Only add exercises that don't already exist
          const uniqueNewExercises = newExercises.filter(
            (exercise: Exercise) => !existingIds.has(exercise.id),
          );

          return [...prevExercises, ...uniqueNewExercises];
        });

        // Clean up URL after processing but preserve Routine Name
        const currentRoutineName = routineName || routineNameParam;
        if (currentRoutineName) {
          router.replace(
            `/routine?folderId=${folderId}&routineName=${encodeURIComponent(currentRoutineName)}`,
          );
        } else {
          router.replace(`/routine?folderId=${folderId}`);
        }
      } catch (error) {
        console.error("Error parsing selected exercises:", error);
      }
    }
  }, [selectedExercisesParam, router, folderId, routineName, routineNameParam]);

  function handleExerciseUpdate(exerciseId: string, data: ExerciseData) {
    setExerciseData((prev) => {
      // Only update if data has actuall changed
      if (JSON.stringify(prev[exerciseId]) === JSON.stringify(data)) {
        return prev;
      }
      return {
        ...prev,
        [exerciseId]: data,
      };
    });
  }

  const memoizedUpdate = useCallback(handleExerciseUpdate, []);

  function handleAddExercise() {
    // Navigate to exercise selection page, preserving folderId and routine name
    const currentRoutineName = routineName || routineNameParam;
    if (currentRoutineName) {
      router.push(
        `/exercise?folderId=${folderId}&routineName=${encodeURIComponent(currentRoutineName)}`,
      );
    } else {
      router.push(`/exercise?folderId=${folderId}`);
    }
  }

  function handleRoutineNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value;
    setRoutineName(newName);
    // Update URL with new routine name
    if (newName) {
      router.replace(
        `/routine?folderId=${folderId}&routineName=${encodeURIComponent(newName)}`,
      );
    } else {
      router.replace(`/routine?folderId=${folderId}`);
    }
  }

  function handleSave() {
    if (!routineName || !folderId || !user) return;

    // Transform exerciseData into ExerciseInput array
    const exerciseInputs: ExerciseInput[] = Object.entries(exerciseData).map(
      ([_, data], index) => ({
        id: nanoid(),
        routineId: "",
        exerciseId: data.exerciseId,
        order: index,
        workingSetWeights: data.sets.map((set) => parseInt(set.weight) || 0),
        targetWeight: 0,
        warmupSets: 0,
        warmupReps: 0,
        workingSets: data.sets.length,
        workingReps: parseInt(data.sets[0]?.reps || "0"),
        restTime: 30,
        notes: data.notes || undefined,
      }),
    );

    postRoutines({
      name: routineName,
      folderId: folderId,
      exercises: exerciseInputs,
      userId: user.id,
    })
      .then((result) => {
        if (result.success) {
          // small delay before navigation
          setTimeout(() => {
            router.refresh(); // Force refresh of the page data
            router.push(`/dashboard`);
          }, 500);
        } else {
          // Handle error
          console.error("Failed to save routine:", result.error);
          // TODO: Show error to user
        }
      })
      .catch((error) => {
        console.error("Error saving routine:", error);
        // TODO: Show error to user
      });
  }

  function handleCancel() {
    router.push(`/dashboard`);
  }

  return (
    <div className="flex min-h-full w-full max-w-3xl flex-col gap-4 bg-background">
      <div className="sticky top-0 z-10 flex flex-col">
        <SaveHeader
          title={"Create Routine"}
          button={"Cancel"}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        <div>
          <form className="px-2">
            <input
              className="h-10 w-full border-b-2 border-accent bg-background px-4"
              name="routine"
              type="text"
              placeholder="Routine Name"
              value={routineName}
              onChange={handleRoutineNameChange}
            />
          </form>
        </div>
      </div>

      {/* Exercise section */}

      {exercises.length === 0 ? (
        <div className="flex w-full flex-col justify-center p-4">
          <div className="flex justify-center p-4 text-6xl text-dimmed">
            <GiWeightLiftingUp />
          </div>
          <p className="flex justify-center text-dimmed">
            Add exercises to your routine
          </p>
        </div>
      ) : (
        <div className="flex flex-col p-4">
          {exercises.map((exercise) => (
            <div className="flex w-full justify-center pb-2" key={exercise.id}>
              <ExerciseRoutineCard
                exercise={exercise}
                routineExercise={{
                  id: "",
                  routineId: "",
                  exerciseId: exercise.id,
                  order: 0,
                  workingSetWeights: "[]",
                  warmupSets: 0,
                  warmupReps: 0,
                  workingSets: 0,
                  workingReps: 0,
                  restTime: 0,
                  notes: "",
                }}
                onUpdate={(data) => memoizedUpdate(exercise.id, data)}
                onRestTimeTrigger={() => {}}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex w-full justify-center">
        <div className="flex w-full justify-center pb-8">
          <SecondaryButton
            icon={<IoAddCircle />}
            label={"Add exercise"}
            variant="grey"
            onClick={handleAddExercise}
          />
        </div>
      </div>
    </div>
  );
}

export default function RoutinePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoutineContent />
    </Suspense>
  );
}
