"use client";

import ActionHeader from "@/app/components/ActionHeader";
import ExerciseCard from "@/app/components/ExerciseCard";
import { useState } from "react";
import type { Exercise } from "@/types/exercises";
import { db } from "@/lib/db";

interface ExerciseListProps {
  initialData: Exercise[];
}

export default function ExerciseList({ ...props }: ExerciseListProps) {
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

  return (
    <div className="flex min-h-screen w-96 flex-col gap-4 border border-red-500">
      <div className="fixed w-96">
        <ActionHeader
          title={"Add Exercise"}
          button={"Cancel"}
          count={selectedExercises.size}
        />
      </div>
      <div>
        <div className="p-4 pt-32">
          <ul>
            {props.initialData.map((exercise) => (
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
