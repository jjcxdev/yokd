import React from "react";
import { VscNewFolder } from "react-icons/vsc";
import { MdFormatListBulletedAdd } from "react-icons/md";
import Image from "next/image";

interface EmptyStateProps {
  onCreateFolder: () => void;
  onCreateRoutine: () => void;
}

export default function EmptyState({
  onCreateFolder,
  onCreateRoutine,
}: EmptyStateProps) {
  return (
    <div className="flex h-[82vh] flex-col items-center justify-center rounded-lg border-2 border-accent p-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-2xl font-bold">Welcome to YOKD</h2>
        <p className="text-dimmed">Let's set up your workout routines</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <VscNewFolder className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-semibold">Create a Folder</h3>
          <p className="text-center text-sm text-dimmed">
            Start by creating a folder to organize your workouts
          </p>
          <button
            onClick={onCreateFolder}
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent/90"
          >
            New Folder
          </button>
        </div>

        <div className="flex items-center">
          <div className="h-px w-full bg-border"></div>
          <span className="px-4 text-sm text-dimmed">then</span>
          <div className="h-px w-full bg-border"></div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <MdFormatListBulletedAdd className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-semibold">Add a Routine</h3>
          <p className="text-center text-sm text-dimmed">
            Create your first workout routine with exercises
          </p>
          <button
            onClick={onCreateRoutine}
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent/90"
          >
            New Routine
          </button>
        </div>
      </div>
    </div>
  );
}
