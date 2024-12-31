"use client";

import React from "react";

const VARIANTS = {
  purple: "bg-accent",
  grey: "bg-button",
  dark: "bg-buttonDark",
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
  variant = "purple",
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      onClick={props.onClick}
      className={`${VARIANTS[variant]} flex h-10 w-full max-w-72 items-center justify-center gap-2 rounded-lg text-white`}
    >
      {props.icon && <div className="text-xl">{props.icon}</div>}
      <div className="text-sm">{props.label}</div>
    </button>
  );
}
