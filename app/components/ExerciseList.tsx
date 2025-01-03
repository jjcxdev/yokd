"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import ActionHeader from "@/app/components/ActionHeader";
import ExerciseCard from "@/app/components/ExerciseCard";
import type { Exercise } from "@/types/types";

interface ExerciseListProps {
  initialData: Exercise[];
}

export default function ExerciseList({ initialData }: ExerciseListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const routineName = searchParams.get("routineName");

  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(
    new Set(),
  );

  function handleExerciseToggle(id: string) {
    setSelectedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function handleAddExercises() {
    // Filter the initalData to get only selected exercises
    const selectedExercisesData = initialData.filter((exercise) =>
      selectedExercises.has(exercise.id),
    );

    // Convert to URL-safe string
    const exercisesParam = encodeURIComponent(
      JSON.stringify(selectedExercisesData),
    );

    // Build URL with all parameters
    let url = `/routine?folderId=${folderId}&selectedExercises=${exercisesParam}`;
    if (routineName) {
      url += `&routineName=${encodeURIComponent(routineName)}`;
    }

    // Navigate back to routine page with selected exercises and routine name
    router.push(url);
  }

  function handleCancel() {
    // Return to routine page preserving the routine name if it exists
    let url = `/routine?folderId=${folderId}`;
    if (routineName) {
      url += `&routineName=${encodeURIComponent(routineName)}`;
    }
    router.push(url);
  }

  return (
    <div className="flex min-h-screen w-full flex-col gap-4 md:rounded-lg">
      <div className="sticky top-0 z-10 flex">
        <ActionHeader
          title={"Add Exercise"}
          button={"Cancel"}
          count={selectedExercises.size}
          onAction={handleAddExercises}
          onCancel={handleCancel}
        />
      </div>
      <div>
        <div className="p-4">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {initialData.map((exercise) => (
              <li className="pb-4" key={exercise.id}>
                <ExerciseCard
                  title={exercise.name}
                  muscleGroup={exercise.muscleGroup}
                  exerciseType={exercise.type}
                  isSelected={selectedExercises.has(exercise.id)}
                  onSelect={() => handleExerciseToggle(exercise.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
