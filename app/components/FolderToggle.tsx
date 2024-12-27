import React, { useState } from "react";
import { BiChevronRight } from "react-icons/bi";

import type { Folders } from "@/types/folders";

interface FolderToggleProps {
  folder: Folders;
  folderIcon?: JSX.Element;
  menuIcon?: JSX.Element;
  count?: string;
  deletedFolder?: (folderId: string) => void;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function FolderToggle({
  folder,
  children,
  deletedFolder,
  ...props
}: FolderToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    props.onClick?.();
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <button onClick={handleToggle} className="flex items-center gap-2">
          <BiChevronRight
            className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          />
          <div>{folder.name}</div>
          {props.count && (
            <div className="text-sm text-accent">{props.count}</div>
          )}
        </button>
        <div className="flex items-center">{props.menuIcon} </div>
      </div>

      {isExpanded && <div>{children}</div>}
    </div>
  );
}
