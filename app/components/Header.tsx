"use client";

import { UserButton } from "@clerk/nextjs";
import React, { Suspense } from "react";

export default function Header() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="font-helvob text-4xl">YOKD</h1>
      <div className="flex align-middle">
        <UserButton />
      </div>
    </div>
  );
}
