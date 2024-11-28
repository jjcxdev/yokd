"use client";

import React, { useState } from "react";

interface ExerciseCardProps {
  title: string;
  muscleGroup: string;
  exerciseType: string;
}

export default function ExerciseCard({ ...props }: ExerciseCardProps) {
  const [borderColor, setBorderColor] = useState("border-border");
  const [borderWidth, setBorderWidth] = useState("border");

  function handleColorChange(): void {
    setBorderColor((prev) =>
      prev === "border-border" ? "border-accent" : "border-border",
    );
    setBorderWidth((prev) => (prev === "border" ? "border-4" : "border"));
  }

  return (
    <button onClick={handleColorChange} className="h-fit w-full">
      <div className={`rounded-lg border ${borderColor} ${borderWidth} p-4`}>
        <div className="flex justify-between">
          <div className="font-bold">{props.title}</div>
          <div className="text-sm italic text-accent">{props.exerciseType}</div>
        </div>
        <div className="flex w-full justify-start text-sm text-dimmed">
          {props.muscleGroup}
        </div>
      </div>
    </button>
  );
}
