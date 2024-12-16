import React, { startTransition } from "react";
import { Folders } from "@/types/folders";
import { useTransition } from "react";
import { deleteFolder } from "../actions/folders";

interface FolderToggleProps {
  folder: Folders;
  folderIcon?: JSX.Element;
  menuIcon?: JSX.Element;
  count?: string;
  onClick?: () => void;
  deletedFolder?: (folderId: string) => void;
}

export default function FolderToggle({
  folder,
  deletedFolder,
  ...props
}: FolderToggleProps) {
  const [isPending, setIsPending] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await deleteFolder(folder.id);
        // handle success
      } catch (error) {
        // handle error
      }
    });
  }

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <div>{props.folderIcon}</div>
        <div>{folder.name}</div>
        <div>{props.count}</div>
      </div>
      <div className="">
        <button onClick={handleDelete}>{props.menuIcon}</button>
      </div>
    </div>
  );
}
