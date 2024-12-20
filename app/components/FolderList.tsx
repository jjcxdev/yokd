"use client";

import React from "react";
import FolderToggle from "./FolderToggle";
import { TbLayoutNavbarExpandFilled } from "react-icons/tb";
import { FaRegTrashAlt } from "react-icons/fa";
import { Folders } from "@/types/folders";
import { deleteFolder } from "../actions/folders";

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
              deletedFolder={deleteFolder}
              folderIcon={<TbLayoutNavbarExpandFilled />}
              menuIcon={<FaRegTrashAlt />}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
