import React from "react";

import SecondaryButton from "@/app/components/SecondaryButton";

interface RoutineCardProps {
  label: string;
  desc: string;
  icon?: JSX.Element;
}

export default function RoutineCard({ ...props }: RoutineCardProps) {
  return (
    <div className="bg-primary border-border flex flex-col gap-1 rounded-lg border p-4">
      <div className="flex items-center justify-between font-bold">
        <div>{props.label}</div>
        <div className="text-2xl">{props.icon}</div>
      </div>
      <div className="text-dimmed line-clamp-2 text-xs">{props.desc}</div>

      <div>
        <SecondaryButton label="Start Routine" />
      </div>
    </div>
  );
}
