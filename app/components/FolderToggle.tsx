import React, { useState } from "react";
import { BiChevronRight } from "react-icons/bi";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Folder } from "@/types/types";

import { FolderToggleProps } from "@/types/types";

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
              className={`h-4 w-4 transition-transform duration-200 ease-in-out md:h-8 md:w-8 ${isExpanded ? "rotate-90" : ""}`}
            />
          </Button>
          <div className="flex w-full items-center justify-between">
            <span className="whitespace-nowrap"> {folder.name}</span>

            <span className="flex w-full justify-start pl-2 text-xs text-accent">
              {props.count}
            </span>
            {props.menuIcon}
          </div>
        </CardContent>

        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? "max-h-96" : "max-h-0"}`}
        >
          <CardFooter
            className={`flex w-full flex-col items-center justify-center transition-all duration-200 ease-in-out ${isExpanded ? "translate-y-0 opacity-100" : "-translate-y-0 opacity-0"}`}
          >
            <div className="w-full">{children}</div>
          </CardFooter>
        </div>
      </Card>
    </>
  );
}
