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
  const [startTime] = useState<number>(Date.now());
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

  // Initialize and play chime sound
  const [audio] = useState(() => {
    if (typeof window !== "undefined") {
      const sound = new Audio("/boxing-bell.mp3");
      sound.preload = "auto";
      // Enable playing on mobile
      const enableAudio = () => {
        sound.play().catch((error) => console.log("Audio play failed:", error));
        document.removeEventListener("touchstart", enableAudio);
      };
      document.addEventListener("touchstart", enableAudio);
      return sound;
    }
    return null;
  });

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const playChime = () => {
    // Try to play audio
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.log("Failed to play audio:", error);
      });
    }

    // Trigger vibration if supported
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]); // Vibrate-pause-vibrate pattern
    }

    // Show system notification if permitted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Rest Period Complete", {
        body: "Time to start your next set!",
        icon: "/favicon.ico", // Make sure you have a favicon
      });
    }
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
    <div className="flex min-h-screen w-full max-w-3xl flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-primary p-4">
        <div className="flex w-full items-center justify-between">
          {/* Duration Time */}
          <div className="min-w-20">
            <div className="text-sm text-dimmed">Duration</div>
            <div className="text-accent">{formatTime(elapsedTime)}</div>
          </div>

          {/* Rest Time */}
          <div className="min-w-20 text-center">
            <div className="text-sm text-dimmed">Rest Time</div>
            <div className="text-2xl font-bold text-accent">
              {isResting ? `${currentRestTime}s` : `${restTime}s`}
            </div>
          </div>

          {/* Finish Button */}
          <div className="min-w-20 text-right">
            <button
              className="rounded-lg bg-accent px-4 py-2"
              onClick={onFinish}
            >
              Finish
            </button>
          </div>
        </div>
      </header>
      <main className="flex w-full justify-center p-4">{children}</main>
    </div>
  );
}
