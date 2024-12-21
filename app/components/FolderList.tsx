"use client";

import React from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { TbLayoutNavbarExpandFilled } from "react-icons/tb";

import { type Plan } from "@/lib/db/schema";
import type { Folders } from "@/types/folders";

import { deleteFolder } from "../actions/folders";
import FolderToggle from "./FolderToggle";
import RoutineCard from "./RoutineCard";

interface FolderListProps {
  folders: Folders[];
  plans?: Plan[];
  onFolderDeleted?: () => void;
}

export default function FolderList({
  folders,
  plans = [],
  onFolderDeleted,
}: FolderListProps) {
  return (
    <div>
      <ul>
        {folders.map((folder) => {
          // Filter plans for this specific folder
          const folderPlans = plans.filter(
            (plan) => plan.folderId === folder.id,
          );

          return (
            <li className="pb-4" key={folder.id}>
              <FolderToggle
                folder={folder}
                deletedFolder={() => {
                  deleteFolder(folder.id);
                  onFolderDeleted?.();
                }}
                folderIcon={<TbLayoutNavbarExpandFilled />}
                menuIcon={<FaRegTrashAlt />}
                count={folderPlans.length.toString()}
              >
                <div className="space-y-2">
                  {folderPlans.map((plan) => (
                    <RoutineCard
                      key={plan.id}
                      label={plan.name}
                      desc={plan.description || "No description available"}
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
