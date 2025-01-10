"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React from "react";
import { FaRegFolderOpen } from "react-icons/fa";

import type { Folders } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <>
      <div className="fixed inset-0">
        <div className="absolute inset-0 min-h-screen bg-black/50 blur-sm backdrop-blur-sm"></div>
        <div className="relative z-50 flex min-h-screen w-full flex-col items-center justify-center">
          <Card className="w-full max-w-96">
            <CardHeader>
              <CardTitle className="flex w-full justify-center">
                Select Program
              </CardTitle>
            </CardHeader>
            <CardContent>
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
              <div className="flex w-full justify-center">
                {" "}
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
