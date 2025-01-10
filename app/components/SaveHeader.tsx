import React from "react";
import { useToast } from "@/hooks/use-toast";
import SecondaryButton from "./SecondaryButton";

interface SaveHeaderProps {
  title: string;
  button: string;
  onSave?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  routineName?: string;
  exerciseCount?: number;
}

export default function SaveHeader({
  title,
  button,
  onSave,
  onCancel,
  isLoading,
  disabled,
  routineName,
  exerciseCount = 0,
}: SaveHeaderProps) {
  const { toast } = useToast();

  const handleSave = () => {
    if (!routineName?.trim()) {
      toast({
        variant: "destructive",
        title: "Routine name is required",
        description: "Please enter a name for your routine",
      });
      return;
    }

    if (exerciseCount === 0) {
      toast({
        variant: "destructive",
        title: "No exercises selected",
        description:
          "Please select at least one exercise to add to your routine",
      });
      return;
    }
    onSave?.();
  };

  return (
    <div className="sticky z-50 flex w-full items-baseline justify-between bg-card p-4 md:rounded-t-lg">
      <div className="flex pt-8 text-sm text-accent">
        <button
          className="disabled:opacity-50"
          onClick={onCancel}
          disabled={disabled || isLoading}
        >
          {button}
        </button>
      </div>
      <div>{title}</div>
      <div className="w-20">
        <SecondaryButton
          label={isLoading ? "Saving..." : "Save"}
          onClick={handleSave}
          disabled={disabled || isLoading}
        />
      </div>
    </div>
  );
}
