"use client";

import { useSearchParams } from "next/navigation";
import SaveHeader from "@/app/components/SaveHeader";
import SecondaryButton from "@/app/components/SecondaryButton";
import { IoMdAddCircleOutline } from "react-icons/io";

export default function Routine() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");

  return (
    <div className="flex min-h-screen w-96 flex-col gap-4 border border-red-500">
      <SaveHeader title={"Create Routine"} button={"Cancel"} />
      <div>
        <form className="px-2">
          <input
            className="h-10 w-full border-b-2 border-accent bg-transparent px-4"
            name="routine"
            type="text"
            placeholder="Routine Name"
          ></input>
        </form>
      </div>
      <div className="flex w-full justify-center">
        <div className="w-3/4">
          <SecondaryButton
            icon={<IoMdAddCircleOutline />}
            label={"Add Exercises"}
          />
        </div>
      </div>
    </div>
  );
}
