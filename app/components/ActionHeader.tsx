import React from "react";

interface ActionHeaderProps {
  title: string;
  button: string;
}

export default function ActionHeader({ ...props }: ActionHeaderProps) {
  return (
    <div className="flex items-baseline bg-primary p-4">
      <div className="flex w-1/3 pt-8 text-sm text-accent">
        <button>{props.button}</button>
      </div>
      <div className="w-1/3">{props.title}</div>
      <div className="w-1/3"></div>
    </div>
  );
}
