"use client";

import React, { useState } from "react";

interface ExerciseCardProps {
  title: string;
  muscleGroup: string;
  exerciseType: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ExerciseCard({ ...props }: ExerciseCardProps) {
  const [borderColor, setBorderColor] = useState("border-border");
  const [borderWidth, setBorderWidth] = useState("border");

  function handleClick() {
    handleColorChange();
    props.onSelect();
  }

  function handleColorChange(): void {
    setBorderColor((prev) =>
      prev === "border-border" ? "border-accent" : "border-transparent",
    );
    setBorderWidth((prev) => (prev === "border" ? "border-2" : "border-2"));
  }

  return (
    <button onClick={handleClick} className="h-fit w-full">
      <div
        className={`rounded-lg border-2 hover:bg-accent/30 ${borderColor} ${borderWidth} p-4`}
      >
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
