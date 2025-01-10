import React from "react";

import { Button } from "@/components/ui/button";
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

  const getButtonText = () => `Add ${count} exercise${count === 1 ? "" : "s"}`;

  return (
    <div className="flex w-full items-baseline justify-between bg-card p-4 md:rounded-t-lg">
      <div className="flex pt-8 text-sm text-accent">
        <Button
          variant="ghost"
          disabled={disabled || isLoading}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
      <div className="w-40">
        <Button disabled={disabled || isLoading} onClick={handleAction}>
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
}
