"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { MdFormatListBulletedAdd } from "react-icons/md";
import { VscNewFolder } from "react-icons/vsc";

import CreateFolderModal from "@/app/components/CreateFolderModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import type { RoutineWithExercises } from "@/lib/db/schema";
import type { Folders } from "@/types/types";

import EmptyState from "./EmptyState";
import FolderList from "./FolderList";
import SelectFolderModal from "./SelectFolderModal";

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
    <div className="container flex min-h-full flex-col gap-4 bg-background">
      <header className="sticky top-0 z-10 flex w-full border-b-[1px] border-accent/30">
        <Header />
      </header>
      <div className="flex flex-col gap-8 p-4">
        {hasContent ? (
          <>
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <PrimaryButton
                label="New Folder"
                icon={<VscNewFolder size={22} />}
                onClick={() => setIsCreateModalOpen(true)}
              />
              <PrimaryButton
                label="New Routine"
                icon={<MdFormatListBulletedAdd size={22} />}
                onClick={() => setIsSelectModalOpen(true)}
              />
            </div>

            {/* Folders section */}
            <div>
              <FolderList
                folders={initialFolders}
                routines={initialRoutines}
                onFolderDeleted={() => router.refresh()}
              />
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
