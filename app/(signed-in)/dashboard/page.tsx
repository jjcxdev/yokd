import PrimaryButton from "@/app/components/PrimaryButton";
import FolderToggle from "@/app/components/FolderToggle";
import RoutineCard from "@/app/components/RoutineCard";
import Header from "@/app/components/Header";
import { VscNewFolder } from "react-icons/vsc";
import { MdFormatListBulletedAdd } from "react-icons/md";
import { GoKebabHorizontal } from "react-icons/go";
import { TbLayoutNavbarExpandFilled } from "react-icons/tb";

export default function Dashboard() {
  return (
    <div className="flex w-96 flex-col gap-4 border border-red-500 p-4">
      <header>
        <Header />
      </header>
      <div className="flex justify-between gap-4">
        <PrimaryButton label="New Folder" icon={<VscNewFolder size={22} />} />
        <PrimaryButton
          label="New Routine"
          icon={<MdFormatListBulletedAdd size={22} />}
        />
      </div>
      <div>
        <FolderToggle
          label="Week 1/2"
          count="(4)"
          folderIcon={<TbLayoutNavbarExpandFilled />}
          menuIcon={<GoKebabHorizontal />}
        />
      </div>
      <div>
        <RoutineCard
          icon={<GoKebabHorizontal />}
          label="1/2 Back & Biceps"
          desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, ex eget gravida maximus, nulla odio condimentum magna, ac venenatis ex tellus vel diam"
        />
      </div>
    </div>
  );
}
