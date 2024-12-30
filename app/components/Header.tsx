"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";

export default function Header() {
  return (
    <div className="flex items-center justify-between bg-card p-4 md:rounded-t-lg md:p-10">
      <div className="flex items-center gap-4">
        <h1 className="font-helvob text-4xl">YOKD</h1>
      </div>

      <div className="flex align-middle">
        <UserButton />
      </div>
    </div>
  );
}
