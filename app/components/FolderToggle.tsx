import React from "react";
import { Folders } from "@/types/folders";

interface FolderToggleProps {
  folder: Folders;
  folderIcon?: JSX.Element;
  menuIcon?: JSX.Element;
  count?: string;
  onClick?: () => void;
}

export default function FolderToggle({ folder, ...props }: FolderToggleProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <div>{props.folderIcon}</div>
        <div>{folder.name}</div>
        <div>{props.count}</div>
      </div>
      <div className="text-2xl">{props.menuIcon}</div>
    </div>
  );
}
