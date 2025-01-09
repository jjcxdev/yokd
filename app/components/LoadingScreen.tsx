"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import YokdLogo from "@/app/yokdlogo.svg";

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      className={`fixed inset-0 flex items-center justify-center bg-accent transition-opacity duration-300 ${isVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
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
