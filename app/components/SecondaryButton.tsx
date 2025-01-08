"use client";

import React from "react";

const VARIANTS = {
  yellow: "bg-accent text-background",
  grey: "bg-accent/20",
  dark: "bg-background",
} as const;

type ButtonVariant = keyof typeof VARIANTS;

interface SecondaryButtonProps {
  variant?: ButtonVariant;
  type?: string;
  icon?: JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
  label: string;
}

export default function SecondaryButton({
  variant = "yellow",
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      onClick={props.onClick}
      className={`${VARIANTS[variant]} flex h-10 w-full items-center justify-center gap-2 rounded-lg font-semibold`}
    >
      {props.icon && <div className="text-xl">{props.icon}</div>}
      <div className="text-sm">{props.label}</div>
    </button>
  );
}
