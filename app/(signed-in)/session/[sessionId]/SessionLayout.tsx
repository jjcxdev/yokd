"use client";

import React, { useEffect, useState } from "react";

interface SessionLayoutProps {
  onFinish: () => void;
  restTime: number;
  isResting: boolean;
  onRestTimerComplete: () => void;
  children: React.ReactNode;
}

export default function SessionLayout({
  onFinish,
  restTime,
  isResting,
  onRestTimerComplete,
  children,
}: SessionLayoutProps): JSX.Element {
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentRestTime, setCurrentRestTime] = useState<number>(restTime);

  // Session duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Rest timer
  useEffect(() => {
    let restTimer: NodeJS.Timeout;
    if (isResting) {
      setCurrentRestTime(restTime);
      restTimer = setInterval(() => {
        setCurrentRestTime((prev) => {
          if (prev <= 1) {
            clearInterval(restTimer);
            onRestTimerComplete();
            playChime();
            return restTime;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restTimer);
  }, [isResting, restTime, onRestTimerComplete]);

  // Reset current rest time when rest timer changes
  useEffect(() => {
    setCurrentRestTime(restTime);
  }, [restTime]);

  // Play chime sound
  const playChime = () => {
    const audio = new Audio("/boxing-bell.mp3");
    audio.play();
  };

  const formatTime = (time: number) => {
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    console.log("Rest Time:", restTime);
    console.log("Current Rest Time:", currentRestTime);
    console.log("Is Resting:", isResting);
  }, [restTime, currentRestTime, isResting]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-primary p-4">
        <div>
          <div className="text-sm text-dimmed">Duration</div>
          <div className="text-accent">{formatTime(elapsedTime)}</div>
        </div>
        <div>
          <div className="text-sm text-dimmed">Rest Time</div>
          <div className="text-accent">
            {isResting ? `${currentRestTime}s` : `${restTime}s`}
          </div>
        </div>
        <button className="rounded-lg bg-accent px-4 py-2" onClick={onFinish}>
          Finish
        </button>
      </header>
      <main className="flex-grow p-4">{children}</main>
    </div>
  );
}
