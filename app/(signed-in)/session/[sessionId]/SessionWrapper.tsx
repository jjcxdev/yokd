"use client";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

import { completeWorkoutSession } from "@/app/actions/workout";
import { SessionContext } from "./SessionContext";

import SessionLayout from "./SessionLayout";

interface SessionWrapperProps {
  children: React.ReactNode;
  sessionId: string;
}

export default function SessionWrapper({
  children,
  sessionId,
}: SessionWrapperProps): JSX.Element {
  const router = useRouter();
  const [restTime, setRestTime] = useState(30);
  const [isResting, setIsResting] = useState(false);

  const handleFinish = useCallback(() => {
    if (window.confirm("Are you sure you want to finish the session?")) {
      completeWorkoutSession(sessionId)
        .then(() => {
          router.push("/dashboard");
        })
        .catch((error) => {
          console.error("Error completing workout:", error);
          alert("Failed to complete workout. Please try again.");
        });
    }
  }, [router, sessionId]);

  const handleRestTimer = useCallback((time: number) => {
    setRestTime(time);
    setIsResting(true);
  }, []);

  const handleRestComplete = useCallback(() => {
    setIsResting(false);
  }, []);

  return (
    <SessionContext.Provider value={{ onRestTimeTrigger: handleRestTimer }}>
      <SessionLayout
        onFinish={handleFinish}
        restTime={restTime}
        isResting={isResting}
        onRestTimerComplete={handleRestComplete}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                onRestTimeTrigger: handleRestTimer,
              } as any)
            : child,
        )}
      </SessionLayout>
    </SessionContext.Provider>
  );
}
