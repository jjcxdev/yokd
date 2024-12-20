"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SaveHeader from "@/app/components/SaveHeader";
import SecondaryButton from "@/app/components/SecondaryButton";
import ExerciseRoutineCard from "@/app/components/ExceriseRoutineCard";
import { IoAddCircle } from "react-icons/io5";
import { GiWeightLiftingUp } from "react-icons/gi";
import { useCallback, useEffect, useState } from "react";
import { Exercise } from "@/lib/db/schema";
import { postRoutines } from "@/app/actions/routines";
import { ExerciseInput } from "@/types/exercises";
import { nanoid } from "nanoid";

interface ExerciseData {
  exerciseId: string;
  notes: string;
  sets: Array<{ weight: string; reps: string }>;
}

export default function Routine() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const selectedExercisesParam = searchParams.get("selectedExercises");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routineName, setRoutineName] = useState<string>("");
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

        // Clean up URL after processing
        router.replace(`/routine?folderId=${folderId}`);
      } catch (error) {
        console.error("Error parsing selected exercises:", error);
      }
    }
  }, [selectedExercisesParam, router, folderId]);

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
    // Navigate to exercise selection page, preserving folderId
    router.push(`/exercise?folderId=${folderId}`);
  }

  function handleSave() {
    if (!routineName || !folderId) return;

    // Transform exerciseData into ExerciseInput array
    const exerciseInputs: ExerciseInput[] = Object.entries(exerciseData).map(
      ([_, data], index) => ({
        id: nanoid(),
        planId: folderId,
        exerciseId: data.exerciseId,
        order: index,
        warmupSets: 0,
        warmupReps: 0,
        workingSets: data.sets.length,
        workingReps: parseInt(data.sets[0]?.reps || "0"),
        restTime: 60,
        notes: data.notes || undefined,
      }),
    );

    postRoutines({
      name: routineName,
      folderId: folderId,
      exercises: exerciseInputs,
    }).then((result) => {
      if (result.success) {
        router.push(`/dashboard`);
      } else {
        // Handle error
        console.error("Failed to save routine:", result.error);
      }
    });
  }

  function handleCancel() {
    router.push(`/dashboard`);
  }

  return (
    <div className="flex min-h-screen w-96 flex-col gap-4 border border-red-500">
      <SaveHeader
        title={"Create Routine"}
        button={"Cancel"}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <div>
        <form className="px-2">
          <input
            className="h-10 w-full border-b-2 border-accent bg-transparent px-4"
            name="routine"
            type="text"
            placeholder="Routine Name"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
          />
        </form>
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
            <div className="pb-2" key={exercise.id}>
              <ExerciseRoutineCard
                exercise={exercise}
                onUpdate={(data) => memoizedUpdate(exercise.id, data)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex w-full justify-center">
        <div className="w-3/4">
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
