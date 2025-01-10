"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BsCollectionFill } from "react-icons/bs";
import { FaDumbbell } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import CreateFolderModal from "@/app/components/CreateFolderModal";
import type { RoutineWithExercises } from "@/lib/db/schema";
import type { Folders } from "@/types/types";

import EmptyState from "./EmptyState";
import FolderList from "./FolderList";
import SelectFolderModal from "./SelectFolderModal";
import { MobileFooter } from "./MobileFooter";
import { Greeting } from "./Greeting";
import { PreviousWorkout } from "./PreviousWorkout";

const Header = dynamic(() => import("@/app/components/Header"), { ssr: false });

interface DashboardClientProps {
  initialFolders: Folders[];
  initialRoutines: RoutineWithExercises[];
}

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
    <div className="container min-h-full gap-4">
      <header className="sticky top-0 z-10 hidden w-full border-b-[1px] border-accent/30 md:flex">
        <Header />
      </header>
      <div className="flex h-full flex-col gap-8 p-4">
        <Greeting />
        {hasContent ? (
          <>
            {/* <PreviousWorkout /> */}
            <div className="flex h-full flex-col justify-between pb-20">
              {/* Folders section */}
              <div className="flex flex-col gap-4">
                Choose Routine
                <div>
                  <FolderList
                    folders={initialFolders}
                    routines={initialRoutines}
                    onFolderDeleted={() => router.refresh()}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 md:flex-row">
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
