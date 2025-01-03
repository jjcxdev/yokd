import React, { useState } from "react";
import { BiChevronRight } from "react-icons/bi";

import type { Folders } from "@/types/types";

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
    <div className="w-full rounded-md border-2 border-transparent bg-card p-2 hover:border-2 hover:border-accent md:p-4">
      <div className="flex w-full items-center justify-between">
        <button onClick={handleToggle} className="flex items-center gap-2">
          <BiChevronRight
            className={`h-4 w-4 transition-transform duration-200 md:h-8 md:w-8 ${isExpanded ? "rotate-90" : ""}`}
          />
          <div>{folder.name}</div>
          {props.count && (
            <div className="text-sm text-accent">{props.count}</div>
          )}
        </button>
        <div className="flex items-center">{props.menuIcon} </div>
      </div>

      {isExpanded && <div className="pt-2 md:pt-4">{children}</div>}
    </div>
  );
}
