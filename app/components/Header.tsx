"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";

import YokdLogo from "@/app/favicon.svg";

import UserName from "./UserName";

export default function Header() {
  return (
    <div className="relative flex w-full items-center justify-between bg-card/50 p-4 md:p-10">
      <div className="absolute inset-0 bg-card/50 blur-sm"></div>

      <div className="relative z-50 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            className="z-100 rounded-sm"
            src={YokdLogo}
            alt="YOKD Logo"
            width={40}
            height={40}
          />
          {/* <h1 className="font-helvob text-3xl">YOKD</h1> */}
        </div>

        <div className="flex gap-2 align-middle">
          <UserName />
          <UserButton />
        </div>
      </div>
    </div>
  );
}
