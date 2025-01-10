import React from "react";

import SecondaryButton from "./SecondaryButton";
import { useToast } from "@/hooks/use-toast";

interface ActionHeaderProps {
  title?: string;
  button: string;
  count?: number;
  onAction?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  routineName?: string | null;
}

export default function ActionHeader({
  title,
  button,
  count = 0,
  onAction,
  onCancel,
  isLoading,
  disabled,
}: ActionHeaderProps) {
  const { toast } = useToast();

  const handleAction = () => {
    if (count === 0) {
      toast({
        variant: "destructive",
        title: "No exercises selected",
        description: "Please select at least one exercise",
      });
      return;
    }
    onAction?.();
  };

  return (
    <div className="flex w-full items-baseline justify-between bg-card p-4 md:rounded-t-lg">
      <div className="flex pt-8 text-sm text-accent">
        <button
          className="disabled:opacity-50"
          disabled={disabled || isLoading}
          onClick={onCancel}
        >
          {button}
        </button>
      </div>
      <div className="w-40">
        <SecondaryButton
          label={
            isLoading
              ? "Adding..."
              : `Add ${count} exercise${count === 1 ? "" : "s"}`
          }
          disabled={disabled || isLoading}
          onClick={handleAction}
        />
      </div>
    </div>
  );
}
