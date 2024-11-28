import React from "react";

interface FolderToggleProps {
  folderIcon?: JSX.Element;
  menuIcon?: JSX.Element;
  label: string;
  count: string;
  onClick?: () => void;
}

export default function FolderToggle({ ...props }: FolderToggleProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <div>{props.folderIcon}</div>
        <div>{props.label}</div>
        <div>{props.count}</div>
      </div>
      <div className="text-2xl">{props.menuIcon}</div>
    </div>
  );
}
