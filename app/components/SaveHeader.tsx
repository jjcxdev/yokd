import React from "react";
import SecondaryButton from "./SecondaryButton";

interface SaveHeaderProps {
  title: string;
  button: string;
}

export default function ActionHeader({ ...props }: SaveHeaderProps) {
  return (
    <div className="flex items-baseline justify-between bg-primary p-4">
      <div className="flex pt-8 text-sm text-accent">
        <button>{props.button}</button>
      </div>
      <div>{props.title}</div>
      <div className="w-20">
        <SecondaryButton label={"Save"} />
      </div>
    </div>
  );
}
