"use client";

import React, { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";

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
