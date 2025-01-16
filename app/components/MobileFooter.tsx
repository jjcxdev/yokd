"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";
import { FaDumbbell } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";

import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";

const ClientUserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => <Skeleton className="h-10 w-10 rounded-full" />,
  },
);

export function MobileFooter() {
  return (
    <div className="flex w-full items-center justify-around pb-2">
      <SidebarTrigger />
      <Link
        href="/"
        className="rounded-full p-[10px] text-2xl focus:bg-accent focus:text-background"
      >
        <MdDashboard />
      </Link>

      {/* <button className="rounded-full p-[10px] text-2xl focus:bg-accent focus:text-background">
        <FaDumbbell />
      </button> */}
      <button className="flex items-center">
        <ClientUserButton />
      </button>
    </div>
  );
}
