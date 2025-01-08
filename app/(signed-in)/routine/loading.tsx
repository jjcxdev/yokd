"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import YokdLogo from "@/app/yokdlogo.svg";

export default function Loading() {
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldShow) {
    return null;
  }

  return (
    <main className="flex min-h-screen w-screen items-center justify-center bg-accent">
      <Image
        className="animate-pulse"
        src={YokdLogo}
        alt="Yokd Logo"
        width={100}
        height={100}
      />
    </main>
  );
}
