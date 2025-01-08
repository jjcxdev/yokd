import React from "react";
import { BsCollectionFill } from "react-icons/bs";
import { FaDumbbell } from "react-icons/fa6";

interface EmptyStateProps {
  onCreateFolder: () => void;
  onCreateRoutine: () => void;
}

export default function EmptyState({
  onCreateFolder,
  onCreateRoutine,
}: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg bg-gradient-to-tr from-[#1A1A1A] via-[#1A1A1A] to-[#E7FC00]/20 p-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-2xl font-bold">Welcome to YOKD</h2>
        <p className="pb-2 text-dimmed">
          Let&apos;s set up your workout routines
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <BsCollectionFill className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-semibold">Create a Program</h3>
          <p className="text-center text-sm text-dimmed">
            Start by creating a program to organize your routines
          </p>
          <button
            onClick={onCreateFolder}
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-button transition-colors hover:bg-accent/90"
          >
            New Program
          </button>
        </div>

        <div className="flex items-center">
          <div className="h-px w-full bg-border"></div>
          <span className="px-4 text-sm text-dimmed">then</span>
          <div className="h-px w-full bg-border"></div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <FaDumbbell className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-semibold">Add a Routine</h3>
          <p className="text-center text-sm text-dimmed">
            Create your first workout routine with exercises
          </p>
          <button
            onClick={onCreateRoutine}
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-button transition-colors hover:bg-accent/90"
          >
            New Routine
          </button>
        </div>
      </div>
    </div>
  );
}
