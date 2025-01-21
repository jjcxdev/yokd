"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BsCollectionFill } from "react-icons/bs";
import { FaDumbbell } from "react-icons/fa6";

import CreateFolderModal from "@/app/components/CreateFolderModal";
import { Button } from "@/components/ui/button";
import type { RoutineWithExercises } from "@/lib/db/schema";
import type { Folder } from "@/types/types";

import EmptyState from "./EmptyState";
import FolderList from "./FolderList";
import { Greeting } from "./Greeting";
import { MobileFooter } from "./MobileFooter";
import { PreviousWorkout } from "./PreviousWorkout";
import SelectFolderModal from "./SelectFolderModal";
import { DashboardClientProps } from "@/types/types";
const Header = dynamic(() => import("@/app/components/Header"), { ssr: false });

export default function Dashboard({
  initialFolders,
  initialRoutines,
}: DashboardClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const router = useRouter();

  // Handle successful folder creation
  const handleFolderCreated = () => {
    setIsCreateModalOpen(false);
    router.refresh();
  };

  const hasContent = initialFolders.length > 0 || initialRoutines.length > 0;

  return (
    <div className="flex min-h-full w-full justify-center gap-4">
      <div className="flex h-full w-full flex-col justify-center gap-8 p-4">
        <Greeting />
        {hasContent ? (
          <>
            {/* <PreviousWorkout /> */}
            <div className="flex h-full flex-col pb-20">
              {/* Folders section */}
              <div className="flex flex-col justify-start gap-4">
                <div className="flex items-center justify-center gap-2 py-8 md:flex-row">
                  <Button
                    className="text-background"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <BsCollectionFill /> New Program
                  </Button>
                  <Button
                    className="text-background"
                    onClick={() => setIsSelectModalOpen(true)}
                  >
                    <FaDumbbell /> New Routine
                  </Button>
                </div>
                Programs and Routines
                <div>
                  <FolderList
                    folders={initialFolders}
                    routines={initialRoutines}
                    onFolderDeleted={() => router.refresh()}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            onCreateFolder={() => setIsCreateModalOpen(true)}
            onCreateRoutine={() => setIsSelectModalOpen(true)}
          />
        )}

        {isCreateModalOpen && (
          <CreateFolderModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleFolderCreated}
          />
        )}
        {isSelectModalOpen && (
          <SelectFolderModal
            isOpen={isSelectModalOpen}
            onClose={() => setIsSelectModalOpen(false)}
            folders={initialFolders}
          />
        )}
      </div>
    </div>
  );
}
