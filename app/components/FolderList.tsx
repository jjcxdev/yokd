"use client";

import React from "react";
import FolderToggle from "./FolderToggle";
import { TbLayoutNavbarExpandFilled } from "react-icons/tb";
import { GoKebabHorizontal } from "react-icons/go";
import { Folders } from "@/types/folders";

interface FolderListProps {
  folders: Folders[];
}

export default function FolderList({ folders }: FolderListProps) {
  return (
    <div>
      <ul>
        {folders.map((folder) => (
          <li className="pb-4" key={folder.id}>
            <FolderToggle
              folder={folder}
              folderIcon={<TbLayoutNavbarExpandFilled />}
              menuIcon={<GoKebabHorizontal />}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
