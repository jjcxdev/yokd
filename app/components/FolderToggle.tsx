import React, { useState } from "react";
import { BiChevronRight } from "react-icons/bi";

import type { Folders } from "@/types/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <>
      <Card className="border-none">
        <CardContent className="flex items-center gap-2 p-4">
          <Button
            variant="ghost"
            onClick={handleToggle}
            className="flex items-center gap-2"
          >
            <BiChevronRight
              className={`h-4 w-4 transition-transform duration-200 md:h-8 md:w-8 ${isExpanded ? "rotate-90" : ""}`}
            />
          </Button>
          <div className="flex w-full items-center justify-between">
            {folder.name}
            <span className="flex w-full justify-start pl-2 text-xs text-accent">
              {props.count}
            </span>
            {props.menuIcon}
          </div>
        </CardContent>

        {isExpanded && (
          <CardFooter className="flex w-full flex-col items-center justify-center">
            <div className="w-full">{children}</div>
          </CardFooter>
        )}
      </Card>
    </>
  );
}
