"use client";

import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { SessionLayoutProps } from "@/types/types";

export default function SessionLayout({
  onCancel,
  onFinish,
  restTime,
  isResting,
  onRestTimerComplete,
  children,
}: SessionLayoutProps): JSX.Element {
  const [startTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentRestTime, setCurrentRestTime] = useState<number>(restTime);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioInitialized = useRef<boolean>(false);

  // Session duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Initialize audio only once and only after user interaction
  useEffect(() => {
    const initializeAudio = () => {
      if (!isAudioInitialized.current && typeof window !== "undefined") {
        audioRef.current = new Audio("/boxing-bell.mp3");
        audioRef.current.preload = "auto";
        isAudioInitialized.current = true;
        // Remove the event listener once audio is initialized
        document.removeEventListener("touchstart", initializeAudio);
        document.removeEventListener("click", initializeAudio);
      }
    };

    // Add listeners for both touch and click events
    document.addEventListener("touchstart", initializeAudio);
    document.addEventListener("click", initializeAudio);

    return () => {
      document.removeEventListener("touchstart", initializeAudio);
      document.removeEventListener("click", initializeAudio);
    };
  }, []);

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

  // Rest current rest time when rest timer changes
  useEffect(() => {
    setCurrentRestTime(restTime);
  }, [restTime]);

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const playChime = () => {
    // Only play audio if it's initialized
    if (audioRef.current && isAudioInitialized.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
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
    <div className="flex min-h-screen w-full max-w-5xl flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
        <div className="flex w-full flex-col items-center gap-2">
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

            <div className="flex flex-col justify-center">
              <Button onClick={onFinish}>Finish</Button>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-full rounded-md bg-destructive text-xs text-destructive-foreground"
          >
            Cancel Workout
          </button>
        </div>
      </header>
      <main className="flex w-full justify-center p-4">{children}</main>
    </div>
  );
}
