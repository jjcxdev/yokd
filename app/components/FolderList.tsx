"use client";

import React from "react";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaRegTrashAlt } from "react-icons/fa";
import { TbLayoutNavbarExpandFilled } from "react-icons/tb";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { RoutineWithExercises } from "@/lib/db/schema";
import type { Folder } from "@/types/types";

import { deleteFolder, deleteRoutine } from "../actions/folders";
import FolderToggle from "./FolderToggle";
import RoutineCard from "./RoutineCard";
import { FolderListProps } from "@/types/types";

export default function FolderList({
  folders,
  routines = [],
  onFolderDeleted,
}: FolderListProps) {
  return (
    <div>
      <ul className="flex flex-col gap-4">
        {folders.map((folder) => {
          // Filter routines for this specific folder
          const folderRoutines = routines.filter(
            (routine) => routine.folderId === folder.id,
          );

          return (
            <li className="" key={folder.id}>
              <FolderToggle
                folder={folder}
                menuIcon={
                  <Drawer>
                    <DrawerTrigger asChild>
                      <span className="cursor-pointer hover:text-accent">
                        <BiDotsHorizontalRounded size={20} />
                      </span>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>{folder.name}</DrawerTitle>
                      </DrawerHeader>
                      <div className="p-4">
                        <Button
                          variant="destructive"
                          className="flex w-full items-center justify-center gap-2"
                          onClick={() => {
                            deleteFolder(folder.id);
                            onFolderDeleted?.();
                          }}
                        >
                          <FaRegTrashAlt />
                          Delete Folder
                        </Button>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="outline" className="w-full">
                            Cancel
                          </Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                }
                folderIcon={<TbLayoutNavbarExpandFilled />}
                count={folderRoutines.length.toString()}
              >
                <div className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2">
                  {folderRoutines.map((routine: RoutineWithExercises) => (
                    <RoutineCard
                      key={routine.id}
                      id={routine.id}
                      label={routine.name}
                      exercises={routine.exercises}
                      onDelete={() => {
                        deleteRoutine(routine.id);
                        onFolderDeleted?.();
                      }}
                    />
                  ))}
                </div>
              </FolderToggle>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
