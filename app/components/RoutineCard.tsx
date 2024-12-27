import React from "react";

import SecondaryButton from "@/app/components/SecondaryButton";

interface RoutineCardProps {
  label: string;
  exercises: Array<{ name: string }>;
  icon?: JSX.Element;
}

export default function RoutineCard({ ...props }: RoutineCardProps) {
  // Convert exercises array to comma-separated string
  const exerciseList = props.exercises.map((ex) => ex.name).join(", ");

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-primary p-4">
      <div className="flex items-center justify-between font-bold">
        <div>{props.label}</div>
        <div className="text-2xl">{props.icon}</div>
      </div>
      <div className="line-clamp-2 text-xs text-dimmed">{exerciseList}</div>

      <div>
        <SecondaryButton label="Start Routine" />
      </div>
    </div>
  );
}
