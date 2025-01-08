"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React from "react";
import { FaRegFolderOpen } from "react-icons/fa";

import type { Folders } from "@/types/types";

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
  const router = useRouter();

  function handleFolderSelect(folderId: string) {
    router.push(`/routine?folderId=${folderId}`);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0 min-h-screen bg-black/50 blur-sm backdrop-blur-sm"></div>
      <div className="relative z-50 flex min-h-screen w-full flex-col items-center justify-center">
        <div className="flex w-full max-w-96 flex-col gap-1 rounded-lg border border-border bg-card p-4">
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
                  <div className="flex items-center gap-4">
                    <FaRegFolderOpen className="h-4 w-4 text-accent" />
                    <span>{folder.name}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-center">
              <button
                onClick={onClose}
                className="rounded-lg bg-accent/10 px-4 py-2 transition-colors hover:bg-accent/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
