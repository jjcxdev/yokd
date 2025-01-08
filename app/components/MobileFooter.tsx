"use client";

import { UserButton } from "@clerk/nextjs";
import { MdDashboard } from "react-icons/md";
import { FaDumbbell } from "react-icons/fa6";

export function MobileFooter() {
  return (
    <div className="flex w-full items-center justify-around pb-2">
      <button className="rounded-full p-[10px] text-2xl focus:bg-accent focus:text-background">
        <a href="/">
          <MdDashboard />
        </a>
      </button>
      {/* <button className="rounded-full p-[10px] text-2xl focus:bg-accent focus:text-background">
        <FaDumbbell />
      </button> */}
      <button className="flex items-center">
        <UserButton />
      </button>
    </div>
  );
}
