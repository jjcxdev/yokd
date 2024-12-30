import React from "react";

interface PrimaryButtonProps {
  icon?: JSX.Element;
  onClick?: () => void;
  label: string;
}

export default function PrimaryButton({ ...props }: PrimaryButtonProps) {
  return (
    <button
      onClick={props.onClick}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-accent/60 text-white transition-colors hover:border-2 hover:border-accent hover:bg-accent/50 hover:shadow-md"
    >
      {props.icon}
      {props.label}
    </button>
  );
}
