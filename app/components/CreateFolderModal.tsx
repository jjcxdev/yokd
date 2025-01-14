"use client";

import { useAuth } from "@clerk/nextjs";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { createFolder } from "../actions/folders";
import { CreateFolderModalProps } from "@/types/types";

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
        <Card className="w-full max-w-96">
          <CardHeader>
            <CardTitle className="flex w-full justify-center">
              Create New Program
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              <Input
                name="name"
                className="h-10 w-full rounded-lg border border-border bg-background px-4"
                type="text"
                placeholder="New Program Name"
                required
                min={1}
                onChange={() => setError(null)}
                disabled={isSubmitting}
              />
              <div className="mt-4 flex gap-4">
                <Button
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Save
                </Button>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
