"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdFormatListBulletedAdd } from "react-icons/md";
import { VscNewFolder } from "react-icons/vsc";

import CreateFolderModal from "@/app/components/CreateFolderModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import type { PlanWithExercises } from "@/lib/db/schema";
import type { Folders } from "@/types/types";

import EmptyState from "./EmptyState";
import FolderList from "./FolderList";
import SelectFolderModal from "./SelectFolderModal";

const Header = dynamic(() => import("@/app/components/Header"), { ssr: false });

interface DashboardClientProps {
  initialFolders: Folders[];
  initialPlans: PlanWithExercises[];
}

export default function Dashboard({
  initialFolders,
  initialPlans,
}: DashboardClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const router = useRouter();

  // Handle successful folder creation
  const handleFolderCreated = () => {
    setIsCreateModalOpen(false);
    router.refresh();
  };

  const hasContent = initialFolders.length > 0 || initialPlans.length > 0;

  return (
    <div className="max-w-1/2 flex min-h-screen w-full flex-col gap-4 bg-background md:rounded-lg">
      <header className="border-b-[1px] border-accent/30">
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
                plans={initialPlans}
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
