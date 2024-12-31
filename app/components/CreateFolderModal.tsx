"use client";

import { useAuth } from "@clerk/nextjs";
import React, { useState } from "react";

import SecondaryButton from "@/app/components/SecondaryButton";

import { createFolder } from "../actions/folders";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateFolderModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateFolderModalProps) {
  const { userId } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0 min-h-screen bg-black/50 blur-sm backdrop-blur-sm"></div>
      <div className="relative z-50 flex min-h-screen w-full flex-col items-center justify-center">
        <div className="flex min-w-96 max-w-96 flex-col gap-1 rounded-lg border border-border bg-primary p-4">
          <div>
            <h2 className="flex justify-center pb-2 font-bold">
              Create New Folder
            </h2>
          </div>
          <div>
            <form
              action={async (formData) => {
                if (!userId) {
                  setError("You must be logged in to create a folder");
                  return;
                }

                if (isSubmitting) return;

                try {
                  setIsSubmitting(true);
                  setError(null);

                  const name = formData.get("name")?.toString();
                  if (!name) {
                    setError("Name is required");
                    return;
                  }

                  const result = await createFolder(name, userId);
                  if (result) {
                    onSuccess?.();
                    onClose();
                  }
                } catch (error) {
                  console.error("Error creating folder:", error);
                  setError("Failed to create folder. Please try again.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <input
                name="name"
                className="h-10 w-full rounded-lg border border-border bg-primary px-4"
                type="text"
                placeholder="New Folder"
                required
                min={1}
                onChange={() => setError(null)}
                disabled={isSubmitting}
              />

              <div className="pt-4">
                <SecondaryButton
                  label={isSubmitting ? "Creating..." : "Save"}
                  type="submit"
                  disabled={isSubmitting}
                />
              </div>
              <div className="py-2">
                <SecondaryButton
                  variant="grey"
                  type="button"
                  label="Cancel"
                  onClick={onClose}
                  disabled={isSubmitting}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
