"use client";

import { UserButton } from "@clerk/nextjs";
import React from "react";
import UserName from "./UserName";

export default function Header() {
  return (
    <div className="flex w-full items-center justify-between bg-card p-4 md:p-10">
      <div className="flex items-center gap-4">
        <h1 className="font-helvob text-4xl">YOKD</h1>
      </div>

      <div className="flex align-middle">
        <UserName />
        <UserButton />
      </div>
    </div>
  );
}
