"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExerciseCardProps } from "@/types/types";

export default function ExerciseCard({ ...props }: ExerciseCardProps) {
  const [borderColor, setBorderColor] = useState("border-transparent");
  const [borderWidth, setBorderWidth] = useState("border");

  function handleClick() {
    if (props.disabled) return;
    handleColorChange();
    props.onSelect();
  }

  function handleColorChange(): void {
    setBorderColor((prev) =>
      prev === "border-transparent" ? "border-accent" : "border-transparent",
    );
    setBorderWidth((prev) => (prev === "border-2" ? "border-2" : "border-2"));
  }

  // DON'T REAPLACE WITH SHADCN -- TOO MUCH CUSTOMIZATION
  return (
    <div className="p-2">
      <button
        disabled={props.disabled}
        onClick={handleClick}
        className="h-fit w-full"
      >
        <div
          className={`rounded-lg border-2 bg-card hover:bg-accent/30 ${borderColor} ${borderWidth} p-4`}
        >
          <div className="flex justify-between">
            <div className="truncate text-sm font-bold">{props.title}</div>
            <div className="text-sm italic text-accent">
              {props.exerciseType}
            </div>
          </div>
          <div className="flex w-full justify-start text-sm text-dimmed">
            {props.muscleGroup}
          </div>
        </div>
      </button>
    </div>
  );
}
