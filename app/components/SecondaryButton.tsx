import React from "react";

const VARIANTS = {
  purple: "bg-accent",
  grey: "bg-border",
} as const;

type ButtonVariant = keyof typeof VARIANTS;

interface PrimaryButtonProps {
  variant?: ButtonVariant;
  type?: string;
  icon?: JSX.Element;
  onClick?: () => void;
  label: string;
}

export default function PrimaryButton({
  variant = "purple",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      onClick={props.onClick}
      className={`${VARIANTS[variant]} flex h-10 w-full items-center justify-center gap-2 rounded-lg text-white`}
    >
      {props.icon}
      {props.label}
    </button>
  );
}
