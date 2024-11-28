import React from "react";

interface ExerciseCardProps {
  title: string;
  muscleGroup: string;
  exerciseType: string;
}

export default function ExerciseCard({ ...props }: ExerciseCardProps) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex justify-between">
        <div className="font-bold">{props.title}</div>
        <div className="text-sm italic text-accent">{props.exerciseType}</div>
      </div>
      <div className="text-sm text-dimmed">{props.muscleGroup}</div>
    </div>
  );
}
