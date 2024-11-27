import React from "react";

interface PrimaryButtonProps {
  onClick?: () => void;
  label: string;
}

export default function PrimaryButton({ ...props }: PrimaryButtonProps) {
  return (
    <button
      onClick={props.onClick}
      className="bg-accent flex h-10 w-full items-center justify-center gap-2 rounded-lg text-white"
    >
      {props.label}
    </button>
  );
}
