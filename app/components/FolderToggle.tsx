import React, { startTransition, useState } from "react";
import { useTransition } from "react";
import { BiChevronRight } from "react-icons/bi";

import type { Folders } from "@/types/folders";

import { deleteFolder } from "../actions/folders";

interface FolderToggleProps {
  folder: Folders;
  folderIcon?: JSX.Element;
  menuIcon?: JSX.Element;
  count?: string;
  onClick?: () => void;
  deletedFolder?: (folderId: string) => void;
  children?: React.ReactNode;
}

export default function FolderToggle({
  folder,
  deletedFolder,
  children,
  ...props
}: FolderToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await deleteFolder(folder.id);
        deletedFolder?.(folder.id);
        // handle success
      } catch (error) {
        // handle error
        console.error("Failed to delete folder:", error);
      }
    });
  }

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
          {props.count && <div className="text-sm">{props.count}</div>}
        </button>
        <button onClick={handleDelete}>{props.menuIcon}</button>
      </div>

      {isExpanded && <div>{children}</div>}
    </div>
  );
}
