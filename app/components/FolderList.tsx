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
import type { PlanWithExercises } from "@/lib/db/schema";
import type { Folders } from "@/types/types";

import { deleteFolder, deletePlan } from "../actions/folders";
import FolderToggle from "./FolderToggle";
import RoutineCard from "./RoutineCard";

interface FolderListProps {
  folders: Folders[];
  plans?: PlanWithExercises[];
  onFolderDeleted?: () => void;
}

export default function FolderList({
  folders,
  plans = [],
  onFolderDeleted,
}: FolderListProps) {
  return (
    <div>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {folders.map((folder) => {
          // Filter plans for this specific folder
          const folderPlans = plans.filter(
            (plan) => plan.folderId === folder.id,
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
                count={folderPlans.length.toString()}
              >
                <div className="space-y-2">
                  {folderPlans.map((plan: PlanWithExercises) => (
                    <RoutineCard
                      key={plan.id}
                      id={plan.id}
                      label={plan.name}
                      exercises={plan.exercises}
                      onDelete={() => {
                        deletePlan(plan.id);
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
