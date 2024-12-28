"use client";

import { useState } from "react";
import ExceriseRoutineCard from "@/app/components/ExceriseRoutineCard";
import type { Exercise } from "@/lib/db/schema";

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
};

interface SessionClientProps {
  sessionData: {
    exercises: ExerciseWithPlan[];
    userId: string;
    planId: string;
    status: "active" | "completed" | "cancelled";
    startedAt: number;
    completedAt: number | null;
  };
}

function isValidExercise(
  exerciseData: ExerciseWithPlan,
): exerciseData is ExerciseWithPlan & { exercise: Exercise } {
  return exerciseData.exercise !== null;
}

export default function SessionClient({ sessionData }: SessionClientProps) {
  const [exerciseData, setExerciseData] = useState<Record<string, any>>({});

  const handleExerciseUpdate = (exerciseId: string, data: any) => {
    setExerciseData((prev) => ({
      ...prev,
      [exerciseId]: data,
    }));
  };

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
              onUpdate={(data) => handleExerciseUpdate(exercise.id, data)}
            />
          ))}
      </div>
    </div>
  );
}
