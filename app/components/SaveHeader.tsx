import React from "react";

import SecondaryButton from "./SecondaryButton";

interface SaveHeaderProps {
  title: string;
  button: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function ActionHeader({ ...props }: SaveHeaderProps) {
  return (
    <div className="flex w-full items-baseline justify-between bg-primary p-4 md:rounded-t-lg">
      <div className="flex pt-8 text-sm text-accent">
        <button onClick={props.onCancel}>{props.button}</button>
      </div>
      <div>{props.title}</div>
      <div className="w-20">
        <SecondaryButton label={"Save"} onClick={props.onSave} />
      </div>
    </div>
  );
}
