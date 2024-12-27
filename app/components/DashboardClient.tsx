"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoKebabHorizontal } from "react-icons/go";
import { MdFormatListBulletedAdd } from "react-icons/md";
import { VscNewFolder } from "react-icons/vsc";

import CreateFolderModal from "@/app/components/CreateFolderModal";
import PrimaryButton from "@/app/components/PrimaryButton";
import RoutineCard from "@/app/components/RoutineCard";
import type { Plan, PlanWithExercises } from "@/lib/db/schema";
import type { Folders } from "@/types/folders";

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

  return (
    <div className="flex min-h-screen w-96 flex-col gap-4 border border-red-500 p-4">
      <header>
        <Header />
      </header>
      <div className="flex justify-between gap-4">
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
      <div>
        <FolderList
          folders={initialFolders}
          plans={initialPlans}
          onFolderDeleted={() => router.refresh()}
        />
      </div>
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
  );
}
