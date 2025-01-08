import React from "react";

const VARIANTS = {
  yellow: "bg-accent text-background",
  grey: "bg-accent/20 text-background",
  dark: "bg-background",
};

type ButtonVariant = keyof typeof VARIANTS;

interface PrimaryButtonProps {
  variant?: ButtonVariant;
  icon?: JSX.Element;
  onClick?: () => void;
  label: string;
}

export default function PrimaryButton({
  variant = "yellow",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      onClick={props.onClick}
      className={`${VARIANTS[variant]} flex h-full w-full items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-accent px-4 py-2 text-sm font-semibold text-button transition-colors hover:border-2 hover:border-accent hover:bg-accent/50 hover:shadow-md`}
    >
      {props.icon}
      {props.label}
    </button>
  );
}
