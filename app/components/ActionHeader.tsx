import React from "react";

import SecondaryButton from "./SecondaryButton";

interface ActionHeaderProps {
  title?: string;
  button: string;
  count?: number;
  onAction?: () => void;
}

export default function ActionHeader({ ...props }: ActionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between bg-primary p-4">
      <div className="flex pt-8 text-sm text-accent">
        <button>{props.button}</button>
      </div>
      <div className="w-40">
        <SecondaryButton
          label={`Add ${props.count} exercise${props.count !== 1 ? "s" : ""}`}
          onClick={props.onAction}
        />
      </div>
    </div>
  );
}
