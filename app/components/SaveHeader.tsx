import React from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { SaveHeaderProps } from "@/types/types";

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
      <div className="flex-1 pt-8">
        <div>
          <Button
            className="text-sm text-accent"
            onClick={onCancel}
            disabled={disabled || isLoading}
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      </div>
      <div className="flex-1 whitespace-nowrap">
        <div className="flex w-full justify-center">{title}</div>
      </div>
      <div className="flex-1 justify-end">
        <div className="flex w-full justify-end">
          <Button onClick={handleSave} disabled={disabled || isLoading}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
