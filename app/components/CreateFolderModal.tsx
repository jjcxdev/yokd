"use client";

import React from "react";
import SecondaryButton from "@/app/components/SecondaryButton";
import { useAuth } from "@clerk/nextjs";
import { createFolder } from "../actions/folders";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateFolderModal({
  isOpen,
  onClose,
}: CreateFolderModalProps) {
  const { userId } = useAuth();

  async function handleCreateFolder(formData: FormData) {
    if (!userId) return;
    const name = formData.get("name")?.toString() || "";
    await createFolder(name, userId);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0 min-h-screen bg-black/50 blur-sm backdrop-blur-sm"></div>
      <div className="relative z-50 flex min-h-screen w-96 flex-col justify-center">
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-primary p-4">
          <div>
            <h2 className="flex justify-center pb-2 font-bold">
              Create New Folder
            </h2>
          </div>
          <div>
            <form
              action={async (formData) => {
                await handleCreateFolder(formData);
                onClose();
              }}
            >
              <input
                name="name"
                className="h-10 w-full rounded-lg border border-border bg-primary px-4"
                type="text"
                placeholder="New Folder"
              />

              <div className="pt-4">
                <SecondaryButton label="Save" type="submit" />
              </div>
              <div className="py-2">
                <SecondaryButton
                  variant="grey"
                  type="button"
                  label="Cancel"
                  onClick={onClose}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
