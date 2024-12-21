"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React from "react";
import { FaRegFolderOpen } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";
import { TbLayoutNavbarExpandFilled } from "react-icons/tb";

import type { Folders } from "@/types/folders";

import FolderToggle from "./FolderToggle";

interface SelectFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folders[];
}

export default function SelectFolderModal({
  isOpen,
  onClose,
  folders,
}: SelectFolderModalProps) {
  const { userId } = useAuth();
  const router = useRouter();

  function handleFolderSelect(folderId: string) {
    router.push(`/routine?folderId=${folderId}`);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0 min-h-screen bg-black/50 blur-sm backdrop-blur-sm"></div>
      <div className="relative z-50 flex min-h-screen w-96 flex-col justify-center">
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-primary p-4">
          <div>
            <h2 className="flex justify-center pb-2 font-bold">
              Select Folder
            </h2>
          </div>
          <div>
            <ul>
              {folders.map((folder) => (
                <li
                  className="cursor-pointer pb-4"
                  key={folder.id}
                  onClick={() => handleFolderSelect(folder.id)}
                >
                  <FolderToggle
                    folder={folder}
                    folderIcon={<FaRegFolderOpen />}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
