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
      className="flex h-10 w-44 items-center justify-center gap-2 rounded-lg border border-gray-600 bg-slate-900 text-white"
    >
      {props.icon}
      {props.label}
    </button>
  );
}
