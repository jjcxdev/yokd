import PrimaryButton from "@/app/components/PrimaryButton";
import { VscNewFolder } from "react-icons/vsc";
import { MdFormatListBulletedAdd } from "react-icons/md";

export default function Dashboard() {
  return (
    <div className="w-96 border border-red-500 p-2">
      <div className="flex justify-around gap-4">
        <PrimaryButton label="New Folder" icon={<VscNewFolder size={22} />} />
        <PrimaryButton
          label="New Routine"
          icon={<MdFormatListBulletedAdd size={22} />}
        />
      </div>
    </div>
  );
}
