"use client";

import React, { useEffect, useState } from "react";

interface SessionLayoutProps {
  onFinish: () => void;
  children: React.ReactNode;
}

export default function SessionLayout({
  onFinish,
  children,
}: SessionLayoutProps): JSX.Element {
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (time: number) => {
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-primary p-4">
        <div>
          <div className="text-sm text-dimmed">Duration</div>
          <div className="text-accent">{formatTime(elapsedTime)}</div>
        </div>
        <button className="rounded-lg bg-accent px-4 py-2" onClick={onFinish}>
          Finish
        </button>
      </header>
      <main className="flex-grow p-4">{children}</main>
    </div>
  );
}
