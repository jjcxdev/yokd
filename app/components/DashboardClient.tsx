"use client";

import PrimaryButton from "@/app/components/PrimaryButton";
import RoutineCard from "@/app/components/RoutineCard";
import CreateFolderModal from "@/app/components/CreateFolderModal";
import SelectFolderModal from "./SelectFolderModal";
import { VscNewFolder } from "react-icons/vsc";
import { MdFormatListBulletedAdd } from "react-icons/md";
import { GoKebabHorizontal } from "react-icons/go";
import { useState } from "react";
import { Folders } from "@/types/folders";
import FolderList from "./FolderList";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("@/app/components/Header"), { ssr: false });

interface DashboardClientProps {
  initialFolders: Folders[];
}

export default function Dashboard({ initialFolders }: DashboardClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);

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
        <FolderList folders={initialFolders} />
      </div>
      <div>
        <RoutineCard
          icon={<GoKebabHorizontal />}
          label="1/2 Back & Biceps"
          desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, ex eget gravida maximus, nulla odio condimentum magna, ac venenatis ex tellus vel diam"
        />
      </div>
      {isCreateModalOpen && (
        <CreateFolderModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
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
